"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Today", href: "/today" },
    { name: "Most recent", href: "/most-recent" },
    { name: "Tags", href: "/tags" },
    { name: "Data Analysis", href: "/analysis" },
  ];

  return (
    <nav className="bg-white shadow-md border-b-2 border-[#0066CC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[#0066CC] hover:text-[#004C99] transition-colors">
              BMW News Hub
            </Link>
          </div>
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white bg-[#0066CC] hover:bg-[#0052A3]"
                      : "text-[#1A1A1A] hover:text-[#0066CC] hover:bg-[#E6F2FF]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
