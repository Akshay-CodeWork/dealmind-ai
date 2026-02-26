import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: "default" | "primary" | "success" | "accent" | "destructive";
}

const variantStyles = {
  default: "border-border",
  primary: "border-primary/30 glow-primary",
  success: "border-success/30",
  accent: "border-accent/30",
  destructive: "border-destructive/30",
};

const iconBg = {
  default: "bg-secondary",
  primary: "gradient-primary",
  success: "bg-success/15",
  accent: "gradient-accent",
  destructive: "bg-destructive/15",
};

export default function StatCard({ title, value, icon, variant = "default" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-card p-5 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg[variant]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
