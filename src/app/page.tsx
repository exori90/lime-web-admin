'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessions } from "@/services/monitoring/orchestratorService";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<string[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleGetSessions = async () => {
    console.log('🎯 Getting sessions...');
    setSessionsLoading(true);
    setSessionsError(null);
    
    try {
      const response = await getSessions();
      console.log('📡 Sessions response:', response);
      if (response.success && response.data) {
        setSessions(response.data);
      } else {
        setSessionsError(response.message || 'Failed to fetch sessions');
      }
    } catch (error) {
      console.error('🔥 Sessions error:', error);
      setSessionsError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSessionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">🔄 Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }
  return (
    <div className="font-sans min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Lime Web Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user.username}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold mb-4 text-white">Admin Dashboard</h2>
          <p className="text-lg text-gray-300 mb-6">
            Complete API service layer with TypeScript support
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 max-w-2xl">
          <h3 className="text-xl font-semibold mb-4 text-white">🚀 API Service Features</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              TypeScript support with full type safety
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Multiple service instances (auth, users, files)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Built-in error handling and retry logic
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Custom React hooks for easy integration
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              JWT authentication with automatic token management
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              File upload support and caching utilities
            </li>
          </ul>
        </div>

        {/* Orchestrator Sessions Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 max-w-2xl">
          <h3 className="text-xl font-semibold mb-4 text-white">🔗 Orchestrator Sessions</h3>
          
          <button
            onClick={handleGetSessions}
            disabled={sessionsLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors mb-4"
          >
            {sessionsLoading ? '🔄 Loading...' : '📡 Get Active Sessions'}
          </button>

          {sessionsError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded text-sm">
              Error: {sessionsError}
            </div>
          )}

          {sessions.length > 0 && (
            <div className="bg-gray-700 p-4 rounded-md">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Active Sessions ({sessions.length}):</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                {sessions.map((session, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {session}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!sessionsLoading && sessions.length === 0 && !sessionsError && (
            <div className="text-gray-400 text-sm italic">
              Click "Get Active Sessions" to fetch current orchestrator sessions
            </div>
          )}
        </div>

        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left text-gray-300">
          <li className="mb-2 tracking-[-.01em]">
            Check out the API service in{" "}
            <code className="bg-gray-700 font-mono font-semibold px-1 py-0.5 rounded text-gray-200">
              src/services/
            </code>
          </li>
          <li className="tracking-[-.01em]">
            View examples in{" "}
            <code className="bg-gray-700 font-mono font-semibold px-1 py-0.5 rounded text-gray-200">
              src/services/examples/
            </code>
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/services/README.md"
            className="rounded-full border border-solid border-gray-600 transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            📖 API Documentation
          </Link>
          <a
            className="rounded-full border border-solid border-gray-600 transition-colors flex items-center justify-center hover:bg-gray-700 bg-gray-800 text-gray-300 hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://github.com/your-repo/lime-web-admin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="GitHub icon"
              width={16}
              height={16}
            />
            View on GitHub
          </a>
        </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16 p-8">
        <div className="max-w-7xl mx-auto flex gap-[24px] flex-wrap items-center justify-center text-gray-400">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
        </div>
      </footer>
    </div>
  );
}
