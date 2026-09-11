import { Select as RadixSelect } from 'radix-ui'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import './Select.css'

export type SelectOption = {
  value: string
  label: ReactNode
  disabled?: boolean
}

export type SelectProps = {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: ReactNode
  onValueChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  name?: string
  open?: boolean
  defaultOpen?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
  sideOffset?: number
}

const joinClassNames = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ')

export function Select({
  options,
  value,
  defaultValue,
  placeholder = '请选择',
  onValueChange,
  onOpenChange,
  disabled,
  name,
  open,
  defaultOpen,
  className,
  triggerClassName,
  contentClassName,
  itemClassName,
  sideOffset = 8,
}: SelectProps) {
  const triggerLabel = typeof placeholder === 'string' ? placeholder : 'Select option'

  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      open={open}
      defaultOpen={defaultOpen}
      onValueChange={onValueChange}
      onOpenChange={onOpenChange}
      disabled={disabled}
      name={name}
    >
      <RadixSelect.Trigger
        className={joinClassNames('select-trigger', className, triggerClassName)}
        aria-label={triggerLabel}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="select-icon">
          <ChevronDown size={14} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className={joinClassNames('select-content', contentClassName)}
          position="popper"
          sideOffset={sideOffset}
        >
          <RadixSelect.Viewport className="select-viewport">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={joinClassNames('select-item', itemClassName)}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="select-item-indicator">
                  <Check size={14} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}

export default Select
