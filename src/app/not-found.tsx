export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you're looking for doesn't exist or was moved.</p>
        <a href="/" className="mt-6 inline-block rounded-md bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800">
          Go home
        </a>
      </div>
    </div>
  );
}