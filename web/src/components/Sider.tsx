import React from 'react';
import { Button } from 'antd';
import { ProfileList } from '.';

import './Sider.css';

const AddProfileButton = () => {
  const onClick = () => {
    console.log('add');
  };
  return <Button size="small" icon="plus" onClick={onClick}></Button>;
};

export const Sider: React.FC = () => {
  return (
    <div className="App-body-sider">
      <div className="Sider-header">
        <div className="Sider-header-title">Profiles:</div>
        <div className="Sider-header-button">
          <AddProfileButton />
        </div>
      </div>
      <div className="Sider-body">
        <ProfileList />
      </div>
    </div>
  );
};

export default Sider;
