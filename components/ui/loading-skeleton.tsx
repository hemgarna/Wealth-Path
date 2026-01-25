export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-gray-200 rounded" />
          <div className="h-9 w-20 bg-gray-200 rounded" />
          <div className="h-9 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="h-10 w-full bg-gray-200 rounded" />

      {/* Cards skeleton */}
      <div className="space-y-4">
        <div className="h-48 w-full bg-gray-200 rounded-lg" />
        <div className="h-64 w-full bg-gray-200 rounded-lg" />
        <div className="h-96 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}
