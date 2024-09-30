
import { BAKUtilsIsPromise, BAKUtilsIsFunction } from "../src/Utils";

function foo() { }
const foobar = () => { }
async function baz() { }

describe('Function and Promise Utilities', () => {
    describe('isFunction utility', () => {
        it('should return true for regular functions', () => {
            expect(BAKUtilsIsFunction(foo)).toBeTruthy();
            expect(BAKUtilsIsFunction(foobar)).toBeTruthy();
        });
    });

    describe('isPromise utility', () => {
        it('should return true for async function results', () => {
            expect(BAKUtilsIsPromise(baz())).toBeTruthy();
        });
    });
});