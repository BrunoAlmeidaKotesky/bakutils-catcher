
import { isPromise, isFunction } from "../src/Utils";

function foo() { }
const foobar = () => { }
async function baz() { }

describe('Function and Promise Utilities', () => {
    describe('isFunction utility', () => {
        it('should return true for regular functions', () => {
            expect(isFunction(foo)).toBeTruthy();
            expect(isFunction(foobar)).toBeTruthy();
        });
    });

    describe('isPromise utility', () => {
        it('should return true for async function results', () => {
            expect(isPromise(baz())).toBeTruthy();
        });
    });
});