import { observable, runInAction } from 'mobx';
import * as service from '../service';
import { connections } from './connection';

class Profiles {
  public data = observable(new Array<Profile>());

  public async add(profile: Profile) {
    await service
      .getRPC()
      .call('/profile/add', {
        data: profile,
      })
      .then(() => {
        runInAction(() => {
          this.data.push(profile);
        });
      });
  }

  public async update(name: string, profile: Profile) {
    await service
      .getRPC()
      .call('/profile/update', {
        data: {
          name,
          profile,
        },
      })
      .then(() => {
        const idx = this.data.findIndex(item => item.name === name);
        runInAction(() => {
          for (const [k, v] of Object.entries(profile as Profile)) {
            const obj = this.data[idx] as any;
            obj[k] = v;
          }
        });
      });
  }

  public async remove(profile: Profile) {
    await service
      .getRPC()
      .call('/profile/delete', {
        data: {
          name: profile.name,
        },
      })
      .then(() => {
        const idx = this.data.findIndex(item => item.name === profile.name);
        runInAction(() => {
          this.data.splice(idx, 1);
        });
      });
  }

  public load() {
    const rpc = service.getRPC();
    const fetch = async () => {
      try {
        const profiles = await rpc.call<Profile[]>('/profile/list');
        runInAction(() => {
          this.data.replace(profiles);
          if (profiles.length <= 0 || !connections.empty) {
            return;
          }
          const firstProfile = profiles[0] as Profile;
          connections.add(firstProfile.name, firstProfile.endpoints);
        });
      } catch (err) {
        console.log(err);
      }
    };
    (async () => {
      if (rpc.ready) {
        await fetch();
        return;
      }
      rpc.on('open', async () => {
        await fetch();
      });
      rpc.on('error', event => {
        console.log('error', event);
      });
    })();
  }
}

export const profiles = new Profiles();

export default { profiles };
