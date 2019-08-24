import React from 'react';
import { Input } from 'antd';
import { observer, useLocalStore } from 'mobx-react-lite';
import { Connection } from '../store';
import { autorun, runInAction } from 'mobx';

interface HexdumpTextAreaProps {
  connection: Connection;
}

const toHex = (num: number) => num.toString(16).padStart(2, '0');

const toPrintableAscii = (num: number) => {
  if (num > 0x20 && num < 0x7f) {
    return String.fromCharCode(num);
  } else {
    return '.';
  }
};

const toHexdump = (bytes: Uint8Array) => {
  const nRowBytes = 8;
  const nRows = Math.ceil(bytes.length / nRowBytes);
  const rows = new Array<string>();
  for (let i = 0; i < nRows; ++i) {
    const begin = i * nRowBytes;
    const end = begin + nRowBytes;
    const data = bytes.slice(begin, end);
    const no = begin.toString(16).padStart(8, '0');
    let hex = '';
    let ascii = '';
    for (let k = 0; k < data.length; ++k) {
      hex += toHex(data[k]) + ' ';
      ascii += toPrintableAscii(data[k]);
    }
    hex = hex.padEnd(nRowBytes * 3, ' ');
    ascii = ascii.padEnd(8, ' ');
    const line = `${no}  ${hex} |${ascii}|`;
    rows.push(line);
  }
  return rows.join('\n');
};

export const HexdumpTextArea = observer((props: HexdumpTextAreaProps) => {
  const store = useLocalStore(() => {
    autorun(() => {
      const cell = props.connection.cell;
      if (!cell.name) {
        runInAction(() => {
          store.value = '';
        });
        return;
      }
      const text = `${cell.name}: ${cell.data.length} bytes\n\n${toHexdump(cell.data)}`;
      runInAction(() => {
        store.value = text;
      });
    });
    return { value: '' };
  });
  const display = props.connection.rows.length > 0 ? 'inline-block' : 'none';
  return (
    <Input.TextArea
      style={{
        display,
        fontFamily:
          'Consolas,Monaco,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace',
      }}
      rows={14}
      readOnly={true}
      placeholder="click on table cell to show its hexdump"
      value={store.value}
    ></Input.TextArea>
  );
});

export default HexdumpTextArea;
