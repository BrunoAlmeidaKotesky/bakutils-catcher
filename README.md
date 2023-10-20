## bakutils-catcher
This library is a lightweight, easy-to-use, with Decorators, to catch exceptions and errors in your code and Algebraic Data Types with Rust-like features with `Result` and `Option`.

For a better understanding of the `Option` and `Result` type features, i recommend that you read the following article [Enhancing TypeScript: Implementing Robust Error Handling with Result and Option](https://dev.to/brunoalmeidakotesky/enhancing-typescript-implementing-robust-error-handling-with-result-and-option-o5j)

*Note*: When using the decorators features, make sure that the `tsconfig.json` file has the `experimentalDecorators` and `emitDecoratorMetadata` properties enabled and [reflect-metadata]() library is installed/imported. Since this library is meant to have zero dependencies, it is not included in the package.

#### Installation
Please follow the standard npm package installation steps.
```shell
npm install bakutils-catcher
#or
yarn add bakutils-catcher
#or
pnpm add bakutils-catcher
```

*Note*: Make sure to include reflect-metadata as it's required for decorators but is not included as a dependency in this package.

### Features

##### Algebraic Data Types
###### Result
The Result type can either be a Left representing a failed computation or a Right representing a successful computation.

- **Left**: Represents a failed computation.
    - .unwrap(): Returns the value of the Result if it is successful, otherwise throws an error.
    - .unwrapOr(defaultValue): Returns the value of the Result if it is successful, otherwise returns the - provided default value.
    - .unwrapOrElse(fn): Returns the value of the Result if it is successful, otherwise calls the - provided function with the error and returns its result.
    - .isErr(): Returns true if the Result is an error, false otherwise.
    - .isOk(): Returns true if the Result is successful, false otherwise.

- **Right**: Represents a successful computation.
    - .unwrap(): Returns the value of the Result.
    - .unwrapOr(defaultValue): Returns the value of the Result.
    - .unwrapOrElse(fn): Returns the value of the Result.
    - .isErr(): Returns true if the Result is an error, false otherwise.
    - .isOk(): Returns true if the Result is successful, false otherwise.

###### Option
The Option type can either be Some representing an existing value or None representing no value.

- **Some**: Represents an Option that contains a value.
    - .unwrap(): Returns the value of the Option if it exists, otherwise throws an error.
    - .unwrapOr(defaultValue): Returns the value of the Option if it exists, otherwise returns the - provided default value.
    - .unwrapOrElse(fn): Returns the value of the Option if it exists, otherwise calls the provided - function and returns its result.
    - .isSome(): Returns true if the Option contains a value, false otherwise.
    - .isNone(): Returns true if the Option does not contain a value, false otherwise.
- **None**: Represents an Option that does not contain a value.
    - .unwrap(): Throws an error because None does not contain a value.
    - .unwrapOr(defaultValue): Returns the provided default value because None does not contain a value.
    - .unwrapOrElse(fn): Calls the provided function and returns its result because None does not contain a value.
    - .isSome(): Returns true if the Option contains a value, false otherwise.
    - .isNone(): Returns true if the Option does not contain a value, false otherwise.

You can wrap any value with the `Option` function (Not the type) on cases where you are not sure if the value is `null` or `undefined`.
```ts
import {Option, Some} from 'bakutils-catcher';
let unknownRunTimeValue = /*...*/;
//TypeScript will infer if you are using Option as a type or as a function.
const someValue = Option(unknownRunTimeValue);
const typedSomeValue: Option<number> = Some(unknownRunTimeValue);
```

##### Decorators
###### Catch
A TypeScript decorator that wraps a class method with error-handling logic. It catches errors of a specific type thrown within the decorated method.

**Usage**

```ts
class SomeThing {
    @Catch(MyError, (err, context, ...args) => {
    // handle error here
    })
    public myMethodWithoutTryCatch() {}
}
```

###### DefaultCatch
A TypeScript decorator that wraps a class method with error-handling logic. It catches all errors thrown within the decorated method.

**Usage**

```ts
class SomeThing {
    @DefaultCatch((err, context, ...args) => {
    // handle error here
    })
    public myMethodWithoutTryCatch() {}
}
```

### Quick Start
Here's a quick example to get you started:

```ts
import { Ok, Err, Some, None, Catch, DefaultCatch } from 'bakutils-catcher';

// Using Result
const goodResult = Ok("Success");
const badResult = Err("Failure");

// Using Option
const someValue = Some(42);
const noValue = None;

// Using Catch Decorator
class MyClass {
  @Catch(MyError, (err) => {
    console.log("Caught a MyError:", err);
  })
  myMethod() {
    throw new MyError("Oops!");
  }
}

// Using DefaultCatch Decorator
class AnotherClass {
  @DefaultCatch((err) => {
    console.log("Caught an error:", err);
  })
  anotherMethod() {
    throw new Error("Oops again!");
  }
}
```

License
This project is licensed under the MIT License.