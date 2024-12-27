import type { BaseOptionFunctor } from "./Functor";
import type { MatchOption } from "./Match";
import { type Result } from "./Result";
import { type ValueOrFn } from "./Utils";
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
 */ export interface SomeType<T> extends MatchOption<T>, BaseOptionFunctor<T> {
    type: 'some';
    value: T;
    /*** Returns the value of the Option if it exists, otherwise throws an error.*/
    unwrap(): T;
    /*** Returns the value of the Option if it exists, otherwise returns undefined.*/
    unwrapOrU(): T | undefined;
    /*** Returns the value of the Option if it exists, otherwise returns the provided default value.*/
    unwrapOr(defaultValue: ValueOrFn<T>): T;
    /*** Returns true if the Option contains a value, false otherwise.*/
    isSome(this: Option<T>): this is SomeType<T>;
    /*** Returns true if the Option does not contain a value, false otherwise.*/
    isNone(this: Option<T>): this is NoneType<T>;
    /** Transforms the Option into a Result, with a provided error value. */
    okOr<E>(this: Option<T>, _err: ValueOrFn<E>): Result<T, E>;
    /**Flat the value to a single level if the value is already an Option. */
    flatten(): Option<RemoveOption<T>>;
    /**
     *@internal
     *This method is used by default on `JSON.stringify` to serialize the object.
     *
     ***It does not need to be called directly.**
     *
     *It will convert the Option<T> to the value T, so it can be serialized if the value is serializable.
     */
    toJSON(): void;
    /**Creates a structured clone of the Option itself and the whole value tree. */
    clone(): this;
    /*** Returns a string representation of the Option. */
    toString(): string;
}
/**
 * Represents an Option that does not contain a value.
 */
export interface NoneType<T = never> extends MatchOption<T>, BaseOptionFunctor<T> {
    type: 'none';
    /*** Throws an error because None does not contain a value.*/
    unwrap(): never;
    /*** Returns the value of the Option if it exists, otherwise returns undefined.*/
    unwrapOrU(): T | undefined;
    /*** Returns the provided default value because None does not contain a value.*/
    unwrapOr<T>(defaultValue: ValueOrFn<T>): T;
    /*** Calls the provided function and returns its result because None does not contain a value.*/
    isSome(this: Option<T>): this is SomeType<T>;
    /*** Returns true if the Option does not contain a value, false otherwise.*/
    isNone(this: Option<T>): this is NoneType<T>;
    /** Transforms the Option into a Result, with a provided error value. */
    okOr<E>(this: Option<unknown>, err: ValueOrFn<E>): Result<never, E>;
    /** This method is used by default on `JSON.stringify` to serialize the object.
     * It does not need to be called directly.
     */
    toJSON(): void;
    /**Flat the value to a single level if the value is already an Option. */
    flatten(): Option<RemoveOption<T>>;
    /**Cloning a None will return the same None instance. */
    clone(): Option<T>;
    /*** Returns a string representation of the Option. */
    toString(): string;
}
/**
 * Checks if the provided value is an Option.
 * @param value The value to be checked.
 * @returns True if the value is an Option, false otherwise.
 */
export declare function isOption<T>(value: unknown): value is Option<T>;
/**
 * Creates an Option with a value.
 * @param value The value to be wrapped in the Option.
 * @returns An Option with the 'some' type and the provided value.
 */
export declare function Some<T>(value: T extends null | undefined ? never : T): SomeType<T>;
/**
 * Represents an empty Option with no value.
 *
 * An `None` is stringified to `null` when using `JSON.stringify`.
 * @returns An Option with the 'none' type.
 */
export declare const None: NoneType;
/**
 *
 * @param value A value that may contain a value or be undefined or null.
 * @returns An Option with the 'some' type if the provided value is not undefined or null, otherwise an Option with the 'none' type.
 *
 * This wrapper is useful when you want to convert a value that you don't know if it is defined or not.
 */
export declare function Option<T>(value: ValueOrFn<T> | undefined | null): Option<T>;
