import React from 'react';
import { toJS, runInAction } from 'mobx';
import { observer, useLocalStore } from 'mobx-react-lite';
import { List, Button, Tag } from 'antd';
import { ProfileModal } from './ProfileModal';
import { connections, profiles } from '../store';

export const ProfileList = observer(() => {
  const emptyProfile: Profile = {
    name: '',
    endpoints: [],
    tags: [],
  };
  const modalStore = useLocalStore(() => ({
    visiable: false,
    profile: emptyProfile,
    resolve: (_: Profile) => Promise.resolve(),
  }));

  const onConnect = (profile: Profile) => {
    connections.add(profile.name, profile.endpoints);
  };

  const onEdit = (profile: Profile) => {
    const name = profile.name;
    runInAction(() => {
      modalStore.visiable = true;
      modalStore.profile = { ...profile };
      modalStore.resolve = (profile: Profile) => profiles.update(name, profile);
    });
  };

  const onDelete = (profile: Profile) => {
    profiles.remove(profile).catch(reason => {
      alert(reason);
    });
  };

  const listRender = (item: Profile) => {
    return (
      <List.Item>
        <List.Item.Meta
          key={item.name}
          title={
            <div className="Sider-item-header">
              <div className="Sider-item-header-title">{item.name}</div>
              <div className="Sider-item-header-tools">
                <Button
                  size="small"
                  icon="api"
                  type="primary"
                  onClick={onConnect.bind(undefined, item)}
                ></Button>
                <Button
                  size="small"
                  icon="edit"
                  className="Sider-item-header-button"
                  onClick={onEdit.bind(undefined, item)}
                ></Button>
                <Button
                  size="small"
                  icon="delete"
                  type="danger"
                  className="Sider-item-header-button"
                  onClick={onDelete.bind(undefined, item)}
                ></Button>
                <ProfileModal store={modalStore} />
              </div>
            </div>
          }
          description={item.tags.map(tag => (
            <Tag key={tag.name} color={tag.color}>
              {tag.name}
            </Tag>
          ))}
        />
      </List.Item>
    );
  };

  return <List itemLayout="horizontal" dataSource={toJS(profiles.data)} renderItem={listRender} />;
});

export default ProfileList;
