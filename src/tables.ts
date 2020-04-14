import execute from './execute';

// removes invalid table name characters
exports.convertToTableName = (name: string): string => {
  if (!name) throw new Error('Failed to determine table name. Starting name not provided.');
  return name.replace(/[^\w\d\.-]/gi, '');
};

// create a kusto table with the provided schema
exports.createTableWithSchema = async (tableName, schema, folder): Promise<void> => {
  let message = `.create-merge table ['${tableName}'] (${schema})`;

  if (folder) {
    message += `with (folder="${folder}")`;
  }

  await execute(message);
};
