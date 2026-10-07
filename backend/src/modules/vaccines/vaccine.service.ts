import { Injectable } from '@nestjs/common';
import { UserRole, VaccineStatus } from '../../constants/enums';
import { BusinessException } from '../../exceptions/business.exception';
import { addMonths } from '../../utils/date';
import { CreateVaccineDto, UpdateVaccineDto } from './vaccine.dto';
import { VaccineRepository } from './vaccine.repository';
import { getRevaccinationIntervalMonths } from './vaccine.schedule';
import { normalizeVaccineStatus } from './vaccine.validator';

@Injectable()
export class VaccineService {
  constructor(private readonly repo: VaccineRepository) {}

  async list(user: { sub: string; role: UserRole }, petId?: string) {
    await this.repo.markDueAsOverdue(new Date());
    return this.repo.findMany(user, petId);
  }

  async create(dto: CreateVaccineDto) {
    const status = normalizeVaccineStatus(dto.status, dto.nextDueDate);
    await this.assertNoUnfinishedPlan(dto.petId, dto.vaccineName);
    return this.repo.create({
      ...dto,
      batchNo: dto.batchNo ?? '',
      status,
      administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : null,
      nextDueDate: new Date(dto.nextDueDate),
    });
  }

  /**
   * 标记完成：
   * 1. 本条状态置为已接种，记录本次实际接种日；
   * 2. 同一宠物 + 同一种疫苗若没有其他未完成计划，自动排下一条待接种计划；
   * 3. 下一条到期日 = 本次实际接种日 + 续种间隔（狂犬 1 年 / 其他半年）。
   */
  async complete(id: string, dto?: { administeredDate?: string }) {
    return this.repo.runInTransaction(async (tx) => {
      const record = await this.repo.findById(id, tx);
      if (!record) throw new BusinessException('疫苗记录不存在');

      // 已接种的旧记录保留为历史，重复标记不重复排期
      if (record.status === VaccineStatus.COMPLETED) return record;

      const administeredDate = dto?.administeredDate ? new Date(dto.administeredDate) : new Date();
      const completed = await this.repo.update(id, { status: VaccineStatus.COMPLETED, administeredDate }, tx);

      const existing = await this.repo.findUnfinishedByPetAndVaccine(record.petId, record.vaccineName, id, tx);
      if (!existing) {
        const intervalMonths = getRevaccinationIntervalMonths(record.vaccineName);
        await this.repo.create(
          {
            petId: record.petId,
            vaccineName: record.vaccineName,
            batchNo: '',
            administeredDate: null,
            nextDueDate: addMonths(administeredDate, intervalMonths),
            vetId: record.vetId,
            status: VaccineStatus.PENDING,
          },
          tx,
        );
      }
      return completed;
    });
  }

  async update(id: string, dto: UpdateVaccineDto) {
    const status = normalizeVaccineStatus(dto.status, dto.nextDueDate);
    if (status !== VaccineStatus.COMPLETED) {
      await this.assertNoUnfinishedPlan(dto.petId, dto.vaccineName, id);
    }
    return this.repo.update(id, {
      ...dto,
      batchNo: dto.batchNo ?? '',
      status,
      administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : null,
      nextDueDate: new Date(dto.nextDueDate),
    });
  }

  /** 同一宠物同一种疫苗只能有一条未完成计划，旧的已接种记录不受影响 */
  private async assertNoUnfinishedPlan(petId: string, vaccineName: string, excludeId?: string) {
    const unfinished = await this.repo.findUnfinishedByPetAndVaccine(petId, vaccineName, excludeId);
    if (unfinished) {
      throw new BusinessException(`${vaccineName} 已存在未完成的接种计划，请勿重复排期`);
    }
  }
}
