"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { logout } from "@/store/auth/authSlice";
import { useEffect, useState } from "react";

type Tab = {
  name: string;
  href: string;
  onClick?: () => void;
};

const NavTabs = () => {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => !!state.auth.token);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isAuthenticated) return null;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const tabs: Tab[] = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Add Attendance", href: "/add-attendance" },
    { name: "Reports", href: "/reports" },
    { name: "Logout", href: "#", onClick: handleLogout },
  ];

  return (
    <nav className="flex space-x-1 mb-6 border-b border-gray-200 bg-white px-4">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        // For the logout button, we'll keep it as a button
        if (tab.name === "Logout") {
          return (
            <button
              key={tab.name}
              onClick={tab.onClick}
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              {tab.name}
            </button>
          );
        }

        // For regular navigation links, use Next.js Link
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? "border-b-2 border-brand text-brand bg-brand/10"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavTabs;
