import {
  differenceInMilliseconds,
  addHours,
  getMonth,
  getDate,
  getYear,
  startOfHour,
} from "date-fns";
import { useEffect, useState, useRef } from "react";

function msUntilNextHour() {
  const now = new Date();
  const next = addHours(startOfHour(now), 1);
  return differenceInMilliseconds(next, now);
}

export function useCurrentDate() {
  const [date, setDate] = useState(startOfHour(new Date()));
  const timer = useRef(0);

  useEffect(() => {
    function delayedTimeChange() {
      timer.current = setTimeout(() => {
        delayedTimeChange();
      }, msUntilNextHour());

      setDate(new Date(startOfHour(new Date())));
    }

    delayedTimeChange();
    return () => clearTimeout(timer.current);
  }, []);

  return {
    date,
    year: getYear(date),
    month: getMonth(date),
    day: getDate(date),
  };
}
