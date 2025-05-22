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
export type Handler<R = any, E = any, A extends any[] = any[], C = any> = (err: E, context: C, ...args: A) => R;
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
export declare function Catcher<R = any, E extends Error = Error, A extends any[] = any[], C = any>(ErrCls: new (...p: any[]) => E, handler: Handler<R, E, A, C>): (_t: any, _k: string, d: PropertyDescriptor) => PropertyDescriptor;
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
export declare function DefaultCatcher<R = any, Args extends any[] = any[], C = any>(handler: Handler<R, Error, Args, C>): (_t: any, _k: string, d: PropertyDescriptor) => PropertyDescriptor;
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
export declare function AnyErrorCatcher<R = any, A extends any[] = any[], C = any>(handler: Handler<R, unknown, A, C>): (_t: any, _k: string, d: PropertyDescriptor) => PropertyDescriptor;
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
export declare function defaultCatcher<R = any, A extends any[] = any[], C = any>(fn: (...a: A) => any, handler: Handler<R, Error, A, C>): (...a: A) => R | Promise<R>;
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
export declare function catcher<R = any, E extends Error = Error, A extends any[] = any[], C = any>(fn: (...a: A) => any, ErrCls: new (...a: any[]) => E, handler: Handler<R, E, A, C>): (...a: A) => R | Promise<R>;
