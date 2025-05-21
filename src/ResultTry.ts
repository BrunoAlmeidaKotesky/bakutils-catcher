import { Result, Ok, Err } from "./Result";

type AsyncReturnType<F extends (...args: any) => any> = F extends (...args: any[]) => Promise<infer R>
    ? R
    : ReturnType<F>;

/**
 * An error-case type which may be:
 * - A fixed error instance of type `E`
 * - A function that takes `(originalError, ...fnArgs)` and returns an `E`
 */
export type ErrorCase<E, Fn extends (...args: any[]) => any> =
    | E
    | ((error: unknown, ...args: Parameters<Fn>) => E);

/**
 * Attempts to execute `fn(...args)`, returning a `Promise<Result<T, E>>`.
 *
 * - If `fn` completes successfully (sync or async), returns `Ok<T>`.
 * - If it throws or rejects, returns `Err<E>`.
 *
 * The function signature is inferred from `fn`, so:
 * - `args` must match `Parameters<Fn>`
 * - If `errorCase` is a function, its signature is `(error: unknown, ...args: Parameters<Fn>) => E`.
 *
 * @template Fn - A function type `( ...args ) => T or Promise<T>`
 * @template E  - The error type (default `Error`)
 *
 * @param fn        - The function to execute (can be sync or async).
 * @param args      - The parameter tuple to call `fn` with (must match `Parameters<Fn>`).
 * @param errorCase - Either a fixed error `E` or a function `(error, ...args) => E`.
 *
 * @returns A `Promise<Result<T, E>>`, where `T` is the possibly awaited type of `fn`'s return.
 *
 * @example
 * function add(a: number, b: number) { return a + b; }
 * const r1 = await ResultTry(add, [5, 7]);
 * //    ^? => Promise<Result<number, Error>>
 *
 * function subtract(a: number, b: number) { 
 *   if (a < b) throw new Error("a < b");
 *   return a - b; 
 * }
 * const mapError = (origErr: unknown, a: number, b: number) => 
 *   new RangeError(`Cannot subtract: a=${a}, b=${b}, orig=${(origErr as Error).message}`);
 * const r2 = await ResultTry(subtract, [5, 10], mapError);
 * // => Err(RangeError("Cannot subtract: a=5, b=10, orig=a < b"))
 *
 * async function fetchData(id: number): Promise<string> { ... }
 * const r3 = await ResultTry(fetchData, [42]);
 */
export async function ResultTry<
    Fn extends (...args: any[]) => any,
    E = Error
>(
    fn: Fn,
    args?: Parameters<Fn>,
    errorCase?: ErrorCase<E, Fn>
): Promise<Result<AsyncReturnType<Fn>, E>> {
    try {
        const result = fn(...(args ?? []));
        if (result != null && typeof (result as any).then === "function") {
            const awaited = await Promise.resolve(result as PromiseLike<any>);
            return Ok<AsyncReturnType<Fn>, E>(awaited as AsyncReturnType<Fn>);
        }
        return Ok<AsyncReturnType<Fn>, E>(result as AsyncReturnType<Fn>);
    } catch (originalError) {
        if (typeof errorCase === "function") {
            const mappedError = (errorCase as (
                err: unknown,
                ...a: Parameters<Fn>
            ) => E)(originalError, ...(args ?? [] as unknown as Parameters<Fn>));
            return Err<AsyncReturnType<Fn>, E>(mappedError);
        }
        if (errorCase) {
            return Err<AsyncReturnType<Fn>, E>(errorCase as E);
        }
        return Err<AsyncReturnType<Fn>, E>(originalError as E);
    }
}