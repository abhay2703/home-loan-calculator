"use client";

import { useState, useEffect, useId } from "react";
import { Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SliderInputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  error?: string;
  tooltip?: string;
  disabled?: boolean;
}

export function SliderInputField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  error,
  tooltip,
  disabled,
}: SliderInputFieldProps) {
  const id = useId();
  const [textValue, setTextValue] = useState(String(value));

  // Re-syncs the editable text buffer when the controlled value changes
  // from outside this field (e.g. the slider thumb is dragged), without
  // clobbering what the user is actively typing.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTextValue(String(value));
  }, [value]);

  function commitText(raw: string) {
    const parsed = Number(raw.replace(/,/g, ""));
    if (Number.isFinite(parsed)) {
      onChange(Math.min(Math.max(parsed, min), max));
    } else {
      setTextValue(String(value));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger className="inline-flex">
                <Info className="size-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ) : null}
        </FieldLabel>
        <div className="flex items-center gap-1">
          {prefix ? <span className="text-sm text-muted-foreground">{prefix}</span> : null}
          <Input
            id={id}
            value={textValue}
            disabled={disabled}
            inputMode="decimal"
            className="h-8 w-28 text-right tabular-nums"
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={(e) => commitText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText((e.target as HTMLInputElement).value);
            }}
          />
          {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}
