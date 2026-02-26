import { useNavigate } from "react-router-dom";
import { usePipeline } from "@/contexts/PipelineContext";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Search, FileText, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { uploadComplete, cleaningComplete, discrepancyComplete, legalComplete } = usePipeline();
  const navigate = useNavigate();

  const steps = [
    { label: "Upload Files", done: uploadComplete, path: "/upload", icon: Upload },
    { label: "Clean Data", done: cleaningComplete, path: "/cleaning", icon: Sparkles },
    { label: "Detect Discrepancies", done: discrepancyComplete, path: "/discrepancy", icon: Search },
    { label: "Extract Legal", done: legalComplete, path: "/legal", icon: FileText },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-gradient-primary">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Review your deal processing pipeline</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pipeline Progress"
            value={`${completedCount}/4`}
            icon={<Sparkles className="w-5 h-5 text-primary" />}
            variant="primary"
          />
          <StatCard
            title="Upload"
            value={uploadComplete ? "Complete" : "Pending"}
            icon={<Upload className="w-5 h-5 text-accent" />}
            variant={uploadComplete ? "success" : "default"}
          />
          <StatCard
            title="Cleaning"
            value={cleaningComplete ? "Complete" : "Pending"}
            icon={<Sparkles className="w-5 h-5 text-accent" />}
            variant={cleaningComplete ? "success" : "default"}
          />
          <StatCard
            title="Discrepancy"
            value={discrepancyComplete ? "Complete" : "Pending"}
            icon={<Search className="w-5 h-5 text-accent" />}
            variant={discrepancyComplete ? "success" : "default"}
          />
        </div>

        {/* Pipeline steps */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Processing Pipeline</h2>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 group"
              >
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <span className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(step.path)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Go <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {!uploadComplete && (
          <Button
            onClick={() => navigate("/upload")}
            className="gradient-primary text-primary-foreground font-semibold"
            size="lg"
          >
            Start Processing <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Layout>
  );
}
