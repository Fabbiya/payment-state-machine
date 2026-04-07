export type Result<T> = Success<T> | Failure;

export interface Success<T> {
  ok: true;
  value: T;
}

export interface Failure {
  ok: false;
  error: Error;
}

export const Result = {
  ok: <T>(value: T): Result<T> => ({ ok: true, value }),
  fail: (message: string | Error): Result<never> => ({
    ok: false,
    error: typeof message === 'string' ? new Error(message) : message,
  }),
};
