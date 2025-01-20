import { None, Some } from "../src/index";

describe("Mapping operations on Option", () => {

    it('Should transform the value from a Some Option to another value', () => {
        const value = Some(2);
        const mapped = value.map(x => x * 2);
        expect(mapped.unwrap()).toBe(4);
    });

    it('Should trans form the value from a Some Option to another Option', () => {
        const value = Some('2024-10-10');
        if (value.isSome()) {
            const mapped = value.flatMap<Date>(x => Some(new Date(x)));
            expect(mapped.unwrap()).toBeInstanceOf(Date);
        }
    });

    it('Should try to map an None Option using mapOr', () => {
        const none = None;
        const mapped = none.mapOr<number>(x => x * 2, 0);
        expect(mapped.type).toBe('some');
        expect(mapped.unwrap()).toBe(0);
    });

    it('Should try to map a Some using mapOr', () => {
        class ClassExample { value: number = 2 }
        const some = Some(new ClassExample());
        const mapped = some.mapOr<number>(x => x.value, 0);
        expect(mapped.type).toBe('some');
        expect(mapped.unwrap()).not.toBe(0);
    });

    it('Should try to map both Some and None with mapOr using a callback', () => {
        const none = None;
        const some = Some(2);
        const mappedNone = none.mapOr<number>(x => x * 2, () => 0);
        const mappedSome = some.mapOr<number>(x => x * 2, () => 0);
        expect(mappedNone.unwrap()).toBe(0);
        expect(mappedSome.unwrap()).toBe(4);
    });

    it('Should not fail because map verify the callback', () => {
        const obj = { value: { nested: undefined } };
        const some = Some(obj);
        const mapped = some.map(x => x.value.nested);
        expect(mapped.type).toBe('none')
    });
});