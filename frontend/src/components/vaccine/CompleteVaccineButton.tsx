import { useState } from 'react';
import { Button, DatePicker, Form, Modal, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccineApi } from '../../api/vaccineApi';
import type { VaccineRecord } from '../../types/vaccine';
import { getRevaccinationIntervalMonths, isRabiesVaccine } from '../../constants/vaccineRules';

interface Props {
  record: VaccineRecord;
}

/** 兽医标记某条疫苗完成：选择本次实际接种日后自动排下一条待接种计划 */
export function CompleteVaccineButton({ record }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const client = useQueryClient();

  const complete = useMutation({
    mutationFn: () => vaccineApi.complete(record.id, date.format('YYYY-MM-DD')),
    onSuccess: () => {
      setOpen(false);
      client.invalidateQueries({ queryKey: ['vaccines'] });
    },
  });

  const intervalMonths = getRevaccinationIntervalMonths(record.vaccineName);
  const nextDue = date.add(intervalMonths, 'month');

  return (
    <>
      <Button type="primary" size="small" onClick={() => { setDate(dayjs()); setOpen(true); }}>
        标记完成
      </Button>
      <Modal
        title={`标记 ${record.vaccineName} 接种完成`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => complete.mutate()}
        confirmLoading={complete.isPending}
        okText="确认完成并排下一条"
        cancelText="取消"
      >
        <Form layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="本次实际接种日期" required>
            <DatePicker
              value={date}
              onChange={(value) => value && setDate(value)}
              allowClear={false}
              disabledDate={(current) => current.isAfter(dayjs().endOf('day'))}
            />
          </Form.Item>
        </Form>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
          {isRabiesVaccine(record.vaccineName) ? '狂犬疫苗续种间隔为 1 年' : '该疫苗续种间隔为半年（6 个月）'}，
          下一条到期日按本次实际接种日 {date.format('YYYY-MM-DD')} 往后推，
          不是按原计划到期日 {dayjs(record.nextDueDate).format('YYYY-MM-DD')} 推算，拖打天数不顺延。
        </Typography.Paragraph>
        <Typography.Paragraph strong style={{ marginBottom: 0 }}>
          自动安排的下一条待接种到期日：{nextDue.format('YYYY-MM-DD')}
        </Typography.Paragraph>
      </Modal>
    </>
  );
}
