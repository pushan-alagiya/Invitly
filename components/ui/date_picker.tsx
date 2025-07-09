import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface DatePickerProps {
  selected?: Date;
  onChange: (date: Date) => void;
}

export function DatePicker({ selected, onChange }: DatePickerProps) {
  const [date, setDate] = useState<Date>(selected || new Date());
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onChange(newDate);
      setIsOpen(false);
    }
  };

  const handleMonthChange = (month: string) => {
    const updatedDate = new Date(date.getFullYear(), parseInt(month, 10), 1);
    setDate(updatedDate);
    onChange(updatedDate);
  };

  const handleYearChange = (year: string) => {
    const updatedDate = new Date(parseInt(year, 10), date.getMonth(), 1);
    setDate(updatedDate);
    onChange(updatedDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-40">
          {format(date, "PPP")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0 pt-4">
        <div className="flex gap-2 mb-2 px-4 justify-between items-center">
          <Select
            onValueChange={handleMonthChange}
            value={date.getMonth().toString()}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const monthIndex = i;
                const isCurrentYear =
                  date.getFullYear() === new Date().getFullYear();
                if (isCurrentYear && monthIndex < new Date().getMonth()) {
                  return null;
                }
                return (
                  <SelectItem key={monthIndex} value={monthIndex.toString()}>
                    {format(new Date(2000, monthIndex, 1), "MMMM")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select
            onValueChange={handleYearChange}
            value={date.getFullYear().toString()}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          month={date} // Ensures calendar updates when date changes
          onMonthChange={setDate} // Sync calendar when navigating months manually
        />
      </PopoverContent>
    </Popover>
  );
}
