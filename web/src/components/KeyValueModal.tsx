import React from 'react';
import { Modal, Tabs, Form, Input } from 'antd';
import { observer, useLocalStore } from 'mobx-react-lite';
import { encodings, EncodingSelect, Encoding } from './EncodingSelect';
import { HumanReadableData } from '../utils';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface KeyValueModalStore {
  visiable: boolean;
  key: Uint8Array;
  value: Uint8Array;
}

interface KeyValueModalProps {
  store: KeyValueModalStore;
}

interface DataTabProps {
  data: Uint8Array;
}

const DataTab = observer((props: DataTabProps) => {
  const formItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const store = useLocalStore(() => ({
    value: '',
  }));

  const onEncodingSelect = (encoding: Encoding) => {
    const data = new HumanReadableData({
      data: props.data,
      fromEncoding: encoding.value,
    });
    store.value = data.text;
    console.log('changed', store.value);
  };

  const defaultEncoding = encodings[0];
  onEncodingSelect(defaultEncoding);

  return (
    <Form {...formItemLayout}>
      <Form.Item label="Size" style={{ marginBottom: 12 }}>
        {props.data.length} bytes
      </Form.Item>
      <Form.Item label="Encoding" style={{ marginBottom: 12 }}>
        <EncodingSelect defaultEncoding={defaultEncoding.name} onSelect={onEncodingSelect} />
      </Form.Item>
      <Form.Item label="Contents" style={{ marginBottom: 12 }}>
        <TextArea rows={8} readOnly={true} value={store.value} />
      </Form.Item>
    </Form>
  );
});

export const KeyValueModal = observer((props: KeyValueModalProps) => {
  const onOk = () => {
    props.store.visiable = false;
  };
  const onCancel = () => {
    props.store.visiable = false;
  };
  return (
    <Modal visible={props.store.visiable} onOk={onOk} onCancel={onCancel} width={480} footer={null}>
      <Tabs defaultActiveKey="key">
        <TabPane tab="Key" key="key">
          <DataTab data={props.store.key} />
        </TabPane>
        <TabPane tab="Value" key="value">
          <DataTab data={props.store.value} />
        </TabPane>
      </Tabs>
    </Modal>
  );
});

export default { KeyValueModal };
