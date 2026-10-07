import { VaccineStatus } from '../../constants/enums';
import { addMonths } from '../../utils/date';

export const RABIES_VACCINE_KEYWORD = '狂犬';
export const RABIES_INTERVAL_MONTHS = 12;
export const DEFAULT_INTERVAL_MONTHS = 6;

export function normalizeVaccineStatus(status: VaccineStatus, nextDueDate: string) {
  if (status === VaccineStatus.COMPLETED) return status;
  return new Date(nextDueDate).getTime() < Date.now() ? VaccineStatus.OVERDUE : status;
}

// 续种到期日按本次实际接种日期往后推算：狂犬疫苗 1 年，其他疫苗 6 个月
export function resolveNextDueDate(vaccineName: string, administeredDate: Date) {
  const months = vaccineName.includes(RABIES_VACCINE_KEYWORD) ? RABIES_INTERVAL_MONTHS : DEFAULT_INTERVAL_MONTHS;
  return addMonths(administeredDate, months);
}
