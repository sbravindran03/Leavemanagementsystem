import React, { useMemo, useState } from "react";

/**
 * TeamCalendar.jsx
 * - No external libs.
 * - Shows month view, prev/next nav, event dots + tooltip on hover.
 * - Replace MOCK_EVENTS with your backend data when ready.
 */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// mock events; keys are yyyy-mm-dd
const MOCK_EVENTS = {
  "2025-10-02": [{ id: 1, title: "Gandhi Jayanti (Holiday)" }],
  "2025-10-07": [{ id: 2, title: "Alice — Sick leave" }],
  "2025-10-11": [{ id: 3, title: "Team Outing" }],
  // random others for demonstration
  "2025-09-28": [{ id: 4, title: "Bob — Casual leave" }],
  "2025-10-15": [{ id: 5, title: "Monthly All-hands" }, { id: 6, title: "Vicky — WFH" }],
};

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TeamCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  // compute calendar grid (including prev/next month filler)
  const grid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0..6 (Sun..Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const totalSlots = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
    const cells = [];

    for (let i = 0; i < totalSlots; i++) {
      const dayNum = i - firstDayIndex + 1;
      if (dayNum <= 0) {
        // previous month
        const date = new Date(year, month - 1, prevMonthDays + dayNum);
        cells.push({ date, inMonth: false });
      } else if (dayNum > daysInMonth) {
        // next month
        const date = new Date(year, month + 1, dayNum - daysInMonth);
        cells.push({ date, inMonth: false });
      } else {
        const date = new Date(year, month, dayNum);
        cells.push({ date, inMonth: true });
      }
    }

    return cells;
  }, [month, year]);

  function goMonth(delta) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  // format title like "October 2025"
  const monthTitle = viewDate.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <section className="team-calendar modern-calendar-card">
      <div className="cal-header">
        <div className="cal-title">
          <button className="nav-btn" aria-label="Previous month" onClick={() => goMonth(-1)}>‹</button>
          <div className="month-label">{monthTitle}</div>
          <button className="nav-btn" aria-label="Next month" onClick={() => goMonth(1)}>›</button>
        </div>

        <div className="cal-legend">
          <div className="legend-item"><span className="dot pending"></span> Pending</div>
          <div className="legend-item"><span className="dot approved"></span> Approved</div>
          <div className="legend-item"><span className="dot holiday"></span> Holiday</div>
        </div>
      </div>

      <div className="cal-grid">
        <div className="weekday-row">
          {WEEKDAYS.map((w) => (
            <div key={w} className="weekday-cell">{w}</div>
          ))}
        </div>

        <div className="dates-grid" role="grid" aria-label={`Calendar for ${monthTitle}`}>
          {grid.map((cell, idx) => {
            const iso = toISODate(cell.date);
            const events = MOCK_EVENTS[iso] || [];
            const isToday = iso === toISODate(today);
            const classes = [
              "cal-cell",
              cell.inMonth ? "in-month" : "out-month",
              isToday ? "today" : "",
              events.length ? "has-events" : "",
            ].join(" ");

            return (
              <div key={idx} className={classes} role="gridcell" tabIndex={0} aria-label={cell.date.toDateString()}>
                <div className="cell-top">
                  <div className="date-num">{cell.date.getDate()}</div>
                </div>

                <div className="event-dots" aria-hidden>
                  {events.slice(0, 3).map((ev, i) => {
                    // color by event type rudimentary: holidays contain 'Holiday'
                    const type = /holiday/i.test(ev.title) ? "holiday" : /approved/i.test(ev.title) ? "approved" : "pending";
                    return <span key={i} className={`dot ${type}`} title={ev.title}></span>;
                  })}
                </div>

                {/* tooltip shown on hover/focus */}
                {events.length > 0 && (
                  <div className="tooltip" role="note" aria-hidden>
                    {events.map((ev) => (
                      <div key={ev.id} className="tooltip-item">{ev.title}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
