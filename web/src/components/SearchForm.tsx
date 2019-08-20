import React from 'react';
import { action } from 'mobx';
import { Form, Select, Input, Slider, Button, Row, Col } from 'antd';
import { useLocalStore, observer } from 'mobx-react-lite';
import { Connection } from '../store';

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

  const keyEncodings = [
    {
      name: 'utf8',
      value: 'utf8',
      placeholder: 'Input a human readable utf8 string here.',
    },
    {
      name: 'hex',
      value: 'hex',
      placeholder: 'Input a hex encoded string here.',
    },
    {
      name: 'base64',
      value: 'base64',
      placeholder: 'Input a base64 encoded string here.',
    },
  ];
  const defaultKeyEncoding = keyEncodings[0];

  const store = useLocalStore(() => ({
    searchMode: defaultSearchMode.value,
    keyEncoding: defaultKeyEncoding.value,
    keyContents: '',
    keyContentsPlaceholder: defaultKeyEncoding.placeholder,
    resultsLimit: 1000,
    loading: false,
  }));

  const SearchButton = observer(() => {
    const onClick = async () => {
      try {
        store.loading = true;
        await connection.search({
          mode: store.searchMode,
          encoding: store.keyEncoding,
          contents: store.keyContents,
          limit: store.resultsLimit,
        });
      } finally {
        store.loading = false;
      }
    };
    return (
      <Button type="primary" onClick={onClick} loading={store.loading}>
        Search
      </Button>
    );
  });

  const ClearButton = () => {
    const onClick = () => {
      store.keyContents = '';
      connection.clear();
    };
    return <Button onClick={onClick}>Clear</Button>;
  };

  const SearchModeSelect = observer(() => {
    const onSelect = (value: string) => {
      store.searchMode = value;
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

  const KeyEncodingSelect = observer(() => {
    const onSelect = action((value: string) => {
      const option = keyEncodings.find(item => item.value === value) as any;
      store.keyContentsPlaceholder = option.placeholder;
      store.keyEncoding = value;
      store.keyContents = '';
    });
    return (
      <Select defaultValue={defaultKeyEncoding.name} onSelect={onSelect} value={store.keyEncoding}>
        {keyEncodings.map(item => (
          <Option value={item.value} key={item.value}>
            {item.name}
          </Option>
        ))}
      </Select>
    );
  });

  const KeyContentsTextArea = observer(() => {
    const onChange = (event: any) => {
      store.keyContents = event.target.value;
    };
    return (
      <TextArea
        rows={3}
        placeholder={store.keyContentsPlaceholder}
        value={store.keyContents}
        onChange={onChange}
      ></TextArea>
    );
  });

  const ResultsLimitSlider = observer(() => {
    const onChange = (value: any) => {
      store.resultsLimit = value;
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
      span: 6,
    },
    wrapperCol: {
      span: 14,
    },
  };

  const tailFormItemLayout = {
    wrapperCol: {
      span: 14,
      offset: 6,
    },
  };

  return (
    <Form {...formItemLayout}>
      <Form.Item label="Search Mode">
        <SearchModeSelect />
      </Form.Item>
      <Form.Item label="Key Encoding">
        <KeyEncodingSelect />
      </Form.Item>
      <Form.Item label="Key Contents">
        <KeyContentsTextArea />
      </Form.Item>
      <Form.Item label="Results Limit">
        <ResultsLimitSlider />
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Row>
          <Col span={8}>
            <SearchButton />
          </Col>
          <Col span={8}>
            <ClearButton />
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default SearchForm;
