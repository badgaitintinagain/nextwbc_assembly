"use client";
export const dynamic = 'force-dynamic';

import AuthModal from "@/components/AuthModal";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Check for success message from registration or timeout
  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setMessage("Account created successfully. Please sign in.");
      setIsModalOpen(true);
    } else if (searchParams?.get("timeout") === "true") {
      setMessage("Your session has expired due to inactivity. Please sign in again.");
      setIsModalOpen(true);
    } else {
      // Open modal automatically on page visit
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Redirect to home page when modal is closed
    router.push("/");
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-130px)] bg-gray-50">
        <AuthModal 
          isOpen={isModalOpen} 
          onClose={handleModalClose} 
          initialMode="signin" 
        />
      </div>
      <Footer />
    </>
  );
}