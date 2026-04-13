type Props = {
  id: string
  label: string
  hint?: string
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  variant?: 'default' | 'danger'
}

export function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
  disabled,
  variant = 'default',
}: Props) {
  return (
    <div className={`toggle ${variant === 'danger' ? 'toggle--danger' : ''}`}>
      <div className="toggle__text">
        <label htmlFor={id} className="toggle__label">
          {label}
        </label>
        {hint ? <p className="toggle__hint">{hint}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className="toggle__switch"
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className="toggle__thumb" />
      </button>
    </div>
  )
}
