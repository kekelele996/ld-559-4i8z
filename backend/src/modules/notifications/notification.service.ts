import { Injectable } from '@nestjs/common';
import { VaccineStatus } from '../../constants/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays } from '../../utils/date';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  /** 同一用户同一内容两日内不重复生成提醒，避免每天扫描刷屏 */
  private async createOncePerCycle(userId: string, data: { title: string; content: string; type: string }, now: Date) {
    const exists = await this.prisma.notification.findFirst({
      where: { userId, type: data.type, content: data.content, createdAt: { gte: addDays(now, -2) } },
      select: { id: true },
    });
    if (exists) return;
    await this.prisma.notification.create({ data: { userId, ...data } }).catch(() => undefined);
  }

  async scanAndCreateReminders() {
    const now = new Date();

    // 到点未续种的待接种计划转为已过期，提醒和日历只认当前未完成的那一条
    await this.prisma.vaccineRecord.updateMany({
      where: { status: VaccineStatus.PENDING, nextDueDate: { lt: now } },
      data: { status: VaccineStatus.OVERDUE },
    });

    const upcoming = await this.prisma.vaccineRecord.findMany({
      where: {
        status: { in: [VaccineStatus.PENDING, VaccineStatus.OVERDUE] },
        nextDueDate: { gte: now, lte: addDays(now, 7) },
      },
      include: { pet: true },
    });
    for (const item of upcoming) {
      await this.createOncePerCycle(
        item.pet.ownerId,
        {
          title: '疫苗即将到期',
          content: `${item.pet.name} 的 ${item.vaccineName} 需要续种，到期日 ${item.nextDueDate.toISOString().slice(0, 10)}`,
          type: 'VACCINE',
        },
        now,
      );
    }

    const overdue = await this.prisma.vaccineRecord.findMany({
      where: { status: VaccineStatus.OVERDUE, nextDueDate: { lt: now } },
      include: { pet: true },
    });
    for (const item of overdue) {
      await this.createOncePerCycle(
        item.pet.ownerId,
        {
          title: '疫苗已逾期',
          content: `${item.pet.name} 的 ${item.vaccineName} 已超过应种日期，请尽快安排补种`,
          type: 'VACCINE_OVERDUE',
        },
        now,
      );
    }

    const policies = await this.prisma.insurancePolicy.findMany({
      where: { endDate: { gte: now, lte: addDays(now, 30) } },
      include: { pet: true },
    });
    for (const policy of policies) {
      await this.createOncePerCycle(
        policy.pet.ownerId,
        {
          title: '保单即将续保',
          content: `${policy.pet.name} 的 ${policy.provider} 保单即将到期`,
          type: 'INSURANCE',
        },
        now,
      );
    }
  }
}
