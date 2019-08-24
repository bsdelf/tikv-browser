import React from 'react';
import { Row, Col } from 'antd';
import SearchForm from './SearchForm';
import CellForm from './CellForm';
import SearchTable from './SearchTable';
import { Connection } from '../store';

// const style = {
//   maxWidth: 440,
//   right: 12,
//   top: 12,
//   position: 'fixed',
//   zIndex: 1,
// };

export const ConnectionTab = ({ connection }: { connection: Connection }) => (
  <div style={{ minWidth: 760 }}>
    <Row gutter={16}>
      <Col span={10} style={{ minWidth: 320 }}>
        <SearchForm connection={connection} />
      </Col>
      <Col span={14}>
        <CellForm connection={connection} />
      </Col>
    </Row>
    <div className="SearchTableWrapper">
      <SearchTable connection={connection} />
    </div>
  </div>
);

export default ConnectionTab;
