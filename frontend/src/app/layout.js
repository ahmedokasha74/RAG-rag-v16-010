import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CareerAI - Engine",
  description: "Enterprise-Grade AI Career Optimization Platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex h-screen bg-background overflow-hidden text-foreground">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="career-ai-theme"
          disableTransitionOnChange={false}
        >
          <Sidebar className="hidden md:flex w-64 flex-col bg-card" />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto w-full md:pl-64 pb-20 md:pb-0">
            <div className="container mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
