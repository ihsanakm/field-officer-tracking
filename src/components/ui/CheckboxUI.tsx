'use client'

import * as React from 'react'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative flex items-center group cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className={`
            peer h-5 w-5 shrink-0 rounded-md border-2 border-gray-200 
            bg-white ring-offset-white transition-all duration-200
            appearance-none cursor-pointer
            checked:bg-blue-600 checked:border-blue-600
            focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-blue-500/20 focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            hover:border-blue-300
            ${className || ''}
          `}
          {...props}
        />
        <svg
          className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
