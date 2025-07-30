import { DefaultCatcher, Catcher, Result, Ok, Err, Left } from '../src'

class ExtendedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

enum PossibleErrors {
  DEFAULT,
  EXTENDED,
  NO_ERROR,
}

const BAR_ERROR_MESSAGE = 'bar'

type ErrorResult = { err: ExtendedError | Error; value: PossibleErrors }

class FooBar {
  @DefaultCatcher<boolean, [boolean]>((_, __, ___, v) => v)
  @Catcher<boolean, ExtendedError, [boolean]>(ExtendedError, (_, __, ___, v) => v)
  static foo(defaultThrow: boolean): boolean {
    if (defaultThrow) throw new Error('defaultThrow')
    throw new ExtendedError('foo')
  }

  @DefaultCatcher<string>((e) => e.message)
  async bar(): Promise<string> {
    throw new ExtendedError(BAR_ERROR_MESSAGE)
  }

  @DefaultCatcher<Result<PossibleErrors, ErrorResult>, [PossibleErrors]>(
    (err, __, ___, v) => Err({ err, value: v })
  )
  @Catcher<Result<PossibleErrors, ErrorResult>, ExtendedError, [PossibleErrors]>(
    ExtendedError,
    (err, __, ___, v) => Err({ err, value: v })
  )
  async resultMethod(
    value: PossibleErrors
  ): Promise<Result<PossibleErrors, ErrorResult>> {
    if (value === PossibleErrors.EXTENDED) throw new ExtendedError('An error occurred')
    if (value === PossibleErrors.DEFAULT) throw new Error('An error occurred')
    return Ok(PossibleErrors.NO_ERROR)
  }
}

describe('Error Handling with Decorators', () => {
  let fooBarInstance: FooBar

  beforeEach(() => {
    fooBarInstance = new FooBar()
  })

  describe('Static foo method', () => {
    it('should handle default and extended errors correctly', () => {
      expect(FooBar.foo(false)).toBe(false)
      expect(FooBar.foo(true)).toBe(true)
    })
  })

  describe('Instance method bar', () => {
    it('should return an extended error message', async () => {
      await expect(fooBarInstance.bar()).resolves.toBe(BAR_ERROR_MESSAGE)
    })
  })

  describe('resultMethod with various error states', () => {
    it('should handle no error case correctly', async () => {
      const r = await fooBarInstance.resultMethod(PossibleErrors.NO_ERROR)
      expect(r.unwrap()).toBe(PossibleErrors.NO_ERROR)
    })

    it('should handle extended error case correctly', async () => {
      const r = await fooBarInstance.resultMethod(PossibleErrors.EXTENDED)
      expect(r.isErr()).toBe(true)
      expect((r as Left<PossibleErrors, ErrorResult>).error).toEqual(
        expect.objectContaining({
          err: expect.any(ExtendedError),
          value: PossibleErrors.EXTENDED,
        })
      )
    })

    it('should handle default error case correctly', async () => {
      const r = await fooBarInstance.resultMethod(PossibleErrors.DEFAULT)
      expect(r.isErr()).toBe(true)
      expect((r as Left<PossibleErrors, ErrorResult>).error).toEqual(
        expect.objectContaining({
          err: expect.any(Error),
          value: PossibleErrors.DEFAULT,
        })
      )
    })
  })
})

describe('Handler properly receive this (ctx) and args', () => {
  const log: any[] = []

  class Target {
    @DefaultCatcher<void, [number, string]>((e, fn, ctx, ...a) =>
      log.push({ fn, ctx, args: a, err: e })
    )
    boomInst(a: number, b: string): void {
      throw new Error('x')
    }

    @DefaultCatcher<void, [boolean]>((e, fn, ctx, ...a) =>
      log.push({ fn, ctx, args: a, err: e })
    )
    static boomStatic(x: boolean): void {
      throw new Error('y')
    }
  }

  it('Instance', () => {
    new Target().boomInst(1, 'a')
    expect(log.pop()).toMatchObject({ fn: 'boomInst', args: [1, 'a'] })
  })

  it('Static', () => {
    Target.boomStatic(true)
    expect(log.pop()).toMatchObject({ fn: 'boomStatic', args: [true] })
  })
})
