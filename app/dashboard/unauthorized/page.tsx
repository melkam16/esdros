// app/dashboard/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-gray-50">
      <h1 className="text-4xl font-extrabold text-red-600">403 - Access Denied</h1>
      <p className="mt-2 text-gray-600 max-w-md">
        Your current account permissions do not grant clearance to view this dashboard segment.
      </p>
      <a href="/login" className="mt-6 px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800">
        Return to Login
      </a>
    </div>
  );
}