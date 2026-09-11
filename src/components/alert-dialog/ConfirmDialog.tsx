import { AlertDialog } from 'radix-ui'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import './ConfirmDialog.css'

export type ConfirmTone = 'danger' | 'default'

export type ConfirmOptions = {
  title: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  tone?: ConfirmTone
}

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }

  return ctx
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmContextValue>((opts) => {
    setOptions(opts)
    setOpen(true)

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setOpen(false)
  }, [])

  const isDanger = (options?.tone ?? 'default') === 'danger'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AlertDialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            settle(false)
          }
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="alert-dialog-overlay" />
          <AlertDialog.Content className="alert-dialog-content">
            <div className="alert-dialog-body">
              <span className={`alert-dialog-icon ${isDanger ? 'danger' : 'default'}`} aria-hidden="true">
                {isDanger ? '!' : 'i'}
              </span>

              <div className="alert-dialog-copy">
                <AlertDialog.Title className="alert-dialog-title">{options?.title}</AlertDialog.Title>
                {options?.description ? (
                  <AlertDialog.Description className="alert-dialog-description">
                    {options.description}
                  </AlertDialog.Description>
                ) : null}
              </div>
            </div>

            <div className="alert-dialog-actions">
              <AlertDialog.Cancel asChild>
                <button type="button" className="alert-dialog-button cancel" onClick={() => settle(false)}>
                  {options?.cancelText ?? '取消'}
                </button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <button type="button" className="alert-dialog-button confirm" onClick={() => settle(true)}>
                  {options?.confirmText ?? '确认'}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  )
}
