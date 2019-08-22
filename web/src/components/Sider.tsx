import React from 'react';
import { Button } from 'antd';
import { runInAction } from 'mobx';
import { useLocalStore } from 'mobx-react-lite';
import { ProfileList } from './ProfileList';
import { ProfileModal } from './ProfileModal';
import { profiles } from '../store';

import './Sider.css';

const AddProfileButton = () => {
  const emptyProfile: Profile = {
    name: '',
    tags: [],
    endpoints: [],
  };
  const store = useLocalStore(() => ({
    visiable: false,
    profile: emptyProfile,
    resolve: (profile: Profile) => profiles.add(profile),
  }));
  const onClick = () => {
    runInAction(() => {
      store.profile = emptyProfile;
      store.visiable = true;
    });
  };
  return (
    <div>
      <Button size="small" icon="plus" onClick={onClick}></Button>
      <ProfileModal store={store} />
    </div>
  );
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
