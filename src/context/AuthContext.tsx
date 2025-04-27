"use client";

import { SessionProvider } from "next-auth/react";
import ActivityTrackerProvider from "./ActivityTrackerContext";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ActivityTrackerProvider>{children}</ActivityTrackerProvider>
    </SessionProvider>
  );
}