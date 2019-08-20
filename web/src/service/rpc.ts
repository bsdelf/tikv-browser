import { EventEmitter } from 'events';
import { encode, decode } from '@msgpack/msgpack';
import { getConfig } from './config';

const readBlob = async (blob: any): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(blob);
    } catch (err) {
      reject(err);
    }
  });

interface InputMessage {
  id: number;
  proc: string;
  data?: Uint8Array;
}

interface OutputMessage {
  id: number;
  data: Uint8Array;
  error: string;
}

export class RPC extends EventEmitter {
  private url: string;
  private reconnectDelay: number;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private wsHandlers: Record<string, any>;
  private ws: WebSocket | null = null;
  private callId = 0;
  private callIdMax: number;
  private callbackPool = new Map<number, (error: Error | null, data?: any) => void>();

  public constructor(url: string, option: RpcOption = {}) {
    super();
    this.url = url;
    this.callIdMax = option.maxCallId || 0xffff;
    this.reconnectDelay = option.reconnectDelay || 5000;
    this.wsHandlers = {
      close: (event: CloseEvent): void => {
        this.emit('close', event);
        this.reconnect();
      },
      error: (event: Event): void => {
        this.emit('error', event);
        this.reconnect();
      },
      open: (event: Event): void => {
        this.emit('open', event);
      },
      message: async (event: MessageEvent) => {
        const rawMessage = await readBlob(event.data);
        try {
          this.onCall(rawMessage);
        } catch (err) {
          console.log(err);
        }
      },
    };
    this.setupWebSocket(url);
  }

  public get ready(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  private get closed(): boolean {
    return !this.ws || this.ws.readyState === WebSocket.CLOSED;
  }

  private reconnect() {
    if (!this.reconnectTimer && this.closed) {
      this.reconnectTimer = setTimeout(() => {
        this.setupWebSocket(this.url);
        this.reconnectTimer = null;
      }, this.reconnectDelay);
    }
  }

  private setupWebSocket(url: string) {
    const ws = new WebSocket(url);
    for (const [name, handler] of Object.entries(this.wsHandlers)) {
      ws.addEventListener(name, handler as any);
    }
    if (this.ws) {
      for (const [name, handler] of Object.entries(this.wsHandlers)) {
        this.ws.removeEventListener(name, handler as any);
      }
    }
    this.ws = ws;
  }

  public get unresolved(): number {
    return this.callbackPool.size;
  }

  private get nextCallId(): number {
    const id = this.callId;
    if (id < this.callIdMax) {
      ++this.callId;
    } else {
      this.callId = 0;
    }
    return id;
  }

  private onCall(rawMessage: ArrayBuffer) {
    const message = decode(rawMessage) as OutputMessage;
    const callback = this.callbackPool.get(message.id);
    if (callback) {
      if (message.error && message.error.length > 0) {
        callback(new Error(message.error));
        return;
      }
      const data = message.data ? decode(message.data) : null;
      callback(null, data);
    }
  }

  public call<T = any>(proc: string, option: RpcCallOption = {}): Promise<T> {
    if (!option.timeout) {
      option.timeout = 5000;
    }
    const id = this.nextCallId;
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        this.callbackPool.delete(id);
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('RPC timeout'));
      }, option.timeout);
      const callback = (error: Error | null, data?: any) => {
        clearTimeout(timer);
        cleanup();
        if (!error) {
          resolve(data);
        } else {
          reject(error);
        }
      };
      this.callbackPool.set(id, callback);
      if (this.ws) {
        try {
          const message: InputMessage = { id, proc };
          if (option.data) {
            const data = encode(option.data);
            Object.assign(message, { data });
          }
          const rawMessage = encode(message);
          this.ws.send(rawMessage);
        } catch (err) {
          reject(err);
        }
      }
    });
  }
}

let rpc: RPC;

export const getRPC = () => {
  if (!rpc) {
    rpc = new RPC(getConfig().rpcHost);
  }
  return rpc;
};

export default { RPC, getRPC };
