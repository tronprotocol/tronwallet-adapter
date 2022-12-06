import type { FC, PropsWithChildren } from 'react';
import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';

export type CollapseProps = PropsWithChildren<{
    isOpen: boolean;
    id?: string;
    className?: string;
    transition?: string;
}>;

export const Collapse: FC<CollapseProps> = function ({
    children,
    className,
    transition = 'height 250ms ease-out',
    isOpen,
}) {
    const initialState = { height: '0px', transition };
    const wrapRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState(initialState);

    useEffect(
        function () {
            setStyle((style) => ({ ...style, transition }));
        },
        [transition]
    );

    function open() {
        if (!wrapRef.current) {
            return;
        }
        setStyle((style) => ({
            ...style,
            height: wrapRef.current?.scrollHeight + 'px',
        }));
    }

    function close() {
        if (!wrapRef.current) {
            return;
        }
        setStyle((style) => ({
            ...style,
            height: '0px',
        }));
    }

    useLayoutEffect(() => {
        if (isOpen) {
            open();
        } else {
            close();
        }
    }, [isOpen]);

    return (
        <div
            ref={wrapRef}
            className={'react-collapse ' + className}
            style={{
                overflow: 'hidden',
                ...style,
            }}
        >
            {children}
        </div>
    );
};
