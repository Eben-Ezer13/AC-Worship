"use client";

import { useEffect, useState } from "react";

function localDateTimeNow() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  now.setSeconds(0, 0);
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function EventDateTimeField({ initialValue = "", allowPast = false }: { initialValue?: string; allowPast?: boolean }) {
  const [value, setValue] = useState("");
  const [offset, setOffset] = useState(0);
  const [minimum, setMinimum] = useState("");

  useEffect(() => {
    const date = initialValue ? new Date(initialValue) : new Date();
    if (initialValue && Number.isFinite(date.getTime())) {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
      setValue(local.toISOString().slice(0, 16));
    }
    setOffset(date.getTimezoneOffset());
    setMinimum(localDateTimeNow());
  }, [initialValue]);

  function updateValue(nextValue: string) {
    setValue(nextValue);
    const localDate = new Date(nextValue);
    if (Number.isFinite(localDate.getTime())) setOffset(localDate.getTimezoneOffset());
  }

  return (
    <label className="event-date-time-field">
      Date et heure de l’événement
      <input type="datetime-local" name="startsAt" value={value} min={allowPast ? undefined : minimum || undefined} required onChange={(event) => updateValue(event.target.value)} />
      <input type="hidden" name="startsAtOffset" value={offset} />
      <small>Choisissez le jour et l’heure locale de début. Un décompte sera affiché sur la page des événements.</small>
    </label>
  );
}
