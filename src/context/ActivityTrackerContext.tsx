"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useEffect, useState } from "react";

// Set timeout to 15 minutes (in milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const PUBLIC_PATHS = ["/", "/signin", "/signup"];

export const ActivityTrackerContext = createContext({
  resetTimer: () => {},
});

export default function ActivityTrackerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  // Function to reset the timer
  const resetTimer = () => {
    if (timer) clearTimeout(timer);
    if (session && !isPublicPath) {
      const newTimer = setTimeout(() => {
        console.log("No activity detected for 15 minutes. Logging out...");
        signOut({ callbackUrl: "/signin?timeout=true" });
      }, INACTIVITY_TIMEOUT);
      
      setTimer(newTimer);
    }
  };

  // Setup event listeners on component mount
  useEffect(() => {
    // Don't setup the tracker if not authenticated or on public pages
    if (status !== "authenticated" || isPublicPath) return;
    
    // List of events to track
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [status, pathname, session]); // Re-run when these dependencies change

  return (
    <ActivityTrackerContext.Provider value={{ resetTimer }}>
      {children}
    </ActivityTrackerContext.Provider>
  );
}