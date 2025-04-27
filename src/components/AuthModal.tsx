"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  initialMessage?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = "signin",
  initialMessage = ""
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(initialMessage);
  // Add loading state
  const [loading, setLoading] = useState(false);

  // Add this useEffect to handle initialMessage changes
  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  // Switch between sign in and sign up modes
  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setMessage("");
  };

  // Reset form when modal closes
  const handleClose = () => {
    setError("");
    setMessage("");
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setLoading(false); // Reset loading state
    onClose();
  };

  // Handle sign in submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading to true when submission starts
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password
      });
      
      if (result?.error) {
        setError("Invalid email or password. Please check your credentials and try again.");
        setLoading(false); // Reset loading state on error
        return;
      }
      
      handleClose();
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false); // Reset loading state on error
    }
  };

  // Handle sign up submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true); // Set loading to true when submission starts
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Redirect to sign in with success message
      router.push(`/signin?registered=true`);
    } catch (error: any) {
      setError(error.message || "An error occurred during registration.");
      setLoading(false); // Reset loading state on error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fadeIn">
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" 
          onClick={handleClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-center text-2xl font-bold mb-6 text-black">
            {mode === "signin" ? "Sign in" : "Create an account"}
          </h2>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-blue-50 text-blue-600 p-3 rounded-md mb-4 text-sm">
              {message}
            </div>
          )}
          
          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-md text-white ${
                    loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-md text-white ${
                    loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <p>
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                type="button"
                onClick={toggleMode} 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}