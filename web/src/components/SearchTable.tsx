import React from 'react';
import { Table, Button, Row, Col, Popconfirm } from 'antd';
import { runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react-lite';

import { Connection } from '../store';
import { PaginationConfig } from 'antd/lib/table';

const pageSize = 10;

interface ActionsRowProps {
  data: SearchTableRowData;
}

const ActionsRow = (props: ActionsRowProps) => {
  const onClick = (name: string, data: Uint8Array) => {
    const fileName = `${name}.bin`;
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const onClickKey = () => onClick('key', props.data.key);
  const onClickValue = () => onClick('value', props.data.value);
  return (
    <Row>
      <Col span={12}>
        <Popconfirm
          title="Which one?"
          okText="Value"
          cancelText="Key"
          onConfirm={onClickValue}
          onCancel={onClickKey}
        >
          <Button size="small" icon="download"></Button>
        </Popconfirm>
      </Col>
      <Col span={12}>
        <Button size="small" icon="delete" disabled={true} />
      </Col>
    </Row>
  );
};

let id = 0;

const toText = (data: Uint8Array, limit: number) => {
  if (data.length > 64) {
    return '<blob>';
  }
  let text = new TextDecoder('utf-8').decode(data);
  if (text.length > limit) {
    text = text.substr(0, limit - 3) + '...';
  }
  return text;
};

const toSpan = (data: Uint8Array, limit: number, onClick: () => void) => {
  let style = {};
  let text: string;
  if (data.length > 1024) {
    text = '<blob>';
    style = { fontStyle: 'italic', color: 'gray' };
  } else {
    text = toText(data, limit);
  }
  return (
    <span onClick={onClick} style={style}>
      {text}
    </span>
  );
};

const SearchTable = observer(({ connection }: { connection: Connection }) => {
  const columns = [
    {
      title: 'Key',
      key: 'key',
      width: '30%',
      dataIndex: 'data.key',
      render: (data: Uint8Array) => {
        const onClick = () => {
          runInAction(() => {
            connection.cell.name = 'key';
            connection.cell.data = data;
          });
        };
        return toSpan(data, 32, onClick);
      },
    },
    {
      title: 'Value',
      key: 'value',
      dataIndex: 'data.value',
      render: (data: Uint8Array) => {
        const onClick = () => {
          runInAction(() => {
            connection.cell.name = 'value';
            connection.cell.data = data;
          });
        };
        return toSpan(data, 64, onClick);
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '120px',
      dataIndex: 'data',
      render: (data: SearchTableRowData) => {
        return <ActionsRow key={++id} data={data} />;
      },
    },
  ];

  const onChange = async (config: PaginationConfig) => {
    if (!config || typeof config.current !== 'number') {
      return;
    }
    connection
      .fetchPage({
        page: config.current,
        size: pageSize,
      })
      .catch(reason => {
        alert(reason);
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
