"use client";

import { motion } from "framer-motion";
import { FloatingWidgets } from "./floating-widgets";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Animated visual */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:items-center lg:justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 size-96 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 size-64 rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <FloatingWidgets />

          {/* Tagline below animation */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold tracking-tight">
              Your personal command center
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need, one dashboard
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
