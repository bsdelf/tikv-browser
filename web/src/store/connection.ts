import { observable, action, runInAction } from 'mobx';
import * as service from '../service';

let id = 0;

export class Connection {
  public id: string;
  public name: string;
  public endpoints: string[];
  public keys = observable(new Array<Uint8Array>());
  public rows = observable(new Array<SearchTableRow>());
  public cell = observable({ name: '', data: Uint8Array.from([]) });
  public loading = observable.box(false);
  public pagination = observable({
    current: 0,
    total: 0,
    pageSize: 10,
  });

  public constructor(name: string, endpoints: string[]) {
    this.id = (++id).toString();
    this.name = name;
    this.endpoints = endpoints;
  }

  @action
  public async search(option: SearchOption) {
    this.clear();
    this.loading.set(true);
    await service
      .getRPC()
      .call('/tikv/search', {
        data: {
          ...option,
          endpoints: this.endpoints,
        },
      })
      .then(
        action((result: Uint8Array[]) => {
          this.keys.replace(result || []);
        })
      )
      .catch(reason => {
        alert(reason);
      })
      .then(
        action(() => {
          return this.fetchPage({
            page: 1,
            size: this.pagination.pageSize,
          });
        })
      )
      .then(
        action(() => {
          this.loading.set(false);
        })
      );
  }

  @action
  public clear() {
    this.pagination.current = 0;
    this.pagination.total = 0;
    this.keys.clear();
    this.rows.clear();
    this.cell.name = '';
    this.cell.data = Uint8Array.from([]);
    this.loading.set(false);
  }

  @action
  public async fetchPage(option: FetchPageOption) {
    if (this.keys.length <= 0) {
      return;
    }
    const begin = (option.page - 1) * option.size;
    const end = begin + option.size;
    const keys = this.keys.slice(begin, end);
    this.rows.clear();
    this.cell.name = '';
    this.cell.data = Uint8Array.from([]);
    this.loading.set(true);
    await service
      .getRPC()
      .call('/tikv/get', {
        data: {
          keys,
          endpoints: this.endpoints,
        },
      })
      .then((result: TikvGetResult) => {
        const rows = (result.rows || []).map((item, idx) => ({
          key: idx.toString(),
          data: item,
        }));
        runInAction(() => {
          this.rows.replace(rows);
          this.loading.set(false);
          this.pagination.current = option.page;
          this.pagination.total = this.keys.length;
        });
      })
      .catch(err => {
        alert(err);
      });
    runInAction(() => {
      this.loading.set(false);
    });
  }
}

class Connections {
  @observable
  public data = new Array<Connection>();

  public activeId = observable.box('');

  public get empty() {
    return this.data.length === 0;
  }

  @action
  public add(name: string, endpoints: string[]) {
    const connection = new Connection(name, endpoints);
    this.data.push(connection);
    this.activeId.set(connection.id);
    return connection.id;
  }

  @action
  public remove(id: string) {
    const idx = this.data.findIndex(item => item.id === id);
    this.data.splice(idx, 1);
    if (this.data.length <= 0) {
      this.activeId.set('');
      return;
    }
    if (this.activeId.get() === id) {
      const nextIdx = idx < this.data.length ? idx : this.data.length - 1;
      this.activeId.set(this.data[nextIdx].id as string);
    }
  }
}

export const connections = new Connections();

export default { Connection, connections };
