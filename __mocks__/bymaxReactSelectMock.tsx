export const Select = ({
  value,
  options,
  onChange,
  isLocked,
  placeholder,
}: {
  value: { value: string } | null
  options: { id: string; value: string; label: string }[]
  onChange: (option: { value: string } | null) => void
  isLocked: boolean
  placeholder: string
}) => (
  <select
    data-testid="select"
    value={value ? value.value : ''}
    onChange={(e) => {
      const selectedOption = options.find(
        (option) => option.value === e.target.value,
      )
      onChange(selectedOption || null)
    }}
    disabled={isLocked}
  >
    <option value="" disabled>
      {placeholder}
    </option>
    {options.map((option) => (
      <option key={option.id} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
)
