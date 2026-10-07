import { Card, Space, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { vaccineApi } from '../api/vaccineApi';
import { VaccineCalendar } from '../components/common/VaccineCalendar';
import { VaccineScheduleRule } from '../components/common/VaccineScheduleRule';
import { CompletedVaccineTable } from '../components/vaccine/CompletedVaccineTable';
import { PendingVaccineList } from '../components/vaccine/PendingVaccineList';

export default function VaccineManagement() {
  const { data = [] } = useQuery({ queryKey: ['vaccines'], queryFn: () => vaccineApi.list() });

  return (
    <Space direction="vertical" size={20} className="page-block">
      <Typography.Title level={2}>疫苗管理</Typography.Title>
      <VaccineScheduleRule />
      <Card title="接种计划日历（仅未完成计划）">
        <VaccineCalendar records={data} />
      </Card>
      <PendingVaccineList records={data} />
      <CompletedVaccineTable records={data} />
    </Space>
  );
}
