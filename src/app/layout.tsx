import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "News Hub",
  description: "Latest news and articles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5F5F5] min-h-screen">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
