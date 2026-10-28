export default function PortalLoading() {
  return (
    <div className="fixed inset-x-0 top-14 z-50 h-0.5 overflow-hidden bg-blue-100">
      <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-blue-600" />
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}