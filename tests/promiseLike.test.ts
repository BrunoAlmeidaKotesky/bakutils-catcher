import { catcher, defaultCatcher } from "../src";

describe("Suporte a PromiseLike (thenable customizado)", () => {
    function thenableFn(shouldFail: boolean): PromiseLike<string> {
        return {
            then(onFulfilled, onRejected) {
                setTimeout(() => {
                    if (shouldFail) {
                        onRejected!(new Error("falha no thenable"));
                    } else {
                        onFulfilled!("ok do thenable");
                    }
                }, 0);
                return this;
            }
        };
    }

    it("defaultCatcher captura erro de um thenable customizado", async () => {
        const safe = defaultCatcher(
            thenableFn,
            async err => `fallback: ${err.message}`
        );

        // caso sem falha
        await expect(safe(false)).resolves.toBe("ok do thenable");
        await expect(safe(true)).resolves.toBe("fallback: falha no thenable");
    });

    it("catcher trata apenas erros do tipo Error específico em thenable", async () => {
        class MeuErro extends Error { }
        function thenableErros(a: boolean): PromiseLike<string> {
            return {
                then(onF, onR) {
                    setTimeout(() => {
                        if (a) onR!(new MeuErro("erro meu"));
                        else onF!("sucesso meu");
                    }, 0);
                    return this;
                }
            };
        }

        const safeSóMeuErro = catcher(
            thenableErros,
            MeuErro,
            async err => `peguei MeuErro: ${err.message}`
        );

        await expect(safeSóMeuErro(false)).resolves.toBe("sucesso meu");
        await expect(safeSóMeuErro(true)).resolves.toBe("peguei MeuErro: erro meu");
    });

    const xrm = (fail: boolean): any => {
        const obj: any = {
            then(ok: any, bad: any) {
                setTimeout(() => (fail ? bad?.({ errorCode: 500, message: 'Xrm fail' })
                    : ok?.('Xrm ok')), 0);
                return obj;
            },
            catch(bad: any) { return obj.then(undefined, bad); }
        };
        return obj;
    };

    it('defaultCatcher Promise Like', async () => {
        const safe = defaultCatcher(xrm, err => `fallback: ${err.message}`);
        await expect(safe(false)).resolves.toBe('Xrm ok');
        await expect(safe(true)).resolves.toBe('fallback: Xrm fail');
    });
});