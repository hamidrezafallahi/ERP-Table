// /table/engine/tableStore.ts

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

  setState(newState: T) {
    this.state = newState;
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
