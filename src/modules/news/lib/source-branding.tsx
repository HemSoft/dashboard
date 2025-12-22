import {
  Binary,
  Blocks,
  Brain,
  Code2,
  Globe,
  Mic,
  Newspaper,
  Radio,
  Rocket,
  Tv,
} from "lucide-react";
import type { ReactNode } from "react";

export interface SourceBrand {
  icon: ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const iconClass = "h-3.5 w-3.5";

/**
 * Branding configuration for each news source.
 * Each source has a unique icon and color scheme.
 */
export const sourceBranding: Record<string, SourceBrand> = {
  "Hacker News": {
    icon: <Rocket className={iconClass} />,
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-500/30",
  },
  AP: {
    icon: <Newspaper className={iconClass} />,
    bgColor: "bg-red-500/10",
    textColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-500/30",
  },
  "BBC Tech": {
    icon: <Tv className={iconClass} />,
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-500/30",
  },
  "NPR News": {
    icon: <Radio className={iconClass} />,
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30",
  },
  "NPR Tech": {
    icon: <Mic className={iconClass} />,
    bgColor: "bg-sky-500/10",
    textColor: "text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-500/30",
  },
  "DR Nyheder": {
    icon: <Globe className={iconClass} />,
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  "MIT Tech AI": {
    icon: <Brain className={iconClass} />,
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-500/30",
  },
  "VentureBeat AI": {
    icon: <Binary className={iconClass} />,
    bgColor: "bg-fuchsia-500/10",
    textColor: "text-fuchsia-600 dark:text-fuchsia-400",
    borderColor: "border-fuchsia-500/30",
  },
  "VS Code": {
    icon: <Code2 className={iconClass} />,
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-500/30",
  },
};

/**
 * Default branding for unknown sources.
 */
export const defaultBrand: SourceBrand = {
  icon: <Blocks className={iconClass} />,
  bgColor: "bg-gray-500/10",
  textColor: "text-gray-600 dark:text-gray-400",
  borderColor: "border-gray-500/30",
};

/**
 * Get branding for a source by name.
 */
export function getSourceBrand(sourceName: string): SourceBrand {
  return sourceBranding[sourceName] ?? defaultBrand;
}
