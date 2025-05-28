
# bakutils-catcher

`bakutils-catcher` is a lightweight, easy-to-use TypeScript library providing utilities for robust error handling and functional programming patterns inspired by Rust. 
*Note*: The library contain more pratical examples in the types itself.


- **Decorators**: For catching exceptions and errors in your code using TypeScript decorators.
- **Algebraic Data Types**: Implementations of `Result`, `Option`, and `OneOf` types for expressive and safe error handling.
- **Utilities**: Helper functions and types to support the main features.


## Table of Content
- [Installation](#installation)
- [Algebraic Data Types](#algebraic-data-types)
    - [Result](#result)
    - [Option](#option)
    - [OneOf](#oneof)
- [Decorators](#decorators)
    -[Catcher](#catcher)
    -[Default Catcher](#defaultcatch)
    - [AnyErrorCatcher](#anyerrorcatcher)
- [Quick Start](#quick-start)
- [License](#license)

## Installation

Install the package via npm, yarn, or pnpm:

```shell
# npm
npm install bakutils-catcher

# yarn
yarn add bakutils-catcher

# pnpm
pnpm add bakutils-catcher
```

## Features

### Algebraic Data Types

#### `Result`

The `Result` type represents either success (`Ok`) or failure (`Err`) of an operation, providing expressive error handling without exceptions.

- **`Ok`**: Represents a successful computation.
  - **Methods**:
    - `unwrap()`: Returns the contained value.
    - `unwrapOr(defaultValue)`: Returns the contained value.
    - `unwrapOrElse(fn)`: Returns the contained value.
    - `isOk()`: Returns `true`.
    - `isErr()`: Returns `false`.
    - `map(fn)`: Applies a function to the contained value, returning a new `Result`.
    - `flatMap(fn)`: Applies a function that returns a `Result`, flattening the result.
    - `toOption()`: Converts `Ok` to `Some`.
    - `match(handlers)`: Pattern matches on `Ok`.
- **`Err`**: Represents a failed computation.
  - **Methods**:
    - `unwrap()`: Throws the contained error.
    - `unwrapOr(defaultValue)`: Returns `defaultValue`.
    - `unwrapOrElse(fn)`: Calls `fn` with the error and returns its result.
    - `isOk()`: Returns `false`.
    - `isErr()`: Returns `true`.
    - `map(fn)`: Returns `Err` without applying `fn`.
    - `flatMap(fn)`: Returns `Err` without applying `fn`.
    - `toOption()`: Converts `Err` to `None`.
    - `match(handlers)`: Pattern matches on `Err`.

**Usage Example**:

```typescript
import { Ok, Err, Result } from 'bakutils-catcher';

function parseJSON(jsonString: string): Result<any, Error> {
  try {
    const data = JSON.parse(jsonString);
    return Ok(data);
  } catch (error) {
    return Err(error);
  }
}

const result = parseJSON('{"valid": "json"}');

result.match({
  Ok: (data) => console.log('Parsed data:', data),
  Err: (error) => console.error('Parsing failed:', error),
});
```

#### `Option`

The `Option` type represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.

- **`Some`**: Represents an `Option` that contains a value.
  - **Methods**:
    - `unwrap()`: Returns the contained value.
    - `unwrapOr(defaultValue)`: Returns the contained value.
    - `unwrapOrElse(fn)`: Returns the contained value.
    - `isSome()`: Returns `true`.
    - `isSome(value?: T)`: Checks if the `Option` contains a specific value, without needing to unwrap it. (Avoiding `opt.isSome() && opt.unwrap() == 'something'`)
    - `isNone()`: Returns `false`.
    - `map(fn)`: Applies a function to the contained value, returning a new `Option`.
    - `flatMap(fn)`: Applies a function that returns an `Option`, flattening the result.
    - `okOr(err)`: Converts `Some` to `Ok`.
    - `match(handlers)`: Pattern matches on `Some`.
- **`None`**: Represents an `Option` with no value.
  - **Methods**:
    - `unwrap()`: Throws an error.
    - `unwrapOr(defaultValue)`: Returns `defaultValue`.
    - `unwrapOrElse(fn)`: Calls `fn` and returns its result.
    - `isSome()`: Returns `false`.
    - `isNone()`: Returns `true`.
    - `map(fn)`: Returns `None` without applying `fn`.
    - `flatMap(fn)`: Returns `None` without applying `fn`.
    - `okOr(err)`: Converts `None` to `Err`.
    - `match(handlers)`: Pattern matches on `None`.
    - `toSome(value: T2)`: Converts a `None` type into a `Some` type containing the provided value.

**Usage Example**:

```typescript
import { Option, Some, None } from 'bakutils-catcher';

function getConfigValue(key: string): Option<string> {
  const value = process.env[key];
  return value ? Some(value) : None;
}

const configValue = getConfigValue('API_KEY');

if (configValue.isSome()) {
  console.log('API Key:', configValue.unwrap());
} else {
  console.error('API Key is not set');
}
```

#### `OneOf`

The `OneOf` type represents a value that can be one of several possible types, each identified by a label. It's similar to a tagged union or variant type.

**Usage Example**:

```typescript
import { createOneOf, OneOf } from 'bakutils-catcher';

// Define labels and corresponding types
type Shape = {
  Circle: { radius: number };
  Square: { side: number };
  Rectangle: { width: number; height: number };
};

// Create instances of OneOf
const circle: OneOf<Shape> = createOneOf('Circle', { radius: 5 });
const square: OneOf<Shape> = createOneOf('Square', { side: 10 });

// Use the `match` method to handle each shape
function area(shape: OneOf<Shape>): number {
  return shape.match({
    Circle: ({ radius }) => Math.PI * radius ** 2,
    Square: ({ side }) => side ** 2,
    Rectangle: ({ width, height }) => width * height,
  });
}

console.log('Circle area:', area(circle)); // Circle area: 78.53981633974483
console.log('Square area:', area(square)); // Square area: 100
```

**Methods**:

- `match(handlers)`: Matches the variant with the corresponding handler function.
- `is(label)`: Type guard to check if the variant matches the specified label, refining the type of `value`.
- `matchPartial`: Matches variants partially with a default fallback.

  ```typescript
  variant.matchPartial({
    Success: (value) => console.log(value)
  }, (defaultValue) => console.log("Default handler", defaultValue));
  ```

- `equals`: Checks equality between two variants.

  ```typescript
  variant.equals(anotherVariant); // true or false
  ```

- `toJSON`: Serializes the variant to JSON.

  ```typescript
  variant.toJSON(); // { type: "Success", value: "Completed" }
  ```

- `fromJSON`: Creates a variant instance from JSON.

  ```typescript
  OneOfVariant.fromJSON({ type: "Success", value: "Completed" });
  ```

- `map`: Transforms the contained value.

  ```typescript
  const variant = new OneOfVariant('Count', 10);
  const newVariant = variant.map(count => count * 2);
  console.log(newVariant.value); // 20
  ```

## Decorators

Decorators provide a way to add annotations and a meta-programming syntax for class declarations and members.
The handler receives `(error, methodName, context, ...args)`.

**Note**: When using decorators, make sure your `tsconfig.json` file has the `experimentalDecorators` and `emitDecoratorMetadata` properties enabled. Additionally, if a handler is not configured, you can install the [`reflect-metadata`](https://www.npmjs.com/package/reflect-metadata) library, as it works for decorators but is not included in this package to keep it dependency-free.

**Update**: In version ^5.0.0, the `Catch` decorator was renamed to `Catcher`, and `DefaultCatch` was renamed to `DefaultCatcher` to maintain consistency with the function names.

### `@Catcher`

A decorator that wraps a class method with error-handling logic, catching errors of a specific type thrown within the method.

#### `@AnyErrorCatcher`

Wraps a class method to catch and handle any throwable value.

____________________________________________________________________

**Usage**:

```typescript
import { Catcher } from 'bakutils-catcher';

class FileReader {
  @Catcher(FileNotFoundError, (err, context, ...args) => {
    console.error('File not found:', err);
    return null; // Provide a fallback value
  })
  readFile(path: string): string | null {
    // Implementation that might throw FileNotFoundError
  }
}
```

### `@DefaultCatcher`

A decorator that wraps a class method with error-handling logic, catching all errors thrown within the method.

**Usage**:

```typescript
import { DefaultCatcher } from 'bakutils-catcher';

class DataService {
  @DefaultCatcher((err, context, ...args) => {
    console.error('An error occurred:', err);
    // Handle the error, possibly returning a fallback value
  })
  fetchData(url: string): Data {
    // Implementation that might throw errors
  }
}
```

### `catcher` function

The `catcher` function allows you to wrap any function with error-handling logic, catching errors of a specific type. This is useful when you cannot use decorators or prefer a functional approach.

**Usage**:

```typescript
import { catcher } from 'bakutils-catcher';

class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CustomError";
    }
}

function riskyOperation(value: number): string {
    if (value < 0) throw new CustomError("Negative value not allowed");
    return value.toFixed(2);
}

const safeOperation = catcher(
    riskyOperation,
    CustomError,
    (err, context, value) => {
        console.error("Caught CustomError:", err.message);
        return "Fallback Value";
    }
);

console.log(safeOperation(-1)); // Output: "Fallback Value"
console.log(safeOperation(10)); // Output: "10.00"
```

### `defaultCatcher` function

The `defaultCatcher` function allows you to wrap any function with error-handling logic, catching all errors. This is similar to `catcher` but does not require specifying an error class.

**Usage**:

```typescript
import { defaultCatcher } from 'bakutils-catcher';

function anotherRiskyOperation(value: string): number {
    if (isNaN(Number(value))) throw new Error("Invalid number");
    return Number(value);
}

const safeAnotherOperation = defaultCatcher(
    anotherRiskyOperation,
    (err, context, value) => {
        console.error("Caught an error:", err.message);
        return 0;
    }
);

console.log(safeAnotherOperation("abc")); // Output: 0
console.log(safeAnotherOperation("123")); // Output: 123
```

## Quick Start

Here's a quick example demonstrating how to use the main features of the library:

```typescript
import {
  Ok,
  Err,
  Option,
  Some,
  None,
  createOneOf,
  OneOf,
  Catcher,
  DefaultCatch,
} from 'bakutils-catcher';

// Using Result
function calculate(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Err('Cannot divide by zero');
  }
  return Ok(a / b);
}

// Using Option
const someValue = Some(42);
const noValue = None;

// Using OneOf
type Response = {
  Success: { data: any };
  Error: { message: string };
};

const response: OneOf<Response> = createOneOf('Error', { message: 'Not Found' });

response.match({
  Success: ({ data }) => console.log('Data:', data),
  Error: ({ message }) => console.error('Error:', message),
});

// Using Decorators
class ApiService {
  @Catcher(NetworkError, (err, context, ...args) => {
    console.error('Network error:', err);
    return null; // Fallback value
  })
  fetchData(endpoint: string): Data | null {
    // Implementation that might throw NetworkError
  }

  @DefaultCatch((err, context, ...args) => {
    console.error('Unhandled error:', err);
    // Handle error
  })
  processData(data: Data): void {
    // Implementation that might throw errors
  }
}
```

---

## License

This project is licensed under the MIT License.