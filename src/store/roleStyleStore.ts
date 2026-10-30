import { defaultKeyValueStore, readJson, writeJson, type KeyValueStore } from '@dloizides/save-state';
import type { RoleStyles } from '../form/textRoles';

const KEY = 'flier-studio:role-styles';

const isStyles = (v: unknown): v is RoleStyles =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && Object.values(v).every((s) => typeof s === 'object' && s !== null && !Array.isArray(s));

/** The AC-44 text-role styles that apply to every flier. */
export class RoleStyleStore {
  private readonly kv: KeyValueStore;

  public constructor(kv: KeyValueStore = defaultKeyValueStore()) {
    this.kv = kv;
  }

  public save(roles: RoleStyles): void {
    writeJson(this.kv, KEY, roles);
  }

  public load(): RoleStyles {
    const roles = readJson<unknown>(this.kv, KEY);
    return isStyles(roles) ? roles : {};
  }
}
