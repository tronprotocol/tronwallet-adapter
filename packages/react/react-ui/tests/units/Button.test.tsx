/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { ButtonProps } from '../../src/Button.js';
import { Button } from '../../src/Button.js';

const makeSut = (props: ButtonProps = {}) => render(<Button {...props} />);
describe('Button', () => {
    test('should work fine with basic usage', () => {
        const { container } = makeSut({
            className: 'test-class-name',
            tabIndex: 20,
            disabled: true,
            style: { borderColor: 'red' },
        });
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        // class change will influence style
        expect(button?.classList.contains('adapter-react-button')).toBe(true);
        expect(button?.classList.contains('test-class-name')).toBe(true);
        expect(button?.tabIndex).toBe(20);
        expect(button?.style.borderColor).toBe('red');
        expect(button?.disabled).toBe(true);
    });
    test('children prop should work fine', () => {
        const { container } = makeSut({
            children: 'button',
        });
        const button = container.querySelector('button')!;
        const e = new Event('click');
        fireEvent.click(button, e);
        expect(button.innerHTML.includes('button')).toBe(true);
    });
    test('icon prop should work fine', () => {
        const icon = 'https://xxx.com/img.png';
        const { container } = makeSut({
            children: 'button',
            icon,
        });
        const img = container.querySelector('img')!;
        expect(img.src).toBe(icon);
    });
    test('onClick prop should work fine', async () => {
        const spy = jest.fn();
        makeSut({
            onClick: spy,
            children: 'Button',
        });
        const e = new Event('click');
        fireEvent.click(screen.getByText('Button'), e);

        expect(spy).toBeCalledTimes(1);
    });
    test('onClick prop should work fine with disabled prop', () => {
        const spy = jest.fn();
        const { container } = makeSut({
            onClick: spy,
            disabled: true,
        });
        const button = container.querySelector('button')!;
        const e = new Event('click');
        fireEvent.click(button, e);
        expect(spy).toBeCalledTimes(0);
    });
});
