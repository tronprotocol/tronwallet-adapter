import { openConnectingModal, openVerifyAddressModal, openSelectAccountModal } from '../../src/Modal/openModal.js';
import { waitFor, fireEvent, screen } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('openConnectingModal()', () => {
    test('openConnectingModal() should exist', () => {
        expect(openConnectingModal).toBeTruthy();
    });
    test('openConnectingModal() should work fine', () => {
        const close = openConnectingModal();
        const el = screen.queryByTestId('connecting-content');
        expect(el).not.toBeNull();
        close();
        const el2 = screen.queryByTestId('connecting-content');
        expect(el2).toBeNull();
    });
});

describe('openVerifyAddressModal()', () => {
    test('openVerifyAddressModal() should exist', () => {
        expect(openVerifyAddressModal).toBeTruthy();
    });
    test('openVerifyAddressModal() should work fine', () => {
        const address = 'some address';
        const close = openVerifyAddressModal(address);
        const el = screen.queryByTestId('confirm-content');
        const addressEl = screen.queryByTestId('confirm-content-address');
        expect(el).not.toBeNull();
        expect(addressEl).not.toBeNull();
        expect(addressEl).toHaveTextContent(address);
        close();
        const el2 = screen.queryByTestId('connecting-content');
        const addressEl2 = screen.queryByTestId('confirm-content-address');
        expect(el2).toBeNull();
        expect(addressEl2).toBeNull();
    });
});
describe('openSelectAccountModal()', () => {
    test('openSelectAccountModal() should exist', () => {
        expect(openSelectAccountModal).toBeTruthy();
    });
    test('openSelectAccountModal() should work fine', async () => {
        let index = 1;
        async function getAccounts() {
            return [
                {
                    address: 'address2',
                    path: 'path2',
                    index: index++,
                },
            ];
        }
        const resultPromise = openSelectAccountModal({
            selectedIndex: 0,
            getAccounts,
            accounts: [{ address: 'address1', path: 'path1', index: 0 }],
        });
        const modalContentEl = screen.queryByTestId('select-account-content');
        expect(modalContentEl).toBeInTheDocument();
        const accountListEl = screen.queryByTestId('select-account-list');
        expect(accountListEl).toBeInTheDocument();
        await waitFor(() => {
            const listItemEls = accountListEl.querySelectorAll('li');
            expect(listItemEls.length).toEqual(1);
        });

        const loadMoreBtnEl = screen.queryByTestId('btn-load-more');
        expect(loadMoreBtnEl).toBeInTheDocument();
        fireEvent.click(loadMoreBtnEl);
        await waitFor(() => {
            expect(accountListEl.querySelectorAll('li').length).toBe(2);
        });
        fireEvent.click(loadMoreBtnEl);
        await waitFor(() => {
            expect(accountListEl.querySelectorAll('li').length).toBe(3);
        });

        const cancelBtnEl = screen.queryByTestId('btn-cancel');
        fireEvent.click(cancelBtnEl);
        expect(resultPromise).rejects.toThrowError('Operation is canceled.');
    });

    test('openSelectAccountModal() confirm should work fine', async () => {
        let index = 1;
        async function getAccounts() {
            return [
                {
                    address: 'address2',
                    path: 'path2',
                    index: index++,
                },
            ];
        }
        const resultPromise = openSelectAccountModal({
            selectedIndex: 0,
            getAccounts,
            accounts: [{ address: 'address1', path: 'path1', index: 0 }],
        });
        const modalContentEl = screen.queryByTestId('select-account-content');
        expect(modalContentEl).toBeInTheDocument();
        const accountListEl = screen.queryByTestId('select-account-list');
        await waitFor(() => {
            expect(accountListEl.querySelectorAll('li').length).toBe(1);
        });

        const loadMoreBtnEl = screen.queryByTestId('btn-load-more');
        expect(loadMoreBtnEl).toBeInTheDocument();
        fireEvent.click(loadMoreBtnEl);

        await waitFor(() => {
            expect(accountListEl.querySelectorAll('li').length).toBe(2);
        });
        const selectedEl = accountListEl.querySelectorAll('li')[1];
        const label = selectedEl.querySelector('label');
        const input = selectedEl.querySelector('input');

        fireEvent.click(label);
        await waitFor(() => {
            expect(input).toHaveAttribute('class', 'checked');
        });
        const confirmBtnEl = screen.queryByTestId('btn-confirm');
        fireEvent.click(confirmBtnEl);
        expect(resultPromise).resolves.toEqual({
            address: 'address2',
            path: 'path2',
            index: 1,
        });
    });
});
