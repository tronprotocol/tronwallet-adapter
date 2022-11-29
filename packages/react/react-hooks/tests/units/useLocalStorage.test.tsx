import React, { createRef, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useLocalStorage } from '../../src/useLocalStorage.js';
import 'jest-localstorage-mock';

type TestRefType = {
    getValue(): string;
    setValue(v: string | null): void;
};

const DEFAULT_VALUE = '123';
const STORAGE_KEY = 'STORAGE_KEY';
const TestComponent = forwardRef(function TestComponent(_props, ref) {
    const [value, setValue] = useLocalStorage<string | null>(STORAGE_KEY, DEFAULT_VALUE);
    useImperativeHandle(
        ref,
        () => ({
            getValue() {
                return value;
            },
            setValue(v: string | null) {
                setValue(v);
            },
        }),
        [value, setValue]
    );
    return null;
});
let container: HTMLDivElement | null;
let root: ReturnType<typeof createRoot>;
let ref: React.RefObject<TestRefType>;

function renderTest() {
    act(() => {
        root.render(<TestComponent ref={ref} />);
    });
}

beforeEach(function () {
    localStorage.clear();
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    ref = createRef();
});
afterEach(function () {
    act(() => {
        root && root.unmount();
    });
});
describe('useLocalStorage', function () {
    describe('get value from localStorage', function () {
        test('should return defaultValue when localStorage has no value for given key', function () {
            expect(renderTest).not.toThrow();
            expect(ref.current?.getValue()).toEqual(DEFAULT_VALUE);
        });
        describe('should return the value when localStorage has a value already', function () {
            const NEW_VALUE = 1234;
            test('should return existed value', function () {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(NEW_VALUE));
                expect(renderTest).not.toThrow();
                expect(ref.current?.getValue()).toEqual(NEW_VALUE);
            });
        });
        test('should return default value when localStorage has a value of invalid JSON', function () {
            localStorage.setItem(STORAGE_KEY, '');
            expect(renderTest).not.toThrow();
            expect(ref.current?.getValue()).toEqual(DEFAULT_VALUE);
        });
    });

    describe('set value to localStorage', function () {
        describe('when setting a non-null value', function () {
            const NEW_VALUE = 'newvalue';
            beforeEach(function () {
                expect(renderTest).not.toThrow();
            });
            test('should return new value', function () {
                act(function () {
                    ref.current?.setValue(NEW_VALUE);
                });
                expect(ref.current?.getValue()).toEqual(NEW_VALUE);
            });

            describe('multiple times ending with current value', function () {
                test('should return the last value', () => {
                    act(() => {
                        ref.current?.setValue(NEW_VALUE);
                        ref.current?.setValue(DEFAULT_VALUE);
                    });
                    expect(ref.current?.getValue()).toEqual(DEFAULT_VALUE);
                });
            });
        });
        describe('when setting to `null`', () => {
            beforeEach(() => {
                expect(renderTest).not.toThrow();
            });
            test('re-renders the component with `null`', () => {
                act(() => {
                    ref.current?.setValue(null);
                });
                expect(ref.current?.getValue()).toEqual(null);
            });
        });
    });
});
