export const formatResponse = (data: any, message: string = 'Success') => ({
  data,
  message,
  timestamp: new Date().toISOString(),
});
