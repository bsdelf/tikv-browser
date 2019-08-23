import React from 'react';
import { Select } from 'antd';
import { runInAction } from 'mobx';
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
    placeholder: 'human readable string',
  },
  {
    name: 'hex',
    value: 'hex',
    placeholder: 'hex encoded string',
  },
  {
    name: 'base64',
    value: 'base64',
    placeholder: 'base64 encoded string',
  },
];

export const EncodingSelect = observer((props: EncodingSelectProps) => {
  const store = useLocalStore(() => ({
    value: props.defaultEncoding,
  }));
  const onSelect = (value: string) => {
    runInAction(() => {
      store.value = value;
    });
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
