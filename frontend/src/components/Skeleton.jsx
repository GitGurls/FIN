export const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-glass ${className}`} />
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`glass-card p-5 ${className}`}>
    <SkeletonBlock className="h-3 w-20 mb-3" />
    <SkeletonBlock className="h-7 w-28" />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center justify-between px-5 py-4">
    <div className="space-y-2">
      <SkeletonBlock className="h-3.5 w-32" />
      <SkeletonBlock className="h-3 w-20" />
    </div>
    <SkeletonBlock className="h-4 w-16" />
  </div>
);