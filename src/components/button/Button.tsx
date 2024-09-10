import { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = {
  type?: 'submit' | 'button';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  state?: 'normal' | 'warning';
  hoverMessage?: string;
  icon?: JSX.Element;
};

const states = {
  warning:
    'bg-button-delete hover:bg-button-delete text-button-text font-bold py-2 px-4 rounded inline-flex items-center',
  normal: 'bg-button-bg text-button-text hover:bg-button-hover-bg'
};

export function Button({
  onClick,
  type,
  className,
  children,
  disabled = false,
  state = 'normal',
  hoverMessage,
  icon
}: PropsWithChildren<ButtonProps>) {
  const css = !disabled && states[state];

  return (
    <button
      type={type}
      onClick={onClick}
      className={twMerge(
        `font-bold py-2 px-4 rounded inline-flex items-center cursor-pointer`,
        css,
        className
      )}
      disabled={disabled}
      title={hoverMessage}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
