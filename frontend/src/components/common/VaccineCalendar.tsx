import { Calendar, List } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import type { VaccineRecord } from '../../types/vaccine';
import { VaccineStatus } from '../../constants/enums';
import { StatusBadge } from './StatusBadge';

/** 疫苗日历：只展示未完成（待接种/已过期）计划；已完成记录已留档，不再占据日历 */
export function VaccineCalendar({ records }: { records: VaccineRecord[] }) {
  const plans = records.filter((item) => item.status !== VaccineStatus.COMPLETED);
  const cellRender = (value: Dayjs) => {
    const due = plans.filter((item) => dayjs(item.nextDueDate).isSame(value, 'day'));
    if (!due.length) return null;
    return (
      <List
        size="small"
        dataSource={due}
        renderItem={(item) => (
          <List.Item className="calendar-item">
            {item.pet?.name ? `${item.pet.name} ` : ''}{item.vaccineName}
            <StatusBadge status={item.status} />
          </List.Item>
        )}
      />
    );
  };
  return <Calendar fullscreen={false} cellRender={cellRender} />;
}
