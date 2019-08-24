import React from 'react';
import { Modal, Tabs, Form, Input, Row, Col, Button } from 'antd';
import { runInAction } from 'mobx';
import { observer, useLocalStore } from 'mobx-react-lite';
import CopyToClipboard from 'react-copy-to-clipboard';

import { encodings, EncodingSelect, Encoding } from './EncodingSelect';
import DownloadButton from './DownloadButton';
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
  name: string;
  data: Uint8Array;
}

interface CopyButtonProps {
  text: string;
}

const CopyButton = observer((props: CopyButtonProps) => {
  return (
    <CopyToClipboard text={props.text}>
      <Button>Copy Contents</Button>
    </CopyToClipboard>
  );
});

const DataTab = observer((props: DataTabProps) => {
  const formItemLayout = {
    labelCol: {
      span: 6,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const tailFormItemLayout = {
    wrapperCol: {
      span: 16,
      offset: 6,
    },
  };

  const defaultEncoding = encodings[0];
  const data = new HumanReadableData({
    data: props.data,
    encoding: defaultEncoding.value,
  });

  const store = useLocalStore(() => ({
    value: data.text,
  }));

  const onEncodingSelect = (encoding: Encoding) => {
    const data = new HumanReadableData({
      data: props.data,
      encoding: encoding.value,
    });
    runInAction(() => {
      store.value = data.text;
    });
  };

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
      <Form.Item {...tailFormItemLayout} style={{ marginBottom: 0 }}>
        <Row>
          <Col span={12}>
            <CopyButton text={store.value} />
          </Col>
          <Col span={10}>
            <DownloadButton name={props.name} data={props.data} />
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
});

export const KeyValueModal = observer((props: KeyValueModalProps) => {
  const onOk = () => {
    runInAction(() => {
      props.store.visiable = false;
    });
  };
  const onCancel = () => {
    runInAction(() => {
      props.store.visiable = false;
    });
  };
  return (
    <Modal visible={props.store.visiable} onOk={onOk} onCancel={onCancel} width={480} footer={null}>
      <Tabs defaultActiveKey="key">
        <TabPane tab="Key" key="key">
          <DataTab name="key" data={props.store.key} />
        </TabPane>
        <TabPane tab="Value" key="value">
          <DataTab name="value" data={props.store.value} />
        </TabPane>
      </Tabs>
    </Modal>
  );
});

export default { KeyValueModal };
