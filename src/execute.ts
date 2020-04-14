import client from './client';
import { standardizeQueryResponse } from './responseConversions';
import { Response } from './interfaces';

const defaultDB = process.env.ADX_DATABASE_NAME;

// promisified message execution
export default exports.execute = (
  message: string,
  raw = false,
  dbName: string = defaultDB
): Promise<Response> =>
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
  });
