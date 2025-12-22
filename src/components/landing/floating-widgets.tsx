"use client";

import { motion } from "framer-motion";
import { BarChart3, GitPullRequest, Newspaper, Wallet } from "lucide-react";

interface WidgetPreview {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
}

const widgets: WidgetPreview[] = [
  {
    icon: <Newspaper className="size-5" />,
    title: "News Feed",
    subtitle: "12 new articles",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: <GitPullRequest className="size-5" />,
    title: "Pull Requests",
    subtitle: "3 awaiting review",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: <Wallet className="size-5" />,
    title: "Expenditures",
    subtitle: "$2,450 this month",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "Analytics",
    subtitle: "+24% growth",
    gradient: "from-orange-500/20 to-amber-500/20",
  },
];

function WidgetCard({
  widget,
  index,
}: {
  widget: WidgetPreview;
  index: number;
}) {
  // Calculate orbital position based on index
  const angle = (index / widgets.length) * 360;
  const radius = 120;

  return (
    <motion.div
      className={`absolute left-1/2 top-1/2 -ml-24 -mt-12 w-48 rounded-xl border bg-card/60 p-4 shadow-lg backdrop-blur-xl bg-gradient-to-br ${widget.gradient}`}
      initial={{
        x: Math.cos((angle * Math.PI) / 180) * radius,
        y: Math.sin((angle * Math.PI) / 180) * radius,
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        x: [
          Math.cos((angle * Math.PI) / 180) * radius,
          Math.cos(((angle + 360) * Math.PI) / 180) * radius,
        ],
        y: [
          Math.sin((angle * Math.PI) / 180) * radius,
          Math.sin(((angle + 360) * Math.PI) / 180) * radius,
        ],
        rotateY: [0, 360],
        opacity: 1,
        scale: 1,
      }}
      transition={{
        x: {
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        },
        y: {
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        },
        rotateY: {
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        },
        opacity: {
          duration: 0.5,
          delay: index * 0.2,
        },
        scale: {
          duration: 0.5,
          delay: index * 0.2,
        },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: 1.1,
        zIndex: 10,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {widget.icon}
        </div>
        <div>
          <div className="font-medium text-foreground">{widget.title}</div>
          <div className="text-xs text-muted-foreground">{widget.subtitle}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingWidgets() {
  return (
    <div
      className="relative h-[400px] w-full"
      style={{ perspective: "1000px" }}
    >
      {/* Center glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="size-32 rounded-full bg-primary/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Orbital ring */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="size-64 rounded-full border border-primary/20"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating widgets */}
      {widgets.map((widget, index) => (
        <WidgetCard key={widget.title} widget={widget} index={index} />
      ))}
    </div>
  );
}
