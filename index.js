const KustoClient = require('azure-kusto-data').Client;
const KustoConnectionStringBuilder = require('azure-kusto-data').KustoConnectionStringBuilder;

const clusterName = process.env.ADX_CLUSTER_NAME;
const defaultDB = process.env.ADX_DATABASE_NAME;
const appId = process.env.ADX_CLIENT_ID;
const appKey = process.env.ADX_CLIENT_SECRET;
const authorityId = process.env.ADX_TENANT_ID;

const kcsb = KustoConnectionStringBuilder.withAadApplicationKeyAuthentication(
  `https://${clusterName}.kusto.windows.net`,
  appId,
  appKey,
  authorityId
);

const client = (exports.client = new KustoClient(kcsb));

// log a short part of a possibly large object to help with debugging
const shortLog = (exports.shortLog = (item, length = 500) => JSON.stringify(item).slice(0, length));

// make all responses use the same table, column, and row naming
const standardizeQueryResponse = (response) => {
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

// promisified adx message execution
const execute = (exports.execute = (message, raw, dbName = defaultDB) =>
  new Promise((resolve, reject) => {
    if (typeof message !== 'string') {
      throw new Error(`message ${JSON.stringify(message)} must be a string`);
    }

    client.execute(
      dbName,
      message,
      (err, results) => {
        if (err) {
          console.log(message);
          console.log(err);
          return reject(err);
        }
        resolve(standardizeQueryResponse(results));
      },
      { raw }
    );
  }));

// removes invalid table name characters
exports.convertToTableName = (name) => {
  if (!name) throw new Error('Failed to determine table name. Starting name not provided.');
  return name.replace(/[^\w\d\.-]/gi, '');
};

// removes an adx function if it exists
exports.deleteADXFunction = async (functionName) => {
  const message = `.drop function ['${functionName}'] ifexists`;
  await execute(message);
};
