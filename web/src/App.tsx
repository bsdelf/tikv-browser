import React, { useEffect } from 'react';
import { LocaleDropdown, Sider, ConnectionTabs } from './components';
import { profiles } from './store';

import 'antd/dist/antd.css';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    profiles.load();
  });

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-logo">TiKV Browser</div>
        <div className="App-header-menu">
          <LocaleDropdown />
        </div>
      </header>
      <div className="App-body">
        <Sider />
        <div className="App-line"></div>
        <div className="App-body-content">
          <ConnectionTabs />
        </div>
      </div>
    </div>
  );
};

export default App;
