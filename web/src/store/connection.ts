import { observable, action } from 'mobx';
import * as service from '../service';

export class Connection {
  public id: string;
  public name: string;
  public endpoints: string[];
  public keys = observable(new Array<Uint8Array>());
  public rows = observable(new Array<SearchTableRow>());
  public loading = observable.box(false);
  public pagination = observable({
    current: 0,
    total: 0,
    pageSize: 10,
  });

  public constructor(name: string, endpoints: string[]) {
    this.id = Date.now().toString();
    this.name = name;
    this.endpoints = endpoints;
  }

  public async search(option: SearchOption) {
    await service
      .getRPC()
      .call('/tikv/search', {
        data: {
          ...option,
          endpoints: this.endpoints,
        },
      })
      .then(
        action((result: SearchResult) => {
          this.keys.clear();
          this.keys.push(...(result.keys || []));
          if (this.keys.length <= 0) {
            this.clear();
            return;
          }
          this.pagination.current = 1;
          this.pagination.total = this.keys.length;
          this.loading.set(true);
          this.fetchPage({
            page: 1,
            size: this.pagination.pageSize,
          });
        })
      )
      .catch(err => {
        alert(err);
      });
  }

  @action
  public clear() {
    this.pagination.current = 0;
    this.pagination.total = 0;
    this.keys.clear();
    this.rows.clear();
  }

  public fetchPage(option: FetchPageOption) {
    const begin = (option.page - 1) * option.size;
    const end = begin + option.size;
    const keys = this.keys.slice(begin, end);
    service
      .getRPC()
      .call('/tikv/get', {
        data: {
          keys,
          endpoints: this.endpoints,
        },
      })
      .then((result: TikvGetResult) => {
        const rows = result.rows.map((item, idx) => ({
          key: idx.toString(),
          data: item,
        }));
        action(() => {
          this.rows.clear();
          this.rows.push(...rows);
          this.loading.set(false);
          this.pagination.current = option.page;
        })();
      })
      .catch(err => {
        this.loading.set(false);
        alert(err);
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
