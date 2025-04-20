"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  
  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    "Configuration": "There is a problem with the server configuration.",
    "AccessDenied": "You do not have permission to sign in.",
    "Verification": "The verification link may have expired or was already used.",
    "Default": "An unexpected error occurred during authentication."
  };
  
  const errorMessage = error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default;
  
  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-130px)] bg-gray-50 items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{errorMessage}</p>
            {error && <p className="text-xs text-gray-500 mt-2">Error code: {error}</p>}
          </div>
          <Link
            href="/signin"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
