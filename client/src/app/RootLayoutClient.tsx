"use client";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ReduxProvider } from "@/components/PersistGateWrapper";
import { AuthInitializer } from "@/components/AuthInitializer";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { RootState } from "@/types";

const geistSans = GeistSans;
const geistMono = GeistMono;

// This component ensures we only render on the client
interface ClientOnlyProps {
  children: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading } = useSelector((state: RootState) => ({
    token: state.auth.token,
    loading: state.auth.loading,
  }));

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
    }

    const cleanupAttributes = () => {
      if (typeof document === "undefined") return;

      const body = document.body;
      const attributesToRemove = [
        "cz-shortcut-listen",
        "data-extension-attribute",
        "data-gramm",
        "data-gramm_editor",
        "data-enable-grammarly",
        "data-new-gr-c-s-check-loaded",
        "data-gr-ext-installed",
        "data-tts",
        "data-grammarly-shadow-root",
        "data-gramm_editor",
        "data-gramm_id",
        "data-language",
        "data-grammarly-extension-id",
        "data-grammarly-extension-installed",
        "data-grammarly-extension-version",
      ];

      attributesToRemove.forEach((attr) => {
        if (body.hasAttribute(attr)) body.removeAttribute(attr);
        if (document.documentElement.hasAttribute(attr)) {
          document.documentElement.removeAttribute(attr);
        }
      });
    };

    cleanupAttributes();

    let observer: MutationObserver | null = null;

    if (typeof document !== "undefined") {
      observer = new MutationObserver((mutations) => {
        if (mutations.some((m) => m.type === "attributes")) {
          cleanupAttributes();
        }
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["cz-shortcut-listen", "data-extension-attribute"],
      });
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  // Always compute redirect needs and register effects before any early return
  const needsRedirectToDashboard = pathname === "/login" && token;
  const needsRedirectToLogin = pathname !== "/login" && !token;

  // Trigger redirects via effects so we can render a friendly UI while navigation happens
  useEffect(() => {
    if (needsRedirectToDashboard) {
      router.push("/dashboard");
    }
  }, [needsRedirectToDashboard, router]);

  useEffect(() => {
    if (needsRedirectToLogin) {
      router.push("/login");
    }
  }, [needsRedirectToLogin, router]);

  if (!mounted) {
    return null;
  }

  // Show global loading while auth is initializing
  if (loading) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (needsRedirectToDashboard) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-700">Redirecting to dashboard…</p>
          </div>
        </div>
      </>
    );
  }

  if (needsRedirectToLogin) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-700">Signing out…</p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
};

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <AuthInitializer />
          <ClientOnly>{children}</ClientOnly>
        </ReduxProvider>
      </body>
    </html>
  );
}
