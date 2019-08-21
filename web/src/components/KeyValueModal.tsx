import React from 'react';
import { Modal, Tabs, Form, Input } from 'antd';
import { observer } from 'mobx-react-lite';

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

const DataTab = (props: DataTabProps) => {
  const formItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 14,
    },
  };

  const tailFormItemLayout = {
    wrapperCol: {
      span: 14,
      offset: 6,
    },
  };

  return (
    <Form>
      <Form.Item label="Size">{props.data.length}</Form.Item>
      <Form.Item label="Encoding">encoding</Form.Item>
      <Form.Item label="Contents">
        <TextArea rows={3}></TextArea>
      </Form.Item>
    </Form>
  );
};

export const KeyValueModal = observer((props: KeyValueModalProps) => {
  const onOk = () => {
    props.store.visiable = false;
  };
  const onCancel = () => {
    props.store.visiable = false;
  };
  return (
    <Modal visible={props.store.visiable} onOk={onOk} onCancel={onCancel}>
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
