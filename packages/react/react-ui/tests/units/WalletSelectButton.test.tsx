/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { FC, PropsWithChildren } from 'react';
import React from 'react';
import { fireEvent, render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-localstorage-mock';

import type { ButtonProps } from '../../src/Button.js';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider } from '../../src/WalletModalProvider.js';
import { MockTronLink } from './MockTronLink.js';
import { WalletSelectButton } from '../../src/WalletSelectButton.js';

const Providers: FC<PropsWithChildren> = function (props) {
    return (
        <WalletProvider>
            <WalletModalProvider>{props.children}</WalletModalProvider>
        </WalletProvider>
    );
};
const makeSut = (props: ButtonProps = {}) => render(<WalletSelectButton {...props} />, { wrapper: Providers });

window.open = jest.fn();
beforeEach(() => {
    localStorage.clear();
    window.tronLink = new MockTronLink();
    window.tronWeb = window.tronLink.tronWeb;
});
describe('WalletSelectButton', () => {
    test('should work fine with basic usage', () => {
        const { container } = makeSut({});
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button?.disabled).toBe(false);
        expect(button?.textContent).toEqual('Select Wallet');
    });

    test('should work fine when select', async () => {
        jest.useFakeTimers();
        const { getByTestId, getByText, queryByTestId } = makeSut({});
        await waitFor(() => {
            jest.advanceTimersByTime(500);
        });
        act(() => {
            fireEvent.click(getByTestId('wallet-select-button'));
        });

        expect(getByTestId('wallet-select-modal')).toBeInTheDocument();
        fireEvent.click(getByText('TronLink'));
        await waitFor(() => {
            expect(queryByTestId('wallet-select-modal')).toBeNull();
        });
        expect(localStorage.getItem('tronAdapterName')).toEqual(`"TronLink"`);
    });
});
