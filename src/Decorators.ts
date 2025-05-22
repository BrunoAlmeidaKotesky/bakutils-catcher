import { BAKUtilsIsPromise, BAKUtilsIsThenable, BAKUtilsIsXrmPromiseLike, BAKUtilsIsXrmError } from './Utils';

/**
 * Signature for a user‑supplied *error handler*.
 *
 * @template R Return type of the handler (becomes the resolved value of the wrapper).
 * @template E Error type that will be forwarded to the handler.
 * @template A Tuple of the original function parameters.
 * @template C Runtime `this` context inside the wrapper.
 *
 * @example
 * ```ts
 * const logAndReturnNull: Handler<null, Error> = (err) => {
 *   console.error('Ouch →', err.message);
 *   return null; // caller receives `null`
 * };
 * ```
 */
export type Handler<R = any, E = any, A extends any[] = any[], C = any> = (
    err: E,
    context: C,
    ...args: A
) => R;

type ErrCtor<E> = (new (...p: any[]) => E) | undefined;

/**
 * Core implementation used by *both* decorators and higher‑order wrappers.
 * Deals with:
 *  * native Promises
 *  * Dynamics‑CRM `Xrm.Async.PromiseLike`
 *  * generic thenables
 *  * plain sync returns
 */
function createCatchLogic<R, E extends Error, A extends any[], C>(
    ErrorClass: new (...a: any[]) => E | undefined,
    handler: Handler<R, any, A, C>,
    fn: (...a: A) => any,
) {
    return function (this: C, ...args: A): any {
        const invokeHandler = (err: any) => handler.call(null, err, this, ...args);

        try {
            const result = fn.apply(this, args);

            if (BAKUtilsIsPromise(result)) {
                return result.catch(invokeHandler);
            }

            if (BAKUtilsIsXrmPromiseLike(result)) {
                return new Promise((ok, bad) => (result as any).then(ok).catch(bad)).catch(
                    invokeHandler,
                );
            }

            if (BAKUtilsIsThenable(result)) {
                return Promise.resolve(result).catch(invokeHandler);
            }

            return result;
        } catch (syncErr) {
            if (!ErrorClass || syncErr instanceof ErrorClass || BAKUtilsIsXrmError(syncErr)) {
                return invokeHandler(syncErr);
            }
            throw syncErr;
        }
    };
}

function makeDecorator<R, E, A extends any[], C>(
    ErrClass: ErrCtor<E>,
    handler: Handler<R, E, A, C>,
) {
    return (_t: any, _k: string, d: PropertyDescriptor) => {
        const original = d.value;
        d.value = createCatchLogic<R, any, A, C>(ErrClass as any, handler, original);
        return d;
    };
}

/**
 * `@Catcher(SpecificError, handler)` — catch **only** a specific error subclass.
 *
 * @example
 * ```ts
 * class DBError extends Error {}
 *
 * class Repo {
 *   @Catcher(DBError, (e) => console.warn('DB down:', e.message))
 *   query() { throw new DBError('timeout'); }
 * }
 * new Repo().query(); // logged but not re‑thrown
 * ```
 */
export const Catcher = (ErrCls: any, h: any) =>
    makeDecorator<any, any, any[], any>(ErrCls, h);

/**
 * `@DefaultCatcher(handler)` — catch **all** throwables (alias for `Error`).
 *
 * @example
 * ```ts
 * class Svc {
 *   @DefaultCatcher((e) => console.error('Boom →', e))
 *   risky() { throw new RangeError('🙅'); }
 * }
 * ```
 */
export const DefaultCatcher = (h: any) => Catcher(Error, h);

/**
 * `@AnyErrorCatcher(handler)` — catch literally *anything* (no instance checks).
 *
 * @example
 * ```ts
 * class Whatever {
 *   @AnyErrorCatcher(() => 'fallback')
 *   run() { throw 'string‑error'; }
 * }
 * new Whatever().run(); // → "fallback"
 * ```
 */
export const AnyErrorCatcher = <R, A extends any[] = any[], C = any>(
    handler: Handler<R, any, A, C>,
) => makeDecorator<R, any, A, C>(undefined, handler);

/* -------------------------------------------------------------------------- */
/**
 * `defaultCatcher(fn, handler)` — wrap a function and intercept **any** error.
 *
 * @example
 * ```ts
 * const safeJSON = defaultCatcher(
 *   (txt: string) => JSON.parse(txt),
 *   () => ({})
 * );
 * safeJSON('{ bad'); // → {}
 * ```
 */
export function defaultCatcher<R = any, A extends any[] = any[], C = any>(
    fn: (...a: A) => any,
    handler: Handler<R, Error, A, C>,
) {
    return createCatchLogic<R, Error, A, C>(Error, handler, fn) as (
        ...a: A
    ) => R | Promise<R>;
}

/**
 * `catcher(fn, SpecificError, handler)` — function wrapper variant of `@Catcher`.
 *
 * @example
 * ```ts
 * const run = catcher(
 *   () => { if (Math.random() < .5) throw new TypeError('bad'); return 'ok'; },
 *   TypeError,
 *   () => 'recovered'
 * );
 * run(); // either 'ok' or 'recovered'
 * ```
 */
export function catcher<
    R = any,
    E extends Error = Error,
    A extends any[] = any[],
    C = any,
>(
    fn: (...a: A) => any,
    ErrCls: new (...a: any[]) => E,
    handler: Handler<R, E, A, C>,
) {
    return createCatchLogic<R, E, A, C>(ErrCls, handler, fn) as (
        ...a: A
    ) => R | Promise<R>;
}