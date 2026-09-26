"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.PropsWithChildren {
  onValueChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;
}

const Select = ({ children, onValueChange, value, defaultValue }: SelectProps) => {
  const [internalValue, setInternalValue] = React.useState(value || defaultValue || "");

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  // Provide the value to children if needed, but for native select we handle it differently
  return (
    <div className="relative w-full group">
      <select
        value={value !== undefined ? value : internalValue}
        onChange={handleValueChange}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none transition-transform group-focus-within:rotate-180" />
    </div>
  );
};

const SelectTrigger = ({ children, className, ...props }: React.ComponentPropsWithoutRef<"button">) => null;
const SelectContent = ({ children }: { children: React.ReactNode }) => children;
const SelectValue = ({ placeholder }: { placeholder: string }) => {
  return <option value="" disabled hidden>{placeholder}</option>;
};

const SelectItem = ({ children, value }: { children: React.ReactNode; value: string; className?: string }) => (
  <option value={value}>
    {children}
  </option>
);

export {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
}
