import React, { useRef } from 'react';
import type { CSSProperties, FC, MouseEvent, PropsWithChildren } from 'react';

export type ButtonProps = PropsWithChildren<{
    className?: string;
    disabled?: boolean;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    style?: CSSProperties;
    tabIndex?: number;
    icon?: string;
}>;

export const Button: FC<ButtonProps> = ({ children, onClick, className = '', tabIndex = 0, icon, ...rest }) => {
    const ref = useRef<HTMLButtonElement>(null);
    function handleClick(event: MouseEvent<HTMLButtonElement>) {
        onClick?.(event);
        setTimeout(() => {
            ref.current?.blur();
        }, 300);
    }
    return (
        <button
            ref={ref}
            onClick={handleClick}
            className={`adapter-react-button ${className}`}
            tabIndex={tabIndex}
            {...rest}
        >
            {icon && (
                <i className="button-icon">
                    <img src={icon} />
                </i>
            )}
            {children}
        </button>
    );
};
