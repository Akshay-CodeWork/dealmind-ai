import { useNavigate } from "react-router-dom";
import { usePipeline } from "@/contexts/PipelineContext";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Sparkles, Search, FileText, BarChart3, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function Summary() {
  const pipeline = usePipeline();
  const navigate = useNavigate();

  const status = (done: boolean) =>
    done ? (
      <span className="flex items-center gap-1.5 text-success text-sm"><CheckCircle2 className="w-4 h-4" /> Complete</span>
    ) : (
      <span className="flex items-center gap-1.5 text-muted-foreground text-sm"><XCircle className="w-4 h-4" /> Pending</span>
    );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary" /> Pipeline Summary
            </h1>
            <p className="text-muted-foreground mt-1">Overview of your deal review pipeline</p>
          </div>
          <Button
            variant="outline"
            onClick={() => { pipeline.reset(); navigate("/upload"); }}
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Start Over
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Records Cleaned (FE)"
            value={pipeline.frontendCleaning?.cleanedData.length ?? "—"}
            icon={<Sparkles className="w-5 h-5 text-primary" />}
            variant="primary"
          />
          <StatCard
            title="Records Cleaned (BE)"
            value={pipeline.backendCleaning?.cleanedData.length ?? "—"}
            icon={<Sparkles className="w-5 h-5 text-primary" />}
            variant="primary"
          />
          <StatCard
            title="Mismatches"
            value={pipeline.discrepancy?.totalMismatches ?? "—"}
            icon={<Search className="w-5 h-5 text-destructive" />}
            variant={pipeline.discrepancy?.totalMismatches ? "destructive" : "default"}
          />
          <StatCard
            title="Legal Fields"
            value={pipeline.legalComplete ? "Extracted" : "—"}
            icon={<FileText className="w-5 h-5 text-success" />}
            variant={pipeline.legalComplete ? "success" : "default"}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">Module Status</h2>
          <div className="divide-y divide-border">
            {[
              { label: "File Upload", done: pipeline.uploadComplete },
              { label: "Cleaning Robot", done: pipeline.cleaningComplete },
              { label: "Lie Detector", done: pipeline.discrepancyComplete },
              { label: "AI Lawyer", done: pipeline.legalComplete },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between py-3">
                <span className="font-medium text-sm">{m.label}</span>
                {status(m.done)}
              </div>
            ))}
          </div>
        </motion.div>

        {pipeline.legalExtraction && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Legal Extraction Results</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(pipeline.legalExtraction)
                .filter(([k]) => k !== "raw_text")
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="font-semibold mt-1">
                      {typeof value === "number" ? `$${value.toLocaleString()}` : String(value)}
                    </p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
