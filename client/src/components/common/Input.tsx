interface InputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
}

function Input({ label, type = 'text', value, onChange }: InputProps) {
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

export default Input