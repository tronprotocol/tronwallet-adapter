import { isInBrowser } from '@tronweb3/tronwallet-abstract-adapter';
import { shallowRef, watch } from 'vue';
import type { Ref, ShallowRef } from 'vue';

export function useLocalStorage<T>(key: Ref<string>, defaultState: T): [ShallowRef<T>, (state: T) => void] {
    const state = shallowRef<T>(defaultState);
    try {
        const value = localStorage.getItem(key.value);
        if (value) {
            state.value = JSON.parse(value);
        }
    } catch (error: unknown) {
        if (isInBrowser()) {
            console.error(error);
        }
    }

    const setState = (v: T) => {
        state.value = v;
    };

    watch(
        [state, key],
        ([state, key]) => {
            try {
                if (state === null) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, JSON.stringify(state));
                }
            } catch (error: any) {
                if (isInBrowser()) {
                    console.error(error);
                }
            }
        },
        {
            immediate: false,
        }
    );

    return [state, setState];
}
