import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', ...rest }, ref) => {
    return (
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref}
          type={type}
          {...rest}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input