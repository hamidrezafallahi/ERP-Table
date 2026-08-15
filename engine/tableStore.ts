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
  getRowByRowId(rowId:number):Row|undefined {
    // const row = this.state.table.rows
    return   undefined// this.state[;
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
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }
  resetTable(): void {
    this.state = this.originalState
}

  private notify() {
    this.subscribers.forEach(cb => cb());
  }
}
