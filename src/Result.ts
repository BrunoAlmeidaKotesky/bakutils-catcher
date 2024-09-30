import { LeftFunctor, RightFunctor } from "./Functor";
import { MatchResult } from "./Match";
import { None, Option } from "./Option";

/** Represents a failed computation.*/
export interface Left<T, E> extends MatchResult<T, E>, LeftFunctor<T, E> {
    type: 'error';
    error: E;
    /*** Returns the value of the Result if it is successful, otherwise throws an error.*/
    unwrap(): T;
    /*** Returns the value of the Result if it is successful, otherwise returns the provided default value.*/
    unwrapOr(defaultValue: T): T;
    /*** Returns the value of the Result if it is successful, otherwise calls the provided function with the error and returns its result.*/
    unwrapOrElse(fn: (error: E) => T): T;
    /*** Returns true if the Result is an error, false otherwise.*/
    isErr(this: Result<T, E>): this is Left<T, E>;
    /*** Returns true if the Result is successful, false otherwise.*/
    isOk(this: Result<T, E>): this is Right<T, E>;
    /** Converts the Result into an Option. */
    toOption(): Option<T>;
    toJSON(): void;

}

/** Represents a successful computation.*/
export interface Right<T, E> extends MatchResult<T, E>, RightFunctor<T, E> {
    type: 'ok';
    value: T;
    /*** Returns the value of the Result.*/
    unwrap(): T;
    /*** Returns the value of the Result.*/
    unwrapOr(defaultValue: T): T;
    /*** Returns the value of the Result.*/
    unwrapOrElse(fn: (error: E) => T): T;
    /*** Returns true if the Result is an error, false otherwise.*/
    isErr(this: Result<T, E>): this is Left<T, E>;
    /*** Returns true if the Result is successful, false otherwise.*/
    isOk(this: Result<T, E>): this is Right<T, E>;
    /** Converts the Result into an Option. */
    toOption(): Option<T>;
}

/**Represents the result of a computation that can either succeed with a value of type T or fail with an error of type E.*/
export type Result<T, E> = Left<T, E> | Right<T, E>;

/** Creates a successful Result with the given value.
 * @param value The value of the successful computation.
 * @returns A Result with the 'ok' type and the provided value.*/
export function Ok<T, E>(value: T): Result<T, E> {
    return {
        type: 'ok',
        value,
        unwrap: () => value,
        unwrapOr: () => value,
        unwrapOrElse: () => value,
        isErr: () => false,
        isOk: () => true,
        toOption: () => Option(value),
        flatMap: (fn) => fn(value),
        match: (handlers) => handlers.Ok(value),
        map: <U>(fn: (value: T) => U): Result<U, E> => {
            try {
                return Ok(fn(value));
            } catch (error) {
                return Err(error as E);
            }
        },
        flatMapAsync: async (fn) => fn(value),
    };
}

/**
 * Creates a failed Result with the given error.
 * @param error The error that caused the computation to fail.
 * @returns A Result with the 'error' type and the provided error.
 */
export function Err<T, E>(error: E): Result<T, E> {
    return {
        type: 'error',
        error,
        unwrap: () => { throw error; },
        unwrapOr: (defaultValue: T) => defaultValue,
        unwrapOrElse: (fn: (error: E) => T) => fn(error),
        isErr: () => true,
        isOk: () => false,
        toOption: () => None,
        toJSON: () => { throw error; },
        flatMap: () => Err(error),
        match: (handlers) => handlers.Err(error),
        map: <U>(_fn: (value: T) => U): Result<T, E> => {
            return this;
        },
        flatMapAsync: async () => Err(error),
    };
}
/**Checks if the provided value is a Result.*/
export function isResult<T, E>(result: any): result is Result<T, E> {
    return result && ((result.type === 'ok' && 'value' in result) || (result.type === 'error' && 'error' in result));
}