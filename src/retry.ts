export const retry = async <T>(fn: () => Promise<T>, count: number, lastError?: Error): Promise<T> => {
  if (count <= 0) throw lastError;
  try {
    const result = await fn();
    return result;
  } catch (error) {
    return retry(fn, count - 1, error as Error);
  }
};
