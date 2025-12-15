import * as React from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value: number | string;
  onChange: (value: number) => void;
}

const formatToRupiah = (num: number): string => {
  return num.toLocaleString('id-ID');
};

const parseFromRupiah = (str: string): number => {
  const cleaned = str.replace(/\./g, '').replace(/,/g, '');
  return parseInt(cleaned, 10) || 0;
};

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const numericValue = typeof value === 'string' ? parseFromRupiah(value) : (value || 0);
    const displayValue = numericValue > 0 ? formatToRupiah(numericValue) : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numValue = parseFromRupiah(inputValue);
      onChange(numValue);
    };

    return (
      <input
        type="text"
        inputMode="numeric"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
