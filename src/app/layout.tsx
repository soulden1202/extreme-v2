import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarSubscriptions } from "@/components/sidebar-subscriptions";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { SearchInput } from "@/components/search-input";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedSignInButton } from "@/components/animated-signin-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Extreme V2",
  description: "Next Gen Video Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar>
                 <SidebarSubscriptions />
              </AppSidebar>
              <SidebarInset className="h-screen overflow-hidden">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 transition-all">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <div className="flex flex-1 items-center justify-between gap-4">
                     <Suspense fallback={<div className="w-full max-w-sm h-10 bg-muted/50 rounded-md" />}>
                        <SearchInput />
                     </Suspense>
                     <div className="flex items-center gap-2">
                        <ModeToggle />
                        <SignedOut>
                            <AnimatedSignInButton />
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                     </div>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
                    {children}
                </div>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
