/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { FC, PropsWithChildren } from 'react';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'jest-localstorage-mock';

import type { ButtonProps } from '../../src/Button.js';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider } from '../../src/WalletModalProvider.js';
import { MockTronLink } from './MockTronLink.js';
import { WalletDisconnectButton } from '../../src/WalletDisconnectButton.js';
import { act } from 'react-dom/test-utils';

const Providers: FC<PropsWithChildren> = function (props) {
    return (
        <WalletProvider>
            <WalletModalProvider>{props.children}</WalletModalProvider>
        </WalletProvider>
    );
};
const NoAutoConnectProviders: FC<PropsWithChildren> = function (props) {
    return (
        <WalletProvider autoConnect={false}>
            <WalletModalProvider>{props.children}</WalletModalProvider>
        </WalletProvider>
    );
};
const makeSut = (props: ButtonProps = {}) => render(<WalletDisconnectButton {...props} />, { wrapper: Providers });
const makeSutNoAutoConnect = (props: ButtonProps = {}) =>
    render(<WalletDisconnectButton {...props} />, { wrapper: NoAutoConnectProviders });

beforeEach(() => {
    localStorage.clear();
    window.tronLink = new MockTronLink();
    window.tronWeb = window.tronLink.tronWeb;
});
describe('basic usage', () => {
    test('should work fine with basic usage', () => {
        const { container } = makeSut({
            className: 'test-class-name',
            tabIndex: 20,
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
        expect(button?.textContent).toEqual('Disconnect Wallet');
    });
});

describe('when no wallet is selected', () => {
    test('should be disabled', async () => {
        const { getByTestId } = makeSut();
        expect(getByTestId('wallet-disconnect-button')).toBeDisabled();
        expect(getByTestId('wallet-disconnect-button')).toHaveTextContent('Disconnect Wallet');
    });
});

describe('when a wallet is seleted', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        localStorage.setItem('tronAdapterName', '"TronLink"');
    });
    describe('when tronlink is avaliable', () => {
        test('should auto connect and not be disabled when antoConnect enabled', async () => {
            const { getByTestId } = makeSut({});
            act(() => {
                jest.advanceTimersByTime(4000);
            });
            const el = getByTestId('wallet-disconnect-button');
            await waitFor(() => {
                expect(el).toBeInTheDocument();
                expect(el).not.toBeDisabled();
                expect(el).toHaveTextContent('Disconnect');
            });
        });
        test('tronlink is connected when antoConnect disabled', async () => {
            const { getByTestId } = makeSutNoAutoConnect({});
            act(() => {
                jest.advanceTimersByTime(3000);
            });
            await waitFor(() => {
                const el = getByTestId('wallet-disconnect-button');
                expect(el).toBeInTheDocument();
                expect(el).not.toBeDisabled();
                expect(el).toHaveTextContent('Disconnect');
            });
        });
    });

    describe('when tronlink is not avaliable', () => {
        beforeEach(() => {
            window.tronLink = undefined;
            window.tronWeb = undefined;
        });
        test('should be disabled with autoConnect enabled', async () => {
            const { getByTestId } = makeSut();
            expect(getByTestId('wallet-disconnect-button')).toBeDisabled();
            expect(getByTestId('wallet-disconnect-button')).toHaveTextContent('Disconnect');
        });
        test('should be disabled with autoConnect disabled', async () => {
            const { getByTestId } = makeSutNoAutoConnect();
            expect(getByTestId('wallet-disconnect-button')).toBeDisabled();
            expect(getByTestId('wallet-disconnect-button')).toHaveTextContent('Disconnect');
        });
    });
});
