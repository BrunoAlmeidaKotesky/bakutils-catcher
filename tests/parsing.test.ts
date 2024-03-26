import { None, Option } from '../src/index';

type ObjType = { value: { nested: typeof None } };
let createObj = (value: any): ObjType => ({ value: { nested: value } });

describe("Parsing operations on Option", () => {
    it('Ensures that a JSON.stringfy on a object with None Option will return null', () => {
        expect(JSON.stringify(createObj(None))).toBe('{"value":{"nested":null}}');
    });

    it('Ensures that a JSON.parse on a object with Some Option will return the original value', () => {
        expect(JSON.stringify(createObj(Option(1)))).toBe('{"value":{"nested":1}}');
    });
});