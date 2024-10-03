export const CurrencyInput = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  className = "",
}: {
  id: string
  name: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  className?: string
}) => (
  <input
    id={id}
    name={name}
    value={value}
    autoComplete="off"
    onChange={onChange}
    autoFocus={false}
    disabled={disabled}
    className={`flex h-10 w-full appearance-none rounded-md border-none bg-transparent px-0 py-1 text-3xl font-medium text-black shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed dark:text-white ${className}`}
  />
)
