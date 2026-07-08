export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white p-4 sm:p-8 flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 bg-white/10 rounded-lg" />
          <div className="h-4 w-40 bg-white/5 rounded-md" />
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-24 bg-white/10 rounded-xl" />
          <div className="h-10 w-24 bg-white/10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6 bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl">
          <div className="h-6 w-48 bg-white/10 rounded-lg mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
              <div className="h-5 w-5 bg-white/10 rounded-md" />
              <div className="h-5 w-24 bg-white/10 rounded-md" />
              <div className="h-5 flex-1 bg-white/5 rounded-md" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col gap-4">
            <div className="h-6 w-32 bg-white/10 rounded-lg" />
            <div className="flex justify-center py-4">
              <div className="h-32 w-32 rounded-full border-8 border-white/5 border-t-white/10 animate-spin" />
            </div>
          </div>

          <div className="bg-[#111827]/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl flex flex-col gap-4">
            <div className="h-6 w-40 bg-white/10 rounded-lg" />
            <div className="h-4 w-full bg-white/5 rounded-full" />
            <div className="h-4 w-2/3 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
