import { NoneFunctor, SomeFunctor } from "./Functor";
import { MatchOption } from "./Match";
import { Err, Ok, Result } from "./Result";
import { getFnValue } from "./Utils";

/**
 * Extracts the value type from an Option.
 */
export type RemoveOption<T> = T extends Option<infer U> ? U : T;
/**
 * Represents an Option that may or may not contain a value.
 */
export type Option<T> = SomeType<T> | NoneType<T>;

/**
 * Represents an Option that contains a value.
 */
export interface SomeType<T> extends MatchOption<T>, SomeFunctor<T> {
    type: 'some';
    value: T;
    /*** Returns the value of the Option if it exists, otherwise throws an error.*/
    unwrap(): T;
    /*** Returns the value of the Option if it exists, otherwise returns the provided default value.*/
    unwrapOr(defaultValue: T): T;
    /*** Returns the value of the Option if it exists, otherwise calls the provided function and returns its result.*/
    unwrapOrElse(fn: () => T): T;
    /*** Returns true if the Option contains a value, false otherwise.*/
    isSome(this: Option<T>): this is SomeType<T>;
    /*** Returns true if the Option does not contain a value, false otherwise.*/
    isNone(this: Option<T>): this is NoneType<T>;
    /** Transforms the Option into a Result, with a provided error value. */
    okOr<E>(this: Option<T>, _err: E): Result<T, E>;
    /** Transforms the Option into a Result, with a provided error function.*/
    okOrElse<E>(this: Option<T>, _errFn: () => E): Result<T, E>;
    /**Flat the value to a single level if the value is already an Option. */
    flatten(): Option<RemoveOption<T>>;
    /** 
     *@intenal
     *This method is used by default on `JSON.stringify` to serialize the object.
     *
     ***It does not need to be called directly.**
     *
     *It will convert the Option<T> to the value T, so it can be serialized if the value is serializable.
     */
    toJSON(): void;
    /**Creates a structured clone of the Option itself and the whole value tree. */
    clone(): this;
}

/**
 * Represents an Option that does not contain a value.
 */
export interface NoneType<T = never> extends MatchOption<T>, NoneFunctor<T> {
    type: 'none';
    /*** Throws an error because None does not contain a value.*/
    unwrap(): never;
    /*** Returns the provided default value because None does not contain a value.*/
    unwrapOr<T>(defaultValue: T): T;
    /*** Calls the provided function and returns its result because None does not contain a value.*/
    unwrapOrElse<T>(fn: () => T): T;
    /*** Returns true if the Option contains a value, false otherwise.*/
    isSome(this: Option<T>): this is SomeType<T>;
    /*** Returns true if the Option does not contain a value, false otherwise.*/
    isNone(this: Option<T>): this is NoneType<T>;
    /** Transforms the Option into a Result, with a provided error value. */
    okOr<E>(this: Option<unknown>, err: E): Result<never, E>;
    /** Transforms the Option into a Result, with a provided error function.*/
    okOrElse<E>(this: Option<unknown>, errFn: () => E): Result<never, E>;
    /** This method is used by default on `JSON.stringify` to serialize the object.
     * It does not need to be called directly.
     */
    toJSON(): void;
    /**Flat the value to a single level if the value is already an Option. */
    flatten(): Option<RemoveOption<T>>;
    /**Cloning a None will return the same None instance. */
    clone(): Option<T>;
}


/**
 * Checks if the provided value is an Option.
 * @param value The value to be checked.
 * @returns True if the value is an Option, false otherwise.
 */
export function isOption<T>(value: unknown): value is Option<T> {
    if (value === null || value === undefined) return false;
    return typeof value === 'object' && !!value && 'type' in value && (value as Option<T>).type === 'some' || (value as Option<T>).type === 'none';
}

/**
 * Creates an Option with a value.
 * @param value The value to be wrapped in the Option.
 * @returns An Option with the 'some' type and the provided value.
 */
export function Some<T>(value: T extends null | undefined ? never : T): Option<T> {
    if (value === null || value === undefined)
        throw new Error("Some() cannot be called with null or undefined");
    return {
        type: 'some',
        value,
        unwrap: () => value,
        unwrapOr: () => value,
        unwrapOrElse: () => value,
        isSome: () => true,
        isNone: () => false,
        map: (fn) => Some(fn(value)),
        flatMap: (fn) => fn(value),
        flatMapAsync: async (fn) => fn(value),
        okOr: (_err) => Ok(value),
        okOrElse: (_errFn) => Ok(value),
        mapOr: (fn, defaultValue) => {
            const option = Option(fn(value));
            return option.isNone() ? Option(getFnValue(defaultValue)) : option;
        },
        flatten: () => {
            if (isOption(value) && value.isSome())
                return value as SomeType<RemoveOption<T>>;
            else
                throw new Error('Cannot flatten a non-option value');
        },
        match: (handlers) => handlers.Some(value),
        toJSON: () => value,
        clone: () => structuredClone(this)
    };
}

/**
 * Represents an empty Option with no value.
 *
 * An `None` is stringfied to `null` when using `JSON.stringify`.
 * @returns An Option with the 'none' type.
 */
export const None: Option<never> = {
    type: 'none',
    unwrap: () => { throw new Error('Cannot unwrap None'); },
    unwrapOr: <T>(defaultValue: T) => defaultValue,
    unwrapOrElse: <T>(fn: () => T) => fn(),
    isSome: () => false,
    isNone: () => true,
    map: () => None,
    flatMap: (_fn) => None,
    flatMapAsync: async (_fn) => None,
    okOr: (err) => Err(err),
    okOrElse: (errFn) => Err(errFn()),
    mapOr: (_fn, defaultValue) => Option(getFnValue(defaultValue)),
    toJSON: () => null,
    flatten: () => None,
    match: (handlers) => handlers.None(),
    clone: () => None
};
Object.freeze(None);

/**
 * 
 * @param value A value that may contain a value or be undefined or null.
 * @returns An Option with the 'some' type if the provided value is not undefined or null, otherwise an Option with the 'none' type.
 * 
 * This wrapper is useful when you want to convert a value that you don't know if it is defined or not.
 */
export function Option<T>(value: T | undefined | null): Option<T> {
    return value === undefined || value === null ? None : Some(value);
}