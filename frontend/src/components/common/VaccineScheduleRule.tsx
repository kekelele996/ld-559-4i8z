import { Alert, Typography } from 'antd';
import { VACCINE_SCHEDULE_RULE_TEXT } from '../../constants/vaccineRules';

/** 续种排期规则说明（疫苗管理页、宠物详情疫苗日历共用） */
export function VaccineScheduleRule() {
  return (
    <Alert
      type="info"
      showIcon
      message="续种排期规则"
      description={
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {VACCINE_SCHEDULE_RULE_TEXT}
        </Typography.Paragraph>
      }
    />
  );
}
