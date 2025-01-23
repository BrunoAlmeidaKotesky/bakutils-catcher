import { ResultTry } from "../src";

class MyCustomError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MyCustomError.prototype);
  }
}

describe("ResultTry - Parameter Inference", () => {

  function add(a: number, b: number): number {
    return a + b;
  }

  async function asyncUpperCase(str: string): Promise<string> {
    if (!str) throw new Error("Empty string!");
    return str.toUpperCase();
  }

  it("sync function with correct args", async () => {
    // add expects (number, number)
    const res = await ResultTry(add, [10, 20]);
    expect(res.type).toBe("ok");
    if (res.type === "ok") {
      expect(res.value).toBe(30);
    }
  });

  // This test won't compile if you pass, e.g., [10, "wrongString"] => type error
  // it("sync function with wrong args -> should show TS error", async () => {
  //   const res = await ResultTry(add, [10, "x"]); // Type error
  // });

  it("sync function that throws + custom errorCase mapping with args", async () => {
    function subtract(a: number, b: number) {
      if (a < b) throw new Error("a < b");
      return a - b;
    }

    const mapErr = (orig: unknown, a: number, b: number) => {
      return new MyCustomError(`Mapped subtract error: ${ (orig as Error).message }, a=${a}, b=${b}`);
    };

    // a=5, b=10 => will throw
    const res = await ResultTry(subtract, [5, 10], mapErr);
    expect(res.type).toBe("error");
    if (res.type === "error") {
      expect(res.error).toBeInstanceOf(MyCustomError);
      expect(res.error.message).toContain("Mapped subtract error: a < b, a=5, b=10");
    }
  });

  it("async function with correct args", async () => {
    // asyncUpperCase expects (string)
    const res = await ResultTry(asyncUpperCase, ["hello"]);
    expect(res.type).toBe("ok");
    if (res.type === "ok") {
      expect(res.value).toBe("HELLO");
    }
  });

  it("async function that throws + fixed errorCase", async () => {
    // Throw if str is empty
    const fixedError = new MyCustomError("We always override the original error");
    const res = await ResultTry(asyncUpperCase, [""], fixedError);
    expect(res.type).toBe("error");
    if (res.type === "error") {
      expect(res.error).toBe(fixedError);
      expect(res.error.message).toBe("We always override the original error");
    }
  });

  it("async function that throws + mapping function with arguments", async () => {
    // We'll pass an empty string, so it throws "Empty string!"
    const mapErr = (orig: unknown, text: string) =>
      new MyCustomError(`Mapped async fail for "${text}": ${(orig as Error).message}`);

    const res = await ResultTry(asyncUpperCase, [""], mapErr);
    expect(res.type).toBe("error");
    if (res.type === "error") {
      expect(res.error).toBeInstanceOf(MyCustomError);
      expect(res.error.message).toBe('Mapped async fail for "": Empty string!');
    }
  });
});
