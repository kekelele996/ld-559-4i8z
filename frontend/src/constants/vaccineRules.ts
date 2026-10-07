/**
 * 续种间隔规则（与后端 vaccine.schedule.ts 保持一致）：
 * - 狂犬疫苗：距「本次实际接种日」1 年（12 个月）
 * - 其他疫苗：距「本次实际接种日」半年（6 个月）
 *
 * 下一条到期日按【本次实际接种日】往后推，不按原计划到期日推，
 * 晚打/拖打天数不顺延到下一周期。
 */
export const RABIES_VACCINE_INTERVAL_MONTHS = 12;
export const OTHER_VACCINE_INTERVAL_MONTHS = 6;

const RABIES_KEYWORDS = ['狂犬', 'rabies'];

export function isRabiesVaccine(vaccineName: string): boolean {
  const name = vaccineName.toLowerCase();
  return RABIES_KEYWORDS.some((keyword) => name.includes(keyword.toLowerCase()));
}

export function getRevaccinationIntervalMonths(vaccineName: string): number {
  return isRabiesVaccine(vaccineName)
    ? RABIES_VACCINE_INTERVAL_MONTHS
    : OTHER_VACCINE_INTERVAL_MONTHS;
}

export const VACCINE_SCHEDULE_RULE_TEXT =
  '兽医标记完成后，系统会自动安排下一条待接种计划：狂犬每 1 年一次，其他疫苗每半年一次。' +
  '下一条到期日按【本次实际接种日】往后推算，不按原计划到期日推算，拖打天数不顺延。' +
  '同一宠物同一种疫苗已有未完成计划时不会重复排期，历史已接种记录永久保留。';
