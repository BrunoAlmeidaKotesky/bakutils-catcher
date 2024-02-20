import { Some, None, Ok, Err } from '../index';

describe('Conversion between Option and Result', () => {
    it('Should correctly Convert a Some Option to Result', () => {
        const some = Some(2);
        const someResult = some.okOr('Error');

        expect(someResult.type).toBe('ok');
    });

    it('Should correctly Convert a None Option to Result', () => {
        const none = None;
        const noneResult = none.okOr('Error');

        expect(noneResult.type).toBe('error');
    });

    it('Should correctly Convert an Ok Result to Option', () => {
        const ok = Ok(2);
        const option = ok.toOption();
        const err = Err('Error');
        const optionErr = err.toOption();

        expect(option.type).toBe('some');
        expect(optionErr.type).toBe('none');
    });

    it('Should unwrap an Option to Result', () => {
        const some = Some(2);
        const someResult = some.okOr('Error');
        const none = None;
        const noneResult = none.okOr('Error');

        expect(someResult.unwrap()).toBe(2);
        expect(() => noneResult.unwrap()).toThrow('Error');
    });

    it('Should unwrap a Result to Option', () => {
        const ok = Ok(2);
        const option = ok.toOption();
        const err = Err('Error');
        const optionErr = err.toOption();

        expect(option.unwrap()).toBe(2);
        expect(optionErr.unwrap).toThrow();
    });
});