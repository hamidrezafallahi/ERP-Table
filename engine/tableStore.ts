// /table/engine/tableStore.ts

import { Row } from '../domain/entities/Row';

type Subscriber = () => void;

export class TableStore<T> {
  private subscribers: Subscriber[] = [];
  private state: T;
  private originalState: T;

  constructor(initialState: T) {
    this.state = initialState;
    this.originalState = initialState;
  }

  getState() {
    return this.state;
  }
  getRowByRowId(rowId: number): Row | undefined {
    return undefined;
  }

  setState(updater: (prev: T) => T) {
    const nextState = updater(this.state);
    if (nextState === this.state) return;
    this.state = nextState;
    this.notify();
  }

  subscribe(cb: Subscriber) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  /**
   * Notify only when the selected slice changes (Object.is by default).
   * Prevents React adapters from re-rendering on unrelated store updates.
   */
  subscribeWithSelector<TSelected>(
    selector: (state: T) => TSelected,
    listener: (selected: TSelected) => void,
    isEqual: (a: TSelected, b: TSelected) => boolean = Object.is,
  ): () => void {
    let current = selector(this.state);
    return this.subscribe(() => {
      const next = selector(this.state);
      if (!isEqual(current, next)) {
        current = next;
        listener(next);
      }
    });
  }

  resetTable(): void {
    this.state = this.originalState;
  }

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }
}
