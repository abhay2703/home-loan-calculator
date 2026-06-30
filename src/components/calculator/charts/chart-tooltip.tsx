import { formatINR } from "@/lib/calculations/format";

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { name: string; value: number; color: string }[];
}

export function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label ? <p className="mb-1 font-medium text-popover-foreground">{label}</p> : null}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium tabular-nums text-popover-foreground">
              {formatINR(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
