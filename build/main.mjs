// src/retry.ts
var retry = async (fn, count, lastError) => {
  if (count <= 0) throw lastError;
  try {
    const result = await fn();
    return result;
  } catch (error) {
    return retry(fn, count - 1, error);
  }
};

// src/concurrency.ts
var DEFAULT_CONCURRENCY = 1;
var DEFAULT_DELAY = 0;
var DEFAULT_RETRY_COUNT = 1;
var wait = (ms) => new Promise((r) => setTimeout(r, ms));
var concurrency = (data, handler, options = {}) => new Promise((resolve, reject) => {
  const input = [...data];
  const iterator = input.values();
  let count = 1;
  let isAborted = false;
  const results = [];
  const errors = [];
  if (options.signal) {
    options.signal.addEventListener("abort", () => {
      isAborted = true;
      reject(Error(options.signal?.reason));
    });
  }
  const addToInput = (item) => input.push(item);
  const promises = Array(options.concurrency || DEFAULT_CONCURRENCY).fill(iterator).map(async (items) => {
    for (const item of items) {
      if (isAborted) break;
      let result = { type: "empty" };
      try {
        const payload = await retry(() => handler(item, addToInput), options.retries || DEFAULT_RETRY_COUNT);
        if (payload) {
          result = { type: "result", data: payload };
          results.push(payload);
        }
      } catch (error) {
        result = { type: "error", error };
        errors.push({ item, error });
      }
      options.logger?.({
        current: count++,
        total: input.length,
        item,
        result
      });
      await wait(options.delay || DEFAULT_DELAY);
    }
  });
  Promise.all(promises).then(() => resolve({ results, errors }));
});
export {
  concurrency,
  retry
};
