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

  create(data: Prisma.VaccineRecordUncheckedCreateInput) {
    return this.prisma.vaccineRecord.create({ data });
  }

  findById(id: string) {
    return this.prisma.vaccineRecord.findUnique({ where: { id } });
  }

  findOpenPlan(petId: string, vaccineName: string) {
    return this.prisma.vaccineRecord.findFirst({
      where: { petId, vaccineName, status: { in: [VaccineStatus.PENDING, VaccineStatus.OVERDUE] } },
    });
  }

  update(id: string, data: Prisma.VaccineRecordUncheckedUpdateInput) {
    return this.prisma.vaccineRecord.update({ where: { id }, data });
  }
}
