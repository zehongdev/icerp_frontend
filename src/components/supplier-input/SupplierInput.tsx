import { useId } from 'react'
import './Supplierinput.css'

export type SupplierOption = {
  id: string
  name: string
}

type SupplierInputProps = {
  value: string
  options: SupplierOption[]
  onValueChange: (value: string) => void
  onSelect?: (supplier: SupplierOption) => void
  name?: string
  placeholder?: string
  disabled?: boolean
}

function SupplierInput({
  value,
  options,
  onValueChange,
  onSelect,
  name = 'supplier_name',
  placeholder = '输入或选择供应商',
  disabled = false,
}: SupplierInputProps) {
  const datalistId = useId()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    onValueChange(nextValue)

    const selectedSupplier = options.find((supplier) => supplier.name === nextValue)
    if (selectedSupplier) {
      onSelect?.(selectedSupplier)
    }
  }

  return (
    <>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="supplier-input"
        value={value}
        list={datalistId}
        disabled={disabled}
        autoComplete="off"
        onChange={handleChange}
      // className="bg-(---color-surface) hover:"
      />
      <datalist id={datalistId}>
        {options.map((supplier) => (
          <option key={supplier.id} value={supplier.name} />
        ))}
      </datalist>
    </>
  )
}

export default SupplierInput