export function EmptyState(props: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-zinc-200 bg-white p-8 text-center">
      <div className="text-sm font-medium text-zinc-700">{props.title}</div>
      {props.description && (
        <div className="text-xs text-zinc-500">{props.description}</div>
      )}
    </div>
  );
}


