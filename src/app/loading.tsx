export default function Loading() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="w-full h-14 bg-gray-200 dark:bg-gray-800 rounded-full mb-8 animate-pulse" />
      
      <div className="mb-8">
        <div className="w-48 h-6 bg-gray-200 dark:bg-gray-800 rounded-md mb-4 animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[300px] h-[280px] shrink-0 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>

      <div>
        <div className="w-48 h-6 bg-gray-200 dark:bg-gray-800 rounded-md mb-4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="w-full h-[280px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
