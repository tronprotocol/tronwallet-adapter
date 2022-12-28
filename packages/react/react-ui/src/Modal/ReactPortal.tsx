import { useState, useLayoutEffect } from 'react';
import type { PropsWithChildren, FC } from 'react';
import { createPortal } from 'react-dom';

function createWrapperAndAppendToBody(wrapperId: string) {
    const wrapperElement = document.createElement('div');
    wrapperElement.setAttribute('id', wrapperId);
    wrapperElement.style.position = 'relative';
    document.body.appendChild(wrapperElement);
    return wrapperElement;
}

type ReactPortalProps = PropsWithChildren<{
    wrapperId: string;
}>;
export const ReactPortal: FC<ReactPortalProps> = function ({ children, wrapperId = 'react-portal-wrapper' }) {
    const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);

    useLayoutEffect(() => {
        let element: HTMLElement | null = document.getElementById(wrapperId);
        let systemCreated = false;
        // if element is not found with wrapperId or wrapperId is not provided,
        // create and append to body
        if (!element) {
            systemCreated = true;
            element = createWrapperAndAppendToBody(wrapperId);
        }
        setWrapperElement(element);

        return () => {
            // delete the programatically created element
            if (systemCreated && element?.parentNode) {
                element.parentNode.removeChild(element);
            }
        };
    }, [wrapperId]);

    // wrapperElement state will be null on very first render.
    if (wrapperElement === null) return null;

    return createPortal(children, wrapperElement);
};
