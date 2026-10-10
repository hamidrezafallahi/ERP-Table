/**
 * arianERP RemoteApi adapter (PR-76 / D15).
 * Keep out of the default `.` graph when tree-shaking; root re-export is deprecated.
 */
export { FetchRemoteApi } from '../../infrastructure/Repositories/fetchRemoteApi';
export type {
  ErpDefaults,
  FetchRemoteApiOptions,
} from '../../infrastructure/Repositories/fetchRemoteApi';
export { CallbackRemoteApi } from '../../infrastructure/Repositories/callbackRemoteApi';
export type { RemoteApiRequest } from '../../infrastructure/Repositories/callbackRemoteApi';
