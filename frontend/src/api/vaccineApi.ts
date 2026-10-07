import { request, unwrap } from '../utils/request';
import type { VaccineRecord } from '../types/vaccine';
import { mockVaccines } from '../utils/mockData';

export const vaccineApi = {
  list: (params?: { petId?: string }) => unwrap<VaccineRecord[]>(request.get('/vaccines', { params }), mockVaccines),
  /** 标记接种完成，可传本次实际接种日；后端会自动排下一条待接种计划 */
  complete: (id: string, administeredDate?: string) =>
    request.patch(`/vaccines/${id}/complete`, administeredDate ? { administeredDate } : {}),
};
