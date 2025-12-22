"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-6">
        <motion.div
          className="relative overflow-hidden rounded-3xl border bg-card/50 p-12 text-center backdrop-blur-xl md:p-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background decoration */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div className="size-64 rounded-full bg-primary/20 blur-[100px]" />
          </div>

          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
              Join and take control of your digital life. Set up takes less than
              a minute.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group">
                <Link href="/signup">
                  Create your account
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in to existing account</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
