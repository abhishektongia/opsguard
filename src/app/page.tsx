export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold mb-4">OpsGuard</h1>
        <p className="text-xl text-gray-600 mb-8">
          Production-ready alerting and incident management platform
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Sign Up
          </a>
        </div>
      </div>
    </main>
  );
}
