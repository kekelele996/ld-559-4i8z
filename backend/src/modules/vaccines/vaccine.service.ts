import { Injectable } from '@nestjs/common';
import { UserRole, VaccineStatus } from '../../constants/enums';
import { BusinessException } from '../../exceptions/business.exception';
import { CreateVaccineDto, UpdateVaccineDto } from './vaccine.dto';
import { VaccineRepository } from './vaccine.repository';
import { normalizeVaccineStatus, resolveNextDueDate } from './vaccine.validator';

@Injectable()
export class VaccineService {
  constructor(private readonly repo: VaccineRepository) {}

  list(user: { sub: string; role: UserRole }, petId?: string) {
    return this.repo.findMany(user, petId);
  }

  create(dto: CreateVaccineDto) {
    return this.repo.create({
      ...dto,
      status: normalizeVaccineStatus(dto.status, dto.nextDueDate),
      administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : null,
      nextDueDate: new Date(dto.nextDueDate),
    });
  }

  async complete(id: string) {
    const record = await this.repo.findById(id);
    if (!record) throw new BusinessException('疫苗记录不存在');
    const administeredDate = new Date();
    const completed = await this.repo.update(id, { status: VaccineStatus.COMPLETED, administeredDate });
    // 同一只宠物同一种疫苗已有未完成的计划时，不再重复排期；已接种记录保留
    const openPlan = await this.repo.findOpenPlan(record.petId, record.vaccineName);
    if (!openPlan) {
      await this.repo.create({
        petId: record.petId,
        vaccineName: record.vaccineName,
        batchNo: '',
        vetId: record.vetId,
        administeredDate: null,
        nextDueDate: resolveNextDueDate(record.vaccineName, administeredDate),
        status: VaccineStatus.PENDING,
      });
    }
    return completed;
  }

  update(id: string, dto: UpdateVaccineDto) {
    return this.repo.update(id, {
      ...dto,
      status: normalizeVaccineStatus(dto.status, dto.nextDueDate),
      administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : null,
      nextDueDate: new Date(dto.nextDueDate),
    });
  }
}
