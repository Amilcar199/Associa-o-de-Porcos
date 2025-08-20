export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-10 w-10 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
        <p className="mt-2 text-xs font-medium text-primary-700">Carregando...</p>
      </div>
    </div>
  )
}