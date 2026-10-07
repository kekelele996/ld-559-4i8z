/**
 * 续种间隔规则：
 * - 狂犬疫苗：距「本次实际接种日」1 年
 * - 其他疫苗：距「本次实际接种日」半年（6 个月）
 *
 * 注意：下一条到期日按【本次实际接种日】往后推，不按原计划到期日推，
 * 晚打/拖打天数不累积到下一周期。
 */
export const RABIES_VACCINE_INTERVAL_MONTHS = 12;
export const OTHER_VACCINE_INTERVAL_MONTHS = 6;

const RABIES_KEYWORDS = ['狂犬', 'rabies'];

/** 判断某条疫苗是否为狂犬疫苗（按疫苗名称匹配） */
export function isRabiesVaccine(vaccineName: string): boolean {
  const name = vaccineName.toLowerCase();
  return RABIES_KEYWORDS.some((keyword) => name.includes(keyword.toLowerCase()));
}

/** 续种间隔（月）：狂犬 12 个月，其他 6 个月 */
export function getRevaccinationIntervalMonths(vaccineName: string): number {
  return isRabiesVaccine(vaccineName)
    ? RABIES_VACCINE_INTERVAL_MONTHS
    : OTHER_VACCINE_INTERVAL_MONTHS;
}
