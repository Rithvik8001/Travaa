"use client";

import { useId } from "react";

/** Props Field wires into the control so the a11y links can't be forgotten. */
export interface FieldControlProps {
  readonly id: string;
  readonly "aria-invalid": boolean;
  readonly "aria-describedby": string | undefined;
}

interface FieldProps {
  readonly label: string;
  /** Renders below the control and flips the control into its invalid state. */
  readonly error?: string;
  readonly children: (props: FieldControlProps) => React.ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="text-foreground text-[13.5px] font-medium">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}
      {error ? (
        <p id={errorId} className="text-danger text-[13px]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
