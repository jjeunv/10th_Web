const CommentSkeleton = () => (
  <div className="animate-pulse flex gap-3 py-4 border-b border-neutral-100">
    <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-24 rounded bg-neutral-200" />
      <div className="h-3 w-full rounded bg-neutral-200" />
      <div className="h-3 w-2/3 rounded bg-neutral-200" />
    </div>
  </div>
);

export default CommentSkeleton;
