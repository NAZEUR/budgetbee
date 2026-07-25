"use client";

import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export function DynamicIcon({
  name,
  className,
  size = 20,
  color,
}: DynamicIconProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideIcons.LucideProps>>)[name];

  if (!Icon) {
    return <LucideIcons.HelpCircle className={cn("text-hive-300", className)} size={size} />;
  }

  return <Icon className={className} size={size} color={color} />;
}
