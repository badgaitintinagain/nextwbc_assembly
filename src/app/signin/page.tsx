"use client";
export const dynamic = 'force-dynamic';

import AuthModal from "@/components/AuthModal";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Extract the component that uses useSearchParams
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(true);

  // Check for success message from registration or timeout
  const registered = searchParams?.get("registered") === "true";
  const timeout = searchParams?.get("timeout") === "true";
  
  const message = registered 
    ? "Account created successfully. Please sign in."
    : timeout 
      ? "Your session has expired due to inactivity. Please sign in again."
      : "";

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Redirect to home page when modal is closed
    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-130px)] bg-gray-50">
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        initialMode="signin" 
        initialMessage={message}
      />
    </div>
  );
}

export default function SignIn() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="min-h-[calc(100vh-130px)] bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-center">Loading sign in...</p>
          </div>
        </div>
      }>
        <SignInContent />
      </Suspense>
      <Footer />
    </>
  );
}