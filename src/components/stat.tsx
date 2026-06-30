export function Stat({
  label,
  value,
  helper,
  className,
}: {
  label: string;
  value: string;
  helper?: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold tabular-nums ${className ?? ""}`}>{value}</span>
      {helper ? <span className="text-xs text-muted-foreground">{helper}</span> : null}
    </div>
  );
}
