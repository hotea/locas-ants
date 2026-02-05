interface QuickListNode<T> {
  value: T;
  prev: QuickListNode<T> | null;
  next: QuickListNode<T> | null;
}

export class QuickList<T> {
  private head: QuickListNode<T> | null = null;
  private tail: QuickListNode<T> | null = null;
  private nodeMap: Map<T, QuickListNode<T>> = new Map();
  private _size: number = 0;

  get size(): number {
    return this._size;
  }

  add(value: T): void {
    if (this.nodeMap.has(value)) return;

    const node: QuickListNode<T> = {
      value,
      prev: this.tail,
      next: null,
    };

    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node;
    }

    this.tail = node;
    this.nodeMap.set(value, node);
    this._size++;
  }

  remove(value: T): boolean {
    const node = this.nodeMap.get(value);
    if (!node) return false;

    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.nodeMap.delete(value);
    this._size--;
    return true;
  }

  has(value: T): boolean {
    return this.nodeMap.has(value);
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.nodeMap.clear();
    this._size = 0;
  }

  *[Symbol.iterator](): Iterator<T> {
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }

  toArray(): T[] {
    const result: T[] = [];
    for (const value of this) {
      result.push(value);
    }
    return result;
  }
}
