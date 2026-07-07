import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-edu-600 text-white shadow-md shadow-blue-900/15 hover:bg-edu-700 hover:shadow-lg hover:shadow-blue-900/20 focus-visible:ring-edu-600 active:bg-edu-800',
  secondary:
    'border border-edu-200 bg-white text-edu-800 shadow-sm shadow-blue-900/5 hover:border-edu-300 hover:bg-edu-50 focus-visible:ring-edu-500 active:bg-edu-100',
};

const baseStyles =
  'inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<LinkProps, 'className'> & {
    to: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

function getClassName(variant: ButtonVariant, className?: string): string {
  return [baseStyles, variantStyles[variant], className].filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonProps) {
  const styles = getClassName(variant, className);

  if ('to' in props && props.to !== undefined) {
    const { to, ...linkProps } = props;
    return (
      <Link to={to} className={styles} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={styles} {...props}>
      {children}
    </button>
  );
}
