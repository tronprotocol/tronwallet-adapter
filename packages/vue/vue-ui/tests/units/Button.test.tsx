/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, test, vi, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import { Button } from '../../src/Button.js';
import { h } from 'vue';

let container: any;
const makeSut = (props: any, children: any = '') => mount(Button, { props, slots: { default: children } });
afterEach(() => {
    container.unmount();
});
describe('Button', () => {
    test('should work fine with basic usage', () => {
        container = makeSut({
            className: 'test-class-name',
            tabIndex: 20,
            disabled: true,
            style: { borderColor: 'red' },
        });
        const button = container.get('button');
        expect(button).not.toBeNull();
        // class change will influence style
        expect(button?.classes().includes('adapter-vue-button')).toBe(true);
        expect(button?.classes().includes('test-class-name')).toBe(true);
        expect(button?.attributes('tabindex')).toBe('20');
        expect(button?.attributes('style')).toContain('border-color: red');
        expect(button?.attributes().disabled).toBe('');
    });
    test('children prop should work fine', () => {
        container = makeSut({}, h('span', 'button'));
        const button = container.get('button')!;
        expect(button.text().includes('button')).toBe(true);
    });
    test('icon prop should work fine', () => {
        const icon = 'https://xxx.com/img.png';
        container = makeSut(
            {
                icon,
            },
            h('button')
        );
        const img = container.get('img')!;
        expect(img.attributes('src')).toBe(icon);
    });
    test('onClick prop should work fine', async () => {
        const spy = vi.fn();
        container = makeSut(
            {
                onClick: spy,
            },
            h('button')
        );
        const button = container.get('button');
        button.trigger('click');
        expect(spy).toBeCalledTimes(1);
    });
    test('onClick prop should work fine with disabled prop', () => {
        const spy = vi.fn();
        container = makeSut({
            onClick: spy,
            disabled: true,
        });
        const button = container.get('button')!;
        button.trigger('click');
        expect(spy).toBeCalledTimes(0);
    });
});
