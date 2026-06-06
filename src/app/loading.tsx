export default function Loading() {
  return (
    <div className="pt-20 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#64748B] text-sm">加载中...</p>
      </div>
    </div>
  );
}
