// Column order
export class ColumnOrder {
  valueKey: string;

  constructor(storageValueKey: string) {
    this.valueKey = storageValueKey;
  }

  get(): string[] | null {
    const value = localStorage.getItem(this.valueKey);
    return JSON.parse(value);
  }

  set(value: string[] | null) {
    localStorage.setItem(this.valueKey, JSON.stringify(value));
  }

  remove() {
    localStorage.removeItem(this.valueKey);
  }
}
