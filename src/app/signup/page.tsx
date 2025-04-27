"use client";

import AuthModal from "@/components/AuthModal";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUp() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Open modal automatically on page visit
    setIsModalOpen(true);
  }, []);

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
          initialMode="signup" 
        />
      </div>
      <Footer />
    </>
  );
}