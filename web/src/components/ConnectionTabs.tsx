import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'antd';
import { connections } from '../store';
import ConnectionTab from './ConnectionTab';

const { TabPane } = Tabs;

const onChange = (key: string) => {
  connections.activeId.set(key);
};

const onEdit = (key: any, action: string) => {
  if (action !== 'remove') {
    return;
  }
  connections.remove(key);
};

export const ConnectionTabs = observer(() => {
  return (
    <Tabs
      hideAdd
      type="editable-card"
      onChange={onChange}
      onEdit={onEdit}
      activeKey={connections.activeId.get()}
    >
      {connections.data.map(item => (
        <TabPane tab={item.name} key={item.id}>
          <ConnectionTab connection={toJS(item)} />
        </TabPane>
      ))}
    </Tabs>
  );
});

export default ConnectionTabs;
