import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * =========================================================================
 * DatePicker Component - Date Selection with Calendar Popup
 * =========================================================================
 * Fully controlled: no internal date state. The parent owns the value.
 */

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  yearRange?: number;
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "", 
  className, 
  disabled = false,
  yearRange = 12
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "date-picker-trigger w-full flex items-center justify-start text-left border-0 border-b border-border rounded-none bg-transparent px-0 py-2 text-xs transition-colors outline-none",
            "focus-visible:ring-0 focus-visible:border-b-primary",
            !value && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            value && "date-picker-trigger--has-value",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 date-picker-calendar-icon" />
          <span className="truncate">{value ? format(value, "MM/dd/yyyy") : placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="date-picker-content w-auto p-0 border-0 shadow-lg overflow-hidden rounded-lg" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabled}
          initialFocus
          defaultMonth={value || new Date()}
          className="[&>div:last-child]:mx-4 [&>div:last-child]:mb-4"
        />
      </PopoverContent>
    </Popover>
  );
}