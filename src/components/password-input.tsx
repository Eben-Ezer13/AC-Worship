"use client";

import { useState } from "react";

type PasswordInputProps = {
  name: string;
  autoComplete: string;
  minLength?: number;
};

export function PasswordInput({ name, autoComplete, minLength }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-field">
      <input
        className="password-field-input"
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
      <button
        className="password-visibility-toggle"
        type="button"
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.2 0 8.5 4.3 9.5 6.1a1.7 1.7 0 0 1 0 1.8 14 14 0 0 1-3.1 3.6M6.2 6.2a14 14 0 0 0-3.7 4.9 1.7 1.7 0 0 0 0 1.8C3.5 14.7 6.8 19 12 19a10 10 0 0 0 3-.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        )}
      </button>
    </span>
  );
}
