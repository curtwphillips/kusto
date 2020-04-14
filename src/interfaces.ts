export interface Column {
  name: string;
  ordinal: number;
}

export interface Table {
  kind: string;
  _rows: Array<Array<string>>;
  columns: Array<Column>;
}

export interface Response {
  tables: Array<Table>;
}

export interface Json {
  [key: string]: string;
}
