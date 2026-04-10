import { useMemo, useState } from "react";

type CalendarPickerProps = {
  value?: Date;
  onChange?: (date: Date) => void;
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}

function buildCalendarDays(viewDate: Date) {
  const firstDayOfMonth = startOfMonth(viewDate);
  const lastDayOfMonth = endOfMonth(viewDate);

  const startDay = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const prevMonth = addMonths(viewDate, -1);
  const lastDayPrevMonth = endOfMonth(prevMonth).getDate();

  const cells: { date: Date; currentMonth: boolean }[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    const day = lastDayPrevMonth - i;
    cells.push({
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= totalDaysInMonth; day++) {
    cells.push({
      date: new Date(viewDate.getFullYear(), viewDate.getMonth(), day),
      currentMonth: true,
    });
  }

  const remaining = 42 - cells.length;
  const nextMonth = addMonths(viewDate, 1);

  for (let day = 1; day <= remaining; day++) {
    cells.push({
      date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day),
      currentMonth: false,
    });
  }

  return cells;
}

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(value ?? today);
  const [viewDate, setViewDate] = useState<Date>(
    new Date((value ?? today).getFullYear(), (value ?? today).getMonth(), 1)
  );

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    onChange?.(date);
  };

  return (
    <div className="cal-wrapper">
      <div className="cal-header">
        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, -1))}
          className="cal-nav-btn"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="cal-month-label">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>

        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="cal-nav-btn"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="cal-day-header-row">
        {dayNames.map((day) => (
          <div key={day} className="cal-day-header-cell">
            {day}
          </div>
        ))}
      </div>

      <div className="cal-grid">
        {days.map(({ date, currentMonth }) => {
          const selected = isSameDay(date, selectedDate);
          const todayDate = isToday(date);

          const cellClass = [
            "cal-day-cell",
            currentMonth ? "cal-day-cell--current" : "cal-day-cell--outside",
            selected ? "cal-day-cell--selected" : "",
            todayDate && !selected ? "cal-day-cell--today" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleSelect(date)}
              className={cellClass}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer removed */}
    </div>
  );
}
