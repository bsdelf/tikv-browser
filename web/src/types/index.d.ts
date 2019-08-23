interface RpcOption {
  maxCallId?: number;
  reconnectDelay?: number;
}

interface RpcCallOption {
  data?: any;
  timeout?: number;
}

interface ProfileTag {
  name: string;
  color: string;
}

interface Profile {
  name: string;
  tags: ProfileTag[];
  endpoints: string[];
}

interface SearchOption {
  mode: string;
  encoding: string;
  contents: string;
  limit: number;
}

interface FetchPageOption {
  page: number;
  size: number;
}

interface ScanOption {
  endpoints: string[];
  key: Uint8Array;
  limit: number;
}

interface TikvGetResult {
  rows: {
    key: Uint8Array;
    value: Uint8Array;
  }[];
}

interface SearchTableRowData {
  key: Uint8Array;
  value: Uint8Array;
}

interface SearchTableRow {
  key: string;
  data: SearchTableRowData;
}
