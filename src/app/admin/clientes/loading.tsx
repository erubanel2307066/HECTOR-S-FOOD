export default function Loading() {
  return (
    <div>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="mb-4 max-w-xs">
        <div className="h-10 animate-pulse rounded-xl bg-gray-200" />
      </div>
      <div className="animate-pulse rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
