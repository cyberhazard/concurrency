export type Handler<T, U> = (item: T) => Promise<U | void>;

export type ResultItem<U> = { type: 'result'; data: U };
export type SkippedItem = { type: 'skipped'; message?: string };
export type ErrorItem = { type: 'error'; error: Error };
export type EmptyItem = { type: 'empty' };

export type Result<U> = ResultItem<U> | SkippedItem | ErrorItem | EmptyItem;

export type ErrorResult<T> = {
  item: T;
  error: Error;
};

export type LoggerArgs<T, U> = {
  /** Total items */
  total: number;
  /** Current done counter */
  current: number;
  /** Current item */
  item: T;
  /** Result of current handler */
  result: Result<U>;
};

export type LoggerFunc<T, U> = (data: LoggerArgs<T, U>) => void;

export type Options<T, U> = {
  /** Concurrency, default 1 */
  concurrency?: number;
  /** Delay between handlers (in ms), default 0 */
  delay?: number;
  /** Number of retries on handler error */
  retries?: number;
  /** Abort signal */
  signal?: AbortSignal;
  /** Logger fuction. Triggers after handler */
  logger?: LoggerFunc<T, U>;
};

export type FuncResult<T, U> = {
  results: U[];
  errors: ErrorResult<T>[];
};
