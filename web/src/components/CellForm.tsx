import React from 'react';
import { Input, Form, Select } from 'antd';
import { autorun, runInAction } from 'mobx';
import { observer, useLocalStore } from 'mobx-react-lite';
import { Connection } from '../store';
import { HumanReadableData } from '../utils';

interface CellFormProps {
  connection: Connection;
  style?: React.CSSProperties;
}

const { Option } = Select;

const decoderSelectOptions = [
  { name: 'hexdump', value: 'hexdump' },
  { name: 'utf8', value: 'utf8' },
  { name: 'hex', value: 'hex' },
  { name: 'base64', value: 'base64' },
];

const defaultDecoderSelectOption = decoderSelectOptions[0];

export const CellForm = observer((props: CellFormProps) => {
  const store = useLocalStore(() => {
    autorun(() => {
      const cell = props.connection.cell;
      if (!cell.name) {
        runInAction(() => {
          store.value = '';
        });
        return;
      }
      const data = new HumanReadableData({ data: cell.data, encoding: store.encoding });
      const text = `${cell.name}: ${cell.data.length} bytes\n\n${data.text}`;
      runInAction(() => {
        store.value = text;
      });
    });
    return { value: '', encoding: defaultDecoderSelectOption.name };
  });
  const display = props.connection.rows.length > 0 ? 'block' : 'none';
  const formItemLayout = {
    labelCol: {
      span: 0,
    },
    wrapperCol: {
      span: 24,
    },
  };
  const DecoderSelect = observer(() => {
    const onChange = (name: string) => {
      runInAction(() => {
        store.encoding = name;
      });
    };
    return (
      <Select
        defaultValue={defaultDecoderSelectOption.name}
        value={store.encoding}
        onChange={onChange}
      >
        {decoderSelectOptions.map(item => (
          <Option key={item.name} value={item.name}>
            {item.value}
          </Option>
        ))}
      </Select>
    );
  });
  return (
    <Form style={{ display, ...props.style }} labelAlign="left">
      <Form.Item label="" style={{ marginBottom: 12 }} {...formItemLayout}>
        <div style={{ width: '100%', display: 'flex' }}>
          <span style={{ float: 'left', color: 'rgba(0,0,0,0.85)', marginRight: 8 }}>Decoder:</span>
          <div style={{ display: 'inline-block', flexGrow: 100 }}>
            <DecoderSelect />
          </div>
        </div>
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Input.TextArea
          style={{
            fontFamily:
              'Consolas,Monaco,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace',
          }}
          rows={11}
          readOnly={true}
          placeholder="click on table cell to show its contents"
          value={store.value}
        ></Input.TextArea>
      </Form.Item>
    </Form>
  );
});

export default CellForm;
