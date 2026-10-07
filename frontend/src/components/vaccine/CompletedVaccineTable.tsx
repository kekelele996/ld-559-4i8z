import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { VaccineRecord } from '../../types/vaccine';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/format';
import { VaccineStatus } from '../../constants/enums';

interface Props {
  records: VaccineRecord[];
}

/** 已接种记录表：只归档已完成的历史接种，待接种计划不混入 */
export function CompletedVaccineTable({ records }: Props) {
  const completed = records.filter((item) => item.status === VaccineStatus.COMPLETED);

  const columns: ColumnsType<VaccineRecord> = [
    { title: '宠物', key: 'pet', render: (_, item) => item.pet?.name || '-' },
    { title: '疫苗', dataIndex: 'vaccineName' },
    { title: '批号', dataIndex: 'batchNo', render: (value: string) => value || '-' },
    { title: '实际接种日', dataIndex: 'administeredDate', render: formatDate },
    { title: '本次到期日', dataIndex: 'nextDueDate', render: formatDate },
    { title: '状态', dataIndex: 'status', render: (value) => <StatusBadge status={value} /> },
  ];

  return (
    <Card title={`已接种记录（历史留档，共 ${completed.length} 条）`}>
      <Table rowKey="id" size="small" pagination={{ pageSize: 8 }} dataSource={completed} columns={columns} />
    </Card>
  );
}
