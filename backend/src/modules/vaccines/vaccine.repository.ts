import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRole, VaccineStatus } from '../../constants/enums';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VaccineRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(user: { sub: string; role: UserRole }, petId?: string) {
    const where: Prisma.VaccineRecordWhereInput = {
      ...(user.role === UserRole.PET_OWNER ? { pet: { ownerId: user.sub } } : {}),
      ...(petId ? { petId } : {}),
    };
    return this.prisma.vaccineRecord.findMany({ where, include: { pet: true, vet: true }, orderBy: { nextDueDate: 'asc' } });
  }

  findById(id: string, tx?: Prisma.TransactionClient) {
    return (tx ?? this.prisma).vaccineRecord.findUnique({ where: { id }, include: { pet: true, vet: true } });
  }

  /** 同一只宠物、同一种疫苗名下是否还有未完成（待接种/已过期）的计划 */
  findUnfinishedByPetAndVaccine(petId: string, vaccineName: string, excludeId?: string, tx?: Prisma.TransactionClient) {
    return (tx ?? this.prisma).vaccineRecord.findFirst({
      where: {
        petId,
        vaccineName,
        status: { in: [VaccineStatus.PENDING, VaccineStatus.OVERDUE] },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      orderBy: { nextDueDate: 'asc' },
    });
  }

  create(data: Prisma.VaccineRecordUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? this.prisma).vaccineRecord.create({ data });
  }

  update(id: string, data: Prisma.VaccineRecordUncheckedUpdateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? this.prisma).vaccineRecord.update({ where: { id }, data });
  }

  /** 将已到期但仍为待接种的计划批量置为已过期 */
  markDueAsOverdue(now: Date, tx?: Prisma.TransactionClient) {
    return (tx ?? this.prisma).vaccineRecord.updateMany({
      where: { status: VaccineStatus.PENDING, nextDueDate: { lt: now } },
      data: { status: VaccineStatus.OVERDUE },
    });
  }

  runInTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(callback);
  }
}
