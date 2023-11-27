const DEFAULT_COMPARATOR = function (a: any, b: any) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  } else {
    a = a.toString();
    b = b.toString();

    if (a == b) return 0;

    return a > b ? 1 : -1;
  }
};

export class PriorityQueue<T extends any> {
  private elements: T[] = [];

  constructor(private comparator: (a: T, b: T) => number) {}

  get isEmpty() {
    return this.size === 0;
  }

  get size() {
    return this.elements.length;
  }

  compare(a: number, b: number) {
    return this.comparator(this.elements[a], this.elements[b]);
  }

  swap(a: number, b: number) {
    var aux = this.elements[a];
    this.elements[a] = this.elements[b];
    this.elements[b] = aux;
  }

  peek() {
    if (this.isEmpty) throw new Error('PriorityQueue is empty');

    return this.elements[0];
  }

  enqueue(element: T) {
    const size = this.elements.push(element);
    let current = size - 1;

    while (current > 0) {
      var parent = Math.floor((current - 1) / 2);

      if (this.compare(current, parent) <= 0) break;

      this.swap(parent, current);
      current = parent;
    }

    return size;
  }

  dequeue() {
    const last = this.elements.pop();
    const size = this.size;
    const first = this.peek();

    if (size === 0) return first;
    this.elements[0] = last!;
    var current = 0;

    while (current < size) {
      var largest = current;
      var left = 2 * current + 1;
      var right = 2 * current + 2;

      if (left < size && this.compare(left, largest) >= 0) {
        largest = left;
      }

      if (right < size && this.compare(right, largest) >= 0) {
        largest = right;
      }

      if (largest === current) break;

      this.swap(largest, current);
      current = largest;
    }

    return first;
  }
}
