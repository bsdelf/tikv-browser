import React from 'react';
import { Menu, Dropdown, Button, Icon } from 'antd';
import 'antd/dist/antd.css';

export const LocaleDropdown: React.FC = () => {
  const locales = [
    {
      key: 'en_US',
      name: 'English',
    },
    {
      key: 'zh_CN',
      name: '简体中文',
    },
  ];
  const defaultLocale = locales[0];
  const menu = (
    <Menu>
      {locales.map(({ key, name }) => (
        <Menu.Item key={key}>{name}</Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Dropdown overlay={menu}>
      <Button size="small">
        {defaultLocale.name} <Icon type="down" />
      </Button>
    </Dropdown>
  );
};

export default LocaleDropdown;
