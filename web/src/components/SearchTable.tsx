import React from 'react';
import { Table, Button, Row, Col } from 'antd';
import { toJS } from 'mobx';
import { observer, useLocalStore } from 'mobx-react-lite';

import { Connection } from '../store';
import { PaginationConfig } from 'antd/lib/table';
import { KeyValueModal } from './KeyValueModal';

const pageSize = 10;

interface ActionsRowProps {
  data: SearchTableRowData;
}

const ActionsRow = observer((props: ActionsRowProps) => {
  const store = useLocalStore(() => ({
    visiable: false,
    key: props.data.key,
    value: props.data.value,
  }));
  const onClickEye = () => {
    store.visiable = true;
  };
  return (
    <Row>
      <Col span={10}>
        <Button size="small" icon="eye" onClick={onClickEye} />
      </Col>
      <Col span={10}>
        <Button size="small" icon="delete" disabled={true} />
      </Col>
      <KeyValueModal store={store} />
    </Row>
  );
});

const SearchTable = observer(({ connection }: { connection: Connection }) => {
  const columns = [
    {
      title: 'Key',
      key: 'key',
      width: '30%',
      dataIndex: 'data.key',
      render: (data: Uint8Array) => {
        return new TextDecoder('utf-8').decode(data);
      },
    },
    {
      title: 'Value',
      key: 'value',
      dataIndex: 'data.value',
      render: (data: Uint8Array) => {
        return new TextDecoder('utf-8').decode(data);
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '120px',
      dataIndex: 'data',
      render: (data: SearchTableRowData) => {
        return <ActionsRow data={data} />;
      },
    },
  ];

  const onChange = async (config: PaginationConfig) => {
    if (!config || typeof config.current !== 'number') {
      return;
    }
    connection.fetchPage({
      page: config.current,
      size: pageSize,
    });
  };

  return (
    <Table
      columns={columns}
      dataSource={toJS(connection.rows)}
      pagination={connection.pagination}
      loading={connection.loading.get()}
      onChange={onChange}
    />
  );
});

export default SearchTable;
