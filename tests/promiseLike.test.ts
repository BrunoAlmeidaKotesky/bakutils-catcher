import { catcher, defaultCatcher } from "../src";

describe("PromiseLike support (custom thenable)", () => {
    function thenableFn(shouldFail: boolean): PromiseLike<string> {
        return {
            then(onFulfilled, onRejected) {
                setTimeout(() => {
                    if (shouldFail) {
                        onRejected!(new Error("thenable failure"));
                    } else {
                        onFulfilled!("thenable ok");
                    }
                }, 0);
                return this;
            }
        };
    }

    it("defaultCatcher should catch errors from a custom thenable", async () => {
        const safe = defaultCatcher(
            thenableFn,
            async err => `fallback: ${err.message}`
        );

        // success case
        await expect(safe(false)).resolves.toBe("thenable ok");
        // failure case
        await expect(safe(true)).resolves.toBe("fallback: thenable failure");
    });

    it("catcher should only handle specific Error type in thenable", async () => {
        class MyError extends Error { }
        function thenableErrors(flag: boolean): PromiseLike<string> {
            return {
                then(onF, onR) {
                    setTimeout(() => {
                        if (flag) onR!(new MyError("my error"));
                        else onF!("my success");
                    }, 0);
                    return this;
                }
            };
        }

        const safeMyError = catcher(
            thenableErrors,
            MyError,
            async err => `caught MyError: ${err.message}`
        );

        // success with no error
        await expect(safeMyError(false)).resolves.toBe("my success");
        // MyError case
        await expect(safeMyError(true)).resolves.toBe("caught MyError: my error");
    });
});
