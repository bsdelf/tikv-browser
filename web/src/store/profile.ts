import { observable, action, runInAction } from 'mobx';
import * as service from '../service';
import { connections } from './connection';

class Profiles {
  public data = observable(new Array<Profile>());

  public remove(profile: Profile) {
    const idx = this.data.findIndex(item => item.name === profile.name);
    this.data.splice(idx, 1);
  }

  public save() {}

  public add(...profiles: Profile[]) {
    this.data.push(...profiles);
  }

  public load() {
    const rpc = service.getRPC();
    const fetch = action(async () => {
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
    });
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
