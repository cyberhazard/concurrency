type HandlerHelpers<T> = {
    addToTail: (item: T) => void;
    skip: () => void;
    throwError: (error: Error) => void;
};
type Handler<T, U> = (item: T, helpers: HandlerHelpers<T>) => Promise<U | void>;
type ResultItem<U> = {
    type: 'result';
    data: U;
};
type SkippedItem = {
    type: 'skipped';
    message?: string;
};
type ErrorItem = {
    type: 'error';
    error: Error;
};
type EmptyItem = {
    type: 'empty';
};
type Result<U> = ResultItem<U> | SkippedItem | ErrorItem | EmptyItem;
type ErrorResult<T> = {
    item: T;
    error: Error;
};
type LoggerArgs<T, U> = {
    total: number;
    current: number;
    item: T;
    result: Result<U>;
    offset: number;
};
type LoggerFunc<T, U> = (data: LoggerArgs<T, U>) => void;
type Options<T, U> = {
    concurrency?: number;
    delay?: number;
    retries?: number;
    signal?: AbortSignal;
    logger?: LoggerFunc<T, U>;
};
type FuncResult<T, U> = {
    results: U[];
    errors: ErrorResult<T>[];
};

declare const concurrency: <T, U>(data: T[], handler: Handler<T, U>, options?: Options<T, U>) => Promise<FuncResult<T, U>>;

declare const retry: <T>(fn: () => Promise<T>, count: number, lastError?: Error) => Promise<T>;

export { type Handler, type LoggerFunc, type Options, concurrency, retry };
