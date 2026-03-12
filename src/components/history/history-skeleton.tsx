"use client";

export function HistorySkeleton() {
  return (
    <div className="mt-20 max-w-3xl mx-auto p-6 animate-pulse">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-9 w-40 bg-gray-200 rounded-lg" />
        <div className="h-9 w-32 bg-gray-100 rounded-full" />
      </div>

      {/* Скелетон фильтра дат */}
      <div className="flex gap-3 mb-6 overflow-hidden">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-14 h-20 bg-gray-100 rounded-2xl"
          />
        ))}
      </div>

      {/* Скелетон групп и карточек */}
      <div className="space-y-10">
        {[1, 2].map((group) => (
          <div key={group} className="space-y-4">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-blue-50 rounded" />
            </div>

            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="bg-white border border-gray-100 rounded-2xl p-5 h-[116px]"
              >
                <div className="flex justify-between mb-4">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-4 w-4 bg-gray-50 rounded" />
                </div>
                <div className="flex justify-between items-end">
                  <div className="h-6 w-24 bg-gray-200 rounded" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
