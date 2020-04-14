import { Json, Response } from './interfaces';

// log a short part of a possibly large object to help with debugging
const shortLog = (exports.shortLog = (item, length = 500): string =>
  JSON.stringify(item).slice(0, length));

// function to convert table responses to standardized JSON data
const standardizeTableResponse = (response: Response): Array<Json> => {
  const table = response.tables.find((tbl) => tbl.kind === 'PrimaryResult');
  if (!table)
    throw new Error(`PrimaryResult table was not found in ${JSON.stringify(response.tables)}`);
  return table._rows.map((row) => {
    const obj = {};
    table.columns.forEach((col) => (obj[col.name] = row[col.ordinal]));
    return obj;
  });
};

// make all responses use the same table, column, and row naming
const standardizeQueryResponse = (response): Response => {
  // use 'tables' key for list of tables instead of sometimes using 'Tables'
  if (response.Tables) {
    response.tables = response.Tables;
    delete response.Tables;
  }
  const tables = response.tables;

  // use 'columns' instead of sometimes using 'Columns'
  // use '_rows' instead of sometimes using 'Rows'
  // give every column an ordinal value
  // use 'name' for column names instead of sometimes using 'ColumnName'
  tables.forEach((table) => {
    if (table.Columns) {
      table.columns = table.Columns;
      delete table.Columns;
    }
    if (table.Rows) {
      table._rows = table.Rows;
      delete table.Rows;
    }
    table.columns.forEach((col, i) => {
      if (col.ColumnName) {
        col.name = col.ColumnName;
        delete col.ColumnName;
      }
      col.ordinal = col.ordinal || i;
    });
  });

  // use 'kind' key instead of sometimes using 'TableKind' or a separate table with the kinds
  if (!tables[0].kind) {
    if (tables.length === 1) {
      // only table must be Primary
      tables[0].kind = 'PrimaryResult';
    } else if (tables[0].TableKind) {
      tables.forEach((table) => {
        table.kind = table.TableKind;
      });
    } else {
      let kindTableIndex = -1;
      let kindColumnIndex = -1;
      let ordinalColumnIndex = -1;
      let nameColumnIndex = -1;
      for (let i = tables.length - 1; i > -1; i--) {
        // kindTable is usually the last table
        kindColumnIndex = tables[i].columns.findIndex((col) => col.name === 'Kind');
        if (kindColumnIndex > -1) {
          ordinalColumnIndex = tables[i].columns.findIndex((col) => col.name === 'Ordinal');
          nameColumnIndex = tables[i].columns.findIndex((col) => col.name === 'Name');
          kindTableIndex = i;
          tables[i].kind = 'kindMap';
          break;
        }
      }
      if (kindTableIndex > -1) {
        // give each table its kind
        for (let rowIndex = 0; rowIndex < tables[kindTableIndex]._rows.length; rowIndex++) {
          const row = tables[kindTableIndex]._rows[rowIndex];
          const tableIndex = row[ordinalColumnIndex];
          tables[tableIndex].kind = row[nameColumnIndex];
        }
      } else {
        console.log(`Could not find kindTableIndex in response: ${shortLog(response)}`);
      }
    }
  }
  return response;
};

export { standardizeQueryResponse, standardizeTableResponse };
