import { Alert, Button, Card, List, Space, Table, Typography } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vaccineApi } from '../api/vaccineApi';
import { VaccineCalendar } from '../components/common/VaccineCalendar';
import { StatusBadge } from '../components/common/StatusBadge';
import { VaccineStatus } from '../constants/enums';
import { formatDate } from '../utils/format';

export default function VaccineManagement() {
  const client = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['vaccines'], queryFn: () => vaccineApi.list() });
  const complete = useMutation({ mutationFn: vaccineApi.complete, onSettled: () => client.invalidateQueries({ queryKey: ['vaccines'] }) });
  const pending = data.filter((item) => item.status !== VaccineStatus.COMPLETED);
  const completed = data.filter((item) => item.status === VaccineStatus.COMPLETED);
  return (
    <Space direction="vertical" size={20} className="page-block">
      <Typography.Title level={2}>疫苗管理</Typography.Title>
      <Alert
        type="info"
        showIcon
        message="续种计划规则"
        description="标记完成后，系统会为同一只宠物的同一种疫苗自动排下一条待接种计划：狂犬疫苗间隔 1 年，其他疫苗间隔 6 个月。下次到期日按本次实际接种日期往后推算（不按原计划到期日推算）；若该疫苗已有未完成的计划，不会重复排期，已接种记录保留。"
      />
      <Card title="接种计划日历"><VaccineCalendar records={data} /></Card>
      <Card title="待接种提醒">
        <List dataSource={pending} renderItem={(item) => (
          <List.Item actions={[<Button key="done" onClick={() => complete.mutate(item.id)}>标记完成</Button>]}>
            <List.Item.Meta title={`${item.pet?.name || ''} ${item.vaccineName}`} description={`到期日 ${formatDate(item.nextDueDate)}`} />
            <StatusBadge status={item.status} />
          </List.Item>
        )} />
      </Card>
      <Card title="已接种记录">
        <Table rowKey="id" dataSource={completed} columns={[
          { title: '疫苗', dataIndex: 'vaccineName' },
          { title: '批号', dataIndex: 'batchNo' },
          { title: '接种日期', dataIndex: 'administeredDate', render: formatDate },
          { title: '下次到期', dataIndex: 'nextDueDate', render: formatDate },
          { title: '状态', dataIndex: 'status', render: (value) => <StatusBadge status={value} /> },
        ]} />
      </Card>
    </Space>
  );
}
