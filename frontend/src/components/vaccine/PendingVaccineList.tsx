import { Card, Empty, List, Tag } from 'antd';
import type { VaccineRecord } from '../../types/vaccine';
import { StatusBadge } from '../common/StatusBadge';
import { CompleteVaccineButton } from './CompleteVaccineButton';
import { formatDate } from '../../utils/format';
import dayjs from 'dayjs';
import { VaccineStatus } from '../../constants/enums';

interface Props {
  records: VaccineRecord[];
}

/** 待接种提醒列表：只展示未完成（待接种/已过期）计划，已完成记录留档不出现在此 */
export function PendingVaccineList({ records }: Props) {
  const pending = records
    .filter((item) => item.status !== VaccineStatus.COMPLETED)
    .sort((a, b) => dayjs(a.nextDueDate).valueOf() - dayjs(b.nextDueDate).valueOf());

  return (
    <Card title="待接种提醒（未完成计划，完成后自动排下一条）">
      {pending.length === 0 ? (
        <Empty description="暂无待接种计划" />
      ) : (
        <List
          dataSource={pending}
          renderItem={(item) => {
            const overdueDays = item.status === VaccineStatus.OVERDUE
              ? dayjs().startOf('day').diff(dayjs(item.nextDueDate).startOf('day'), 'day')
              : 0;
            return (
              <List.Item actions={[<CompleteVaccineButton key="complete" record={item} />]}>
                <List.Item.Meta
                  title={
                    <>
                      {item.pet?.name ? `${item.pet.name} · ` : ''}{item.vaccineName}
                      {overdueDays > 0 && <Tag color="red" style={{ marginLeft: 8 }}>已拖打 {overdueDays} 天</Tag>}
                    </>
                  }
                  description={`应种/到期日：${formatDate(item.nextDueDate)}`}
                />
                <StatusBadge status={item.status} />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
}
