
"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function AnimatedSignInButton() {
  return (
    <SignInButton mode="modal">
      <Button 
        variant="default" 
        size="sm"
        className="relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 group"
      >
        <span className="relative z-10 flex items-center gap-2">
            <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            Sign In
        </span>
        <div className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-hover:scale-100 group-hover:bg-primary/10"></div>
      </Button>
    </SignInButton>
  );
}
