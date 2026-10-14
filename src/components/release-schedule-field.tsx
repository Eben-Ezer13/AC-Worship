"use client";

import { useState } from "react";

type ReleaseScheduleFieldProps = {
  initialMode?: "immediate" | "scheduled";
  initialValue?: string;
};

function localDateTimeNow() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 1);
  date.setSeconds(0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function ReleaseScheduleField({ initialMode = "immediate", initialValue = "" }: ReleaseScheduleFieldProps) {
  const [mode, setMode] = useState(initialMode);
  const [value, setValue] = useState(initialValue);
  const [offset, setOffset] = useState(() => initialValue ? new Date(initialValue).getTimezoneOffset() : new Date().getTimezoneOffset());

  function updateDateTime(nextValue: string) {
    setValue(nextValue);
    const localDate = new Date(nextValue);
    if (Number.isFinite(localDate.getTime())) setOffset(localDate.getTimezoneOffset());
  }

  return (
    <fieldset className="release-schedule-field">
      <legend>Publication</legend>
      <label className="release-mode-option">
        <input type="radio" name="releaseMode" value="immediate" checked={mode === "immediate"} onChange={() => setMode("immediate")} />
        <span><b>Publication immédiate</b><small>Le chant sera disponible dès son enregistrement.</small></span>
      </label>
      <label className="release-mode-option">
        <input type="radio" name="releaseMode" value="scheduled" checked={mode === "scheduled"} onChange={() => setMode("scheduled")} />
        <span><b>Publication programmée</b><small>Choisissez le jour et l’heure de sortie.</small></span>
      </label>
      {mode === "scheduled" && (
        <label className="release-date-input">
          Date et heure de publication
          <input type="datetime-local" name="releaseDate" value={value} min={localDateTimeNow()} required onChange={(event) => updateDateTime(event.target.value)} />
          <input type="hidden" name="releaseDateOffset" value={offset} />
          <small>Heure locale de votre appareil. La date doit être dans le futur.</small>
        </label>
      )}
    </fieldset>
  );
}
