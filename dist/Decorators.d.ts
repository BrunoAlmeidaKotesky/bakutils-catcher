/**
 * Signature for a user‑supplied *error handler*.
 *
 * @template Return Return type of the handler (becomes the resolved value of the wrapper).
 * @template ErrorType Error type that will be forwarded to the handler.
 * @template ArgsType Tuple of the original function parameters.
 * @template Ctx Runtime `this` context inside the wrapper.
 *
 * @example
 * ```ts
 * const logAndReturnNull: Handler<null, Error> = (err) => {
 *   console.error('Ouch →', err.message);
 *   return null; // caller receives `null`
 * };
 * ```
 */
export type Handler<Return = any, Err = any, Args extends any[] = any[], Ctx = any> = (err: Err, fnName: string, ctx: Ctx, ...args: Args) => Return;
export type ErrCtor<E> = (new (...p: any[]) => E) | undefined;
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
export declare function Catcher<ReturnType = any, ErrorType extends Error = Error, Args extends any[] = any[], Ctx = any>(ErrCls: new (...p: any[]) => ErrorType, handler: Handler<ReturnType, ErrorType, Args, Ctx>): (target: any, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any> | void;
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
export declare function DefaultCatcher<ReturnType = any, Args extends any[] = any[], Ctx = any>(handler: Handler<ReturnType, Error, Args, Ctx>): (target: any, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any> | void;
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
export declare function AnyErrorCatcher<ReturnType = any, Args extends any[] = any[], Ctx = any>(handler: Handler<ReturnType, unknown, Args, Ctx>): (target: any, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any> | void;
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
export declare function catcher<ReturnType = any, ErrorType extends Error = Error, Args extends any[] = any[], Ctx = any>(fn: (...a: Args) => any, ErrCls: new (...a: any[]) => ErrorType, handler: Handler<ReturnType, ErrorType, Args, Ctx>): (...a: Args) => ReturnType | Promise<ReturnType>;
