"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { FloatingWidgets } from "./floating-widgets";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 size-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container mx-auto flex min-h-screen items-center px-6">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left side - Content */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border bg-card/50 px-4 py-2 text-sm backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="size-4 text-primary" />
              <span className="text-muted-foreground">
                Your personal command center
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Everything you need.
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                One dashboard.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="mb-8 max-w-md text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Aggregate your news, track pull requests, manage expenditures, and
              more — all in one beautiful, unified interface.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button asChild size="lg" className="group">
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12 flex items-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500" />
                <span>Always secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span>Real-time updates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-purple-500" />
                <span>Multiple themes</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Floating widgets animation */}
          <motion.div
            className="relative hidden lg:flex lg:items-center lg:justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <FloatingWidgets />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
