import { retry } from '@/retry';
import { ErrorResult, FuncResult, Handler, Options, Result } from '@/concurrency.types';

const DEFAULT_CONCURRENCY = 1;
const DEFAULT_DELAY = 0;
const DEFAULT_RETRY_COUNT = 1;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 *
 * @param data - Array of items
 * @param handler - Handler that runs on every item in array
 * @param options
 * @returns
 */
export const concurrency = <T, U>(
  data: T[],
  handler: Handler<T, U>,
  options: Options<T, U> = {},
): Promise<FuncResult<T, U>> =>
  new Promise((resolve, reject) => {
    const input = [...data];
    const iterator = input.values();
    let count = 1;
    let offset = 0;
    let isAborted = false;
    const results: U[] = [];
    const errors: ErrorResult<T>[] = [];

    if (options.signal) {
      options.signal.addEventListener('abort', () => {
        isAborted = true;
        reject(Error(options.signal?.reason));
      });
    }

    const incOffset = (num: number = 1) => {
      offset += num;
    };

    const addToTail = (item: T) => {
      input.push(item);
      incOffset();
    };

    const promises = Array<ArrayIterator<T>>(options.concurrency || DEFAULT_CONCURRENCY)
      .fill(iterator)
      .map(async (items) => {
        for (const item of items) {
          if (isAborted) break;
          let result: Result<U> = { type: 'empty' };
          let isSkipped = false;
          let error: Error | null = null;

          const skip = () => ((isSkipped = true), null);
          const throwError = (err: Error) => ((error = err), null);

          try {
            const payload = await retry(
              () => handler(item, { addToTail, skip, throwError }),
              options.retries || DEFAULT_RETRY_COUNT,
            );

            if (payload && !isSkipped) {
              result = { type: 'result', data: payload };
              results.push(payload);
            }

            if (isSkipped) {
              result = { type: 'skipped' };
            }

            if (error) {
              throw error;
            }
          } catch (error) {
            result = { type: 'error', error: error as Error };
            errors.push({ item, error: error as Error });
          }

          options.logger?.({
            current: count++,
            total: input.length,
            item,
            result,
            offset,
          });

          await wait(options.delay || DEFAULT_DELAY);
        }
      });

    Promise.all(promises).then(() => resolve({ results, errors }));
  });
