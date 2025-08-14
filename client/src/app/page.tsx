"use client";

import LoginPage from "./login/page";

export default function Home() {
  // Render the login page directly at the root so home (/) is the login UI
  return <LoginPage />;
}
