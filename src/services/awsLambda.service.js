import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

export const getAiSuggestion = async (question) => {
  const command = new InvokeCommand({
    FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    Payload: JSON.stringify({ question }),
  });

  const response = await lambda.send(command);
  const payload = Buffer.from(response.Payload).toString();

  return JSON.parse(payload);
};