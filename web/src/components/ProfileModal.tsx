import React from 'react';
import { Modal, Form, Input, Row, Col, Button } from 'antd';
import { runInAction, autorun } from 'mobx';
import { observer, useLocalStore } from 'mobx-react-lite';

interface ProfileModalStore {
  visiable: boolean;
  profile: Profile;
  resolve: (profile: Profile) => Promise<void>;
}

interface ProfileModalProps {
  store: ProfileModalStore;
}

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

export const ProfileModal = observer((props: ProfileModalProps) => {
  const store = useLocalStore(() => {
    autorun(() => {
      ((profile: Profile) => {
        runInAction(() => {
          store.name = profile.name;
          store.endpoints = profile.endpoints.join('\n');
          store.tags = profile.tags.map(item => item.name).join('\n');
        });
      })(props.store.profile);
    });
    return {
      name: '',
      endpoints: '',
      tags: '',
      loading: false,
    };
  });

  const buildProfile = (): Profile => {
    const name = store.name;
    if (!name || /^\s+$/.test(name)) {
      throw new Error('invalid name');
    }
    const endpoints = store.endpoints.match(/[^\s]+/g);
    if (!endpoints) {
      throw new Error('invalid endpoints');
    }
    const tags = store.tags.match(/[^\s]+/g) || [];
    return {
      name: store.name,
      endpoints,
      tags: tags.map(item => ({ name: item, color: '' })),
    };
  };

  const onClose = () => {
    runInAction(() => {
      props.store.visiable = false;
    });
  };

  const OkButton = observer(() => {
    const onClick = () => {
      let profile: Profile;
      try {
        profile = buildProfile();
      } catch (err) {
        alert(err);
        return;
      }
      runInAction(() => {
        store.loading = true;
      });
      props.store
        .resolve(profile)
        .then(() => {
          runInAction(() => {
            store.loading = false;
            onClose();
          });
        })
        .catch(reason => {
          runInAction(() => {
            store.loading = false;
          });
          alert(reason);
        });
    };
    return (
      <Button type="primary" onClick={onClick} loading={store.loading}>
        Ok
      </Button>
    );
  });

  const CancelButton = () => {
    return <Button onClick={onClose}>Cancel</Button>;
  };

  const bindOnChange = (name: 'name' | 'endpoints' | 'tags') => {
    return (event: any) => {
      runInAction(() => {
        store[name] = event.target.value;
      });
    };
  };

  return (
    <Modal visible={props.store.visiable} okText="Add" onCancel={onClose} width={480} footer={null}>
      <Form {...formItemLayout}>
        <Form.Item label="Name" style={{ marginBottom: 12 }}>
          <Input placeholder="profile name" value={store.name} onChange={bindOnChange('name')} />
        </Form.Item>
        <Form.Item label="Endpoints" style={{ marginBottom: 12 }}>
          <Input.TextArea
            rows={4}
            placeholder="whitespace separated endpoints"
            value={store.endpoints}
            onChange={bindOnChange('endpoints')}
          />
        </Form.Item>
        <Form.Item label="Tags" style={{ marginBottom: 12 }}>
          <Input.TextArea
            rows={4}
            placeholder="whitespace separated tags"
            value={store.tags}
            onChange={bindOnChange('tags')}
          />
        </Form.Item>
        <Form.Item {...tailFormItemLayout} style={{ marginBottom: 0 }}>
          <Row>
            <Col span={6}>
              <OkButton />
            </Col>
            <Col span={6}>
              <CancelButton />
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default { ProfileModal };
