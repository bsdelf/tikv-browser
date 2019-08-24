import { fromByteArray } from 'base64-js';

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

export interface HumanReadableDataOption {
  data: Uint8Array;
  encoding: string;
}

export class HumanReadableData {
  public readonly data: Uint8Array;
  public readonly text: string = '';
  public readonly encoding: string = '';

  public constructor(option: HumanReadableDataOption) {
    this.data = option.data;
    switch (option.encoding) {
      case 'hexdump': {
        this.text = toHexdump(option.data);
        break;
      }
      case 'utf8': {
        this.text = new TextDecoder('utf-8').decode(this.data);
        break;
      }
      case 'hex': {
        let text = '';
        this.data.forEach(byte => {
          text += byte.toString(16).toUpperCase();
        });
        this.text = text;
        break;
      }
      case 'base64': {
        this.text = fromByteArray(this.data);
        break;
      }
      default: {
        throw new Error(`invalid encoding: ${option.encoding}`);
      }
    }
  }
}

export default { HumanReadableData };
