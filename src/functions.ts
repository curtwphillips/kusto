import execute from './execute';
import { standardizeTableResponse } from './responseConversions';

// ex: "{['test'] | extend col5 = strcat(col4, '_calc'), col6 = strcat(col4, '_calc2')}"
exports.getFunctionBody = async (functionName: string): Promise<string> => {
  const message = `.show function ['${functionName}']`;
  const response = await execute(message);
  const rows = standardizeTableResponse(response);
  return rows && rows[0] && rows[0].Body;
};

// removes an adx function if it exists
exports.dropFunctionByName = async (functionName: string): Promise<void> => {
  const message = `.drop function ['${functionName}'] ifexists`;
  await execute(message);
};
