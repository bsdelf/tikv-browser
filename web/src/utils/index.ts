import { fromByteArray } from 'base64-js';

export interface HumanReadableDataOption {
  data: Uint8Array;
  fromEncoding: string;
}

export class HumanReadableData {
  public readonly data: Uint8Array;
  public readonly text: string = '';
  public readonly encoding: string = '';

  public constructor(option: HumanReadableDataOption) {
    this.data = option.data;
    switch (option.fromEncoding) {
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
        throw new Error(`invalid encoding: ${option.fromEncoding}`);
      }
    }
  }
}

export default { HumanReadableData };
