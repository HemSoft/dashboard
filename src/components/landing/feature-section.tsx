"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { GitPullRequest, Newspaper, Wallet } from "lucide-react";

const features = [
  {
    icon: <Newspaper className="size-6" />,
    title: "News Aggregation",
    description:
      "Stay informed with curated news from your favorite RSS feeds. Filter, save, and never miss what matters.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <GitPullRequest className="size-6" />,
    title: "PR Tracking",
    description:
      "Monitor pull requests across your GitHub repositories. See review status, CI checks, and merge readiness at a glance.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <Wallet className="size-6" />,
    title: "Expense Management",
    description:
      "Track your spending with smart categorization. Visualize trends and stay on top of your budget.",
    gradient: "from-green-500 to-emerald-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export function FeatureSection() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful features for{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              productive people
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Everything you need to stay organized and informed, beautifully
            designed and seamlessly integrated.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="group relative h-full overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5">
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
                />

                <CardHeader>
                  <div
                    className={`mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} text-white`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
