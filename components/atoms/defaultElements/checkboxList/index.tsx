import type { GetProp } from 'antd';
import {
  Checkbox,
  Col,
  Row,
} from 'antd';

export const CheckboxList = () => {
  const onChange: GetProp<typeof Checkbox.Group, "onChange"> = () => {};
  return (
    <Checkbox.Group style={{ width: "100%" }} onChange={onChange}>
      <Row>
        <Col span={8}>
          <Checkbox value="A">A</Checkbox>
        </Col>
        <Col span={8}>
          <Checkbox value="B">B</Checkbox>
        </Col>
        <Col span={8}>
          <Checkbox value="C">C</Checkbox>
        </Col>
        <Col span={8}>
          <Checkbox value="D">D</Checkbox>
        </Col>
        <Col span={8}>
          <Checkbox value="E">E</Checkbox>
        </Col>
      </Row>
    </Checkbox.Group>
  );
};
