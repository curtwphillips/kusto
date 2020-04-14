import client from './client';
import { standardizeQueryResponse } from './responseConversionts';

const defaultDB = process.env.ADX_DATABASE_NAME;

// promisified adx message execution
const execute = (exports.execute = (
  message: string,
  raw = false,
  dbName: string = defaultDB
): object =>
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
exports.convertToTableName = (name): string => {
  if (!name) throw new Error('Failed to determine table name. Starting name not provided.');
  return name.replace(/[^\w\d\.-]/gi, '');
};

// removes an adx function if it exists
exports.dropFunctionByName = async (functionName: string): Promise<void> => {
  const message = `.drop function ['${functionName}'] ifexists`;
  await execute(message);
};

// create a kusto table with the provided schema
exports.createTableWithSchema = async (tableName, schema, folder): Promise<void> => {
  let message = `.create-merge table ['${tableName}'] (${schema})`;

  if (folder) {
    message += `with (folder="${folder}")`;
  }

  await execute(message);
};
