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
import { WalletActionButton } from '../../src/WalletActionButton.js';

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

window.open = jest.fn();
const makeSut = (props: ButtonProps = {}) => render(<WalletActionButton {...props} />, { wrapper: Providers });
const makeSutNoAutoConnect = (props: ButtonProps = {}) =>
    render(<WalletActionButton {...props} />, { wrapper: NoAutoConnectProviders });

beforeEach(() => {
    localStorage.clear();
    window.tronLink = new MockTronLink();
    window.tronWeb = window.tronLink.tronWeb;
});

describe('when tronlink is avaliable', () => {
    describe('when no wallet is selected', () => {
        test('selectButton should exist', async () => {
            const { getByTestId } = makeSut();
            expect(getByTestId('wallet-select-button')).toBeInTheDocument();
        });

        test('actionButton exist after select a wallet when autoConnect enabled', async () => {
            const { getByTestId, getByText } = makeSut();
            fireEvent.click(getByTestId('wallet-select-button'));
            expect(getByTestId('wallet-select-modal')).toBeInTheDocument();
            fireEvent.click(getByText('TronLink'));
            expect(getByTestId('wallet-action-button')).toBeInTheDocument();
        });
    });
    describe('when a wallet is seleted', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            localStorage.setItem('tronAdapterName', '"TronLink"');
        });

        test('actionButton should exist when autoConnect enabled', () => {
            const { getByTestId } = makeSut({});
            expect(getByTestId('wallet-action-button')).toBeInTheDocument();
        });
    });
});

describe('when tronlink is not avaliable', () => {
    beforeEach(() => {
        window.tronLink = undefined;
        window.tronWeb = undefined;
    });
    describe('when no wallet is selected', () => {
        test('selectButton should exist', async () => {
            const { getByTestId } = makeSut();
            expect(getByTestId('wallet-select-button')).toBeInTheDocument();
        });

        // test('should open website after select a wallet', async () => {
        //     const { getByTestId, getByText, queryByTestId } = makeSut();
        //     fireEvent.click(getByTestId('wallet-select-button'));
        //     expect(getByTestId('wallet-select-modal')).toBeInTheDocument();
        //     fireEvent.click(getByText('TronLink'));
        //     await waitFor(() => {
        //         expect(queryByTestId('wallet-select-modal')).toBeNull();
        //     });
        //     // when tronlink is NotFound, select will open it's website
        //     expect(window.open).toHaveBeenCalled();
        // });
    });
});

describe('when tronlink is avaliable but not ready', () => {
    beforeEach(() => {
        (window.tronLink as MockTronLink).setReadyState(false);
        (window.tronLink as MockTronLink).address = '';
    });
    describe('when no wallet is selected', () => {
        test('selectButton should exist', async () => {
            const { getByTestId } = makeSut();
            waitFor(() => {
                expect(getByTestId('wallet-select-button')).toBeInTheDocument();
            });
        });

        test('should work fine when select a wallet', async () => {
            const { getByTestId, getByText, queryByTestId, findByTestId } = makeSutNoAutoConnect();
            await act(async () => {
                fireEvent.click(getByTestId('wallet-select-button'));
            });

            await waitFor(() => {
                expect(getByTestId('wallet-select-modal')).toBeInTheDocument();
            });
            const tronLinkBtn = getByText('TronLink');
            expect(tronLinkBtn).toBeInTheDocument();
            await act(async () => {
                fireEvent.click(tronLinkBtn);
            });
            await waitFor(async () => {
                expect(queryByTestId('wallet-select-modal')).toBeNull();
                expect(queryByTestId('wallet-connect-button')).toBeInTheDocument();
            });
            fireEvent.click(await findByTestId('wallet-connect-button'));
            await waitFor(() => {
                expect(queryByTestId('wallet-action-button')).toBeInTheDocument();
            });
        });
    });

    describe('when a wallet is selected', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            localStorage.setItem('tronAdapterName', '"TronLink"');
        });
        test('should work fine when autoConnect enabled', async () => {
            const { getByTestId, queryByTestId } = makeSut();
            // autoconnect
            expect(queryByTestId('wallet-connect-button')).toBeInTheDocument();
            act(() => {
                jest.advanceTimersByTime(1300);
            });
            await waitFor(() => {
                expect(getByTestId('wallet-action-button')).toBeInTheDocument();
            });
        });
        test('should work fine when autoConnect disabled', async () => {
            const { getByTestId } = makeSutNoAutoConnect();
            // autoconnect
            await waitFor(() => {
                expect(getByTestId('wallet-connect-button')).toBeInTheDocument();
            });

            await act(async () => {
                fireEvent.click(getByTestId('wallet-connect-button'));
                await Promise.resolve();
            });
            await waitFor(() => {
                expect(getByTestId('wallet-connect-button')).toHaveTextContent('Connecting');
            });

            await waitFor(() => {
                expect(getByTestId('wallet-action-button')).toBeInTheDocument();
            });
        });
    });
});
