import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'ghost' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  children: ReactNode
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  ghost: 'bg-transparent hover:bg-slate-100',
  primary: 'bg-slate-950 text-white hover:bg-slate-800',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
  icon: 'size-10 p-0',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn('inline-flex items-center justify-center rounded-xl transition-colors', variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
