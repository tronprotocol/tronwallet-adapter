/**
 * @jest-environment node
 */
import { TronLinkAdapter } from '../../src/adapter.js';
import { MockTron } from './mock.js';

globalThis.window = {
    open: jest.fn(),
    location: {
        origin: '',
        pathname: '',
        search: '',
        hash: '',
    },
} as any;
let adapter: TronLinkAdapter;

beforeEach(() => {
    jest.useFakeTimers();
    globalThis.navigator = {} as any;
    // @ts-ignore
    globalThis.navigator.userAgent = 'Android';
    adapter = new TronLinkAdapter();
});
afterEach(() => {
    globalThis.window.location.href = '';
});

describe('when on mobile device browser', () => {
    test('will open TronLink app when tron is undefined ', async () => {
        jest.advanceTimersByTime(1000);
        try {
            await adapter.connect();
        } catch {
            //
        } finally {
            expect(window.location.href).toContain('tronlinkoutside://');
        }
    });
    test('will not open TronLink app when tron exists', async () => {
        globalThis.window.tron = new MockTron();
        adapter = new TronLinkAdapter();
        jest.advanceTimersByTime(1000);
        try {
            await adapter.connect();
        } catch {
            //
        } finally {
            expect(window.location.href).not.toContain('tronlinkoutside://');
        }
    });
    test('config.openTronLinkOnMobile should work fine', async () => {
        adapter = new TronLinkAdapter({
            checkTimeout: 3000,
            openTronLinkAppOnMobile: false,
        });
        try {
            await adapter.connect();
        } catch {
            //
        }
        expect(window.location.href).not.toContain('tronlinkoutside://');
    });
});
