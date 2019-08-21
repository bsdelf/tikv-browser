import React from 'react';
import { Select } from 'antd';
import { useLocalStore, observer } from 'mobx-react-lite';

const { Option } = Select;

export interface Encoding {
  name: string;
  value: string;
  placeholder: string;
}

export interface EncodingSelectProps {
  defaultEncoding: string;
  onSelect?: (encoding: Encoding) => any;
}

export const encodings: Encoding[] = [
  {
    name: 'utf8',
    value: 'utf8',
    placeholder: 'Input a human readable utf8 string here.',
  },
  {
    name: 'hex',
    value: 'hex',
    placeholder: 'Input a hex encoded string here.',
  },
  {
    name: 'base64',
    value: 'base64',
    placeholder: 'Input a base64 encoded string here.',
  },
];

export const EncodingSelect = observer((props: EncodingSelectProps) => {
  const store = useLocalStore(() => ({
    value: props.defaultEncoding,
  }));
  const onSelect = (value: string) => {
    store.value = value;
    const item = encodings.find(item => item.value === value);
    if (item && typeof props.onSelect === 'function') {
      props.onSelect(item);
    }
  };
  return (
    <Select defaultValue={props.defaultEncoding} value={store.value} onSelect={onSelect}>
      {encodings.map(item => (
        <Option value={item.value} key={item.value}>
          {item.name}
        </Option>
      ))}
    </Select>
  );
});

export default { encodings, EncodingSelect };
