export declare function BAKUtilsIsPromise<T = any>(o: any): o is Promise<T>;
export declare function BAKUtilsIsThenable<T = any>(o: any): o is PromiseLike<T>;
export declare function BAKUtilsIsXrmPromiseLike<T = any>(o: any): o is PromiseLike<T> & {
    catch: Function;
};
export declare function BAKUtilsIsFunction(fn: any): fn is Function;
export interface ErrorCallbackObject {
    errorCode: number;
    message: string;
    [k: string]: any;
}
export declare function BAKUtilsIsXrmError(obj: any): obj is ErrorCallbackObject;
export type ValueOrFn<T> = T | (() => T);
/**
* Internal function to get the value of a ValueOrFn type.
* If the provided value is a function, it will be called and its result will be returned.
* Otherwise, the value itself will be returned.
*/
export declare const BAKUtilsGetFnValue: <T>(df: ValueOrFn<T>) => T;
