import type { GridEvent } from '../../domain/types/GridEvent';

export type AppendResult =
  | { ok: true; version: number }
  | { ok: false; conflict: { expectedVersion: number; actualVersion: number } };

export type Unsubscribe = () => void;

export interface EventStore {
  append(
    streamId: string,
    events: GridEvent[],
    expectedVersion: number
  ): Promise<AppendResult>;

  read(streamId: string, fromVersion?: number): Promise<GridEvent[]>;

  subscribe(
    streamId: string,
    onEvent: (event: GridEvent) => void
  ): Unsubscribe;

  subscribeAll(onEvent: (event: GridEvent) => void): Unsubscribe;
}
