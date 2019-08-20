import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { List, Button, Tag } from 'antd';
import { connections, profiles } from '../store';

const onConnect = (profile: Profile) => {
  connections.add(profile.name, profile.endpoints);
};

const onEdit = (profile: Profile) => {
  console.log('on edit', profile);
};

const onDelete = (profile: Profile) => {
  profiles.remove(profile);
};

export const ProfileList = observer(() => (
  <List
    itemLayout="horizontal"
    dataSource={toJS(profiles.data)}
    renderItem={item => (
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
              </div>
            </div>
          }
          description={item.tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        />
      </List.Item>
    )}
  />
));

export default ProfileList;
