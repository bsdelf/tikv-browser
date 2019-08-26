import React from 'react';
import { Form, Select, Input, Slider, Button, Row, Col } from 'antd';
import { action, runInAction } from 'mobx';
import { useLocalStore, observer } from 'mobx-react-lite';
import { Connection } from '../store';
import { encodings, EncodingSelect, Encoding } from './EncodingSelect';

const { TextArea } = Input;
const { Option } = Select;

const SearchForm = ({ connection }: { connection: Connection }) => {
  const searchModes = [
    {
      name: 'Scan Lower Bound',
      value: 'scan',
    },
    {
      name: 'Match Prefix',
      value: 'prefix',
    },
    {
      name: 'Match Whole',
      value: 'whole',
    },
  ];
  const defaultSearchMode = searchModes[0];

  const defaultKeyEncoding = encodings[0];

  const store = useLocalStore(() => ({
    searchMode: defaultSearchMode.value,
    keyEncoding: defaultKeyEncoding.value,
    keyContents: '',
    keyContentsPlaceholder: defaultKeyEncoding.placeholder,
    resultsLimit: 1000,
    loading: false,
  }));

  const onKeyEncodingSelect = (encoding: Encoding) => {
    runInAction(() => {
      store.keyEncoding = encoding.value;
      store.keyContents = '';
      store.keyContentsPlaceholder = encoding.placeholder;
    });
  };

  const SearchButton = observer(() => {
    const onClick = () => {
      runInAction(() => {
        store.loading = true;
        connection
          .search({
            mode: store.searchMode,
            encoding: store.keyEncoding,
            contents: store.keyContents,
            limit: store.resultsLimit,
          })
          .catch(reason => {
            alert(reason);
          })
          .finally(
            action(() => {
              store.loading = false;
            })
          );
      });
    };
    return (
      <Button type="primary" onClick={onClick} loading={store.loading}>
        Search
      </Button>
    );
  });

  const ClearButton = () => {
    const onClick = () => {
      runInAction(() => {
        store.keyContents = '';
      });
      connection.clear();
    };
    return <Button onClick={onClick}>Clear</Button>;
  };

  const SearchModeSelect = observer(() => {
    const onSelect = (value: string) => {
      runInAction(() => {
        store.searchMode = value;
      });
    };
    return (
      <Select defaultValue={defaultSearchMode.name} onSelect={onSelect} value={store.searchMode}>
        {searchModes.map(item => (
          <Option value={item.value} key={item.value}>
            {item.name}
          </Option>
        ))}
      </Select>
    );
  });

  const KeyContentsTextArea = observer(() => {
    const onChange = (event: any) => {
      runInAction(() => {
        store.keyContents = event.target.value;
      });
    };
    return (
      <TextArea
        rows={4}
        placeholder={store.keyContentsPlaceholder}
        value={store.keyContents}
        onChange={onChange}
      ></TextArea>
    );
  });

  const ResultsLimitSlider = observer(() => {
    const onChange = (value: any) => {
      runInAction(() => {
        store.resultsLimit = value;
      });
    };
    return (
      <Slider
        min={100}
        max={2000}
        step={100}
        defaultValue={store.resultsLimit}
        value={store.resultsLimit}
        onChange={onChange}
      ></Slider>
    );
  });

  const formItemLayout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const tailFormItemLayout = {
    wrapperCol: {
      span: 16,
      offset: 8,
    },
  };

  return (
    <Form {...formItemLayout}>
      <Form.Item label="Search Mode" style={{ marginBottom: 12 }}>
        <SearchModeSelect />
      </Form.Item>
      <Form.Item label="Key Encoding" style={{ marginBottom: 12 }}>
        <EncodingSelect defaultEncoding={defaultKeyEncoding.name} onSelect={onKeyEncodingSelect} />
      </Form.Item>
      <Form.Item label="Key Contents" style={{ marginBottom: 12 }}>
        <KeyContentsTextArea />
      </Form.Item>
      <Form.Item label="Results Limit" style={{ marginBottom: 12 }}>
        <ResultsLimitSlider />
      </Form.Item>
      <Form.Item {...tailFormItemLayout} style={{ marginBottom: 12 }}>
        <Row gutter={16}>
          <Col span={10}>
            <SearchButton />
          </Col>
          <Col span={10}>
            <ClearButton />
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default SearchForm;
