import React, {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  useId,
  useState,
  useCallback,
  memo,
} from "react";

export type FloatingLabelInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  label: string;
  error?: string;
  format?: "phone";
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

const FloatingLabelInput = memo(
  forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    (
      {
        id,
        label,
        error,
        format,
        type = "text",
        placeholder = " ",
        disabled,
        required,
        className,
        wrapperClassName,
        inputClassName,
        labelClassName,
        errorClassName,
        value,
        defaultValue,
        onChange,
        inputMode,
        maxLength,
        ...props
      },
      ref
    ) => {
      const generatedId = useId();
      const inputId = id ?? generatedId;
      const errorId = error ? `${inputId}-error` : undefined;
      const isControlled = value !== undefined;

      const [internalValue, setInternalValue] = useState<string>(() => {
        const initial = typeof defaultValue === "string" ? defaultValue : "";
        return format === "phone" ? formatPhone(initial) : initial;
      });

      const displayValue = isControlled
        ? format === "phone" && typeof value === "string"
          ? formatPhone(value)
          : value
        : internalValue;

      const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
          const nextValue =
            format === "phone" ? formatPhone(event.target.value) : event.target.value;

          if (!isControlled) {
            setInternalValue(nextValue);
          }

          event.target.value = nextValue;
          onChange?.(event);
        },
        [format, isControlled, onChange]
      );

      return (
        <div className={cn("w-full space-y-1.5 mb-[6px]", wrapperClassName)}>
          <div className="relative">
            <input
              ref={ref}
              id={inputId}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              aria-invalid={Boolean(error)}
              aria-describedby={errorId || undefined}
              value={
                displayValue as string | number | readonly string[] | undefined
              }
              onChange={handleChange}
              inputMode={format === "phone" ? "numeric" : inputMode}
              maxLength={format === "phone" ? 14 : maxLength}
              className={cn(
                "peer min-h-[35px] w-full rounded-md border border-slate-500 bg-white px-3 pb-2 pt-4 text-sm leading-5 text-slate-500 outline-none shadow-none transition-colors placeholder:text-transparent",
                "focus:border-blue-600 focus:ring-0",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-red-500 text-slate-500 focus:border-red-500",
                className,
                inputClassName
              )}
              {...props}
            />

            <label
              htmlFor={inputId}
              className={cn(
                "pointer-events-none absolute left-3 top-0 z-10 -translate-y-1/2 origin-left bg-white px-1 text-xs leading-none text-slate-500 transition-all duration-200",
                "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:px-0 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500",
                "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:px-1 peer-focus:text-xs peer-focus:text-blue-600",
                "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-500",
                disabled && "bg-white text-slate-400",
                error && "text-slate-500 peer-focus:text-red-500",
                labelClassName
              )}
            >
              {label}
              {required ? <span className="ml-0.5 text-red-500">*</span> : null}
            </label>
          </div>

          {error ? (
            <p id={errorId} className={cn("px-1 text-xs text-red-500", errorClassName)}>
              {error}
            </p>
          ) : null}
        </div>
      );
    }
  )
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
export default FloatingLabelInput;