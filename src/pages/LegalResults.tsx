import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePipeline } from "@/contexts/PipelineContext";
import { extractLegalFields } from "@/lib/legal-engine";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, FileText, AlertTriangle, User, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LegalResults() {
  const { legalText, legalExtraction, setLegalResult, uploadComplete } = usePipeline();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleExtract = () => {
    if (!legalText) return;
    setLoading(true);
    setTimeout(() => {
      const result = extractLegalFields(legalText);
      setLegalResult(result);
      setLoading(false);
      toast.success("Legal attributes extracted!");
    }, 1000);
  };

  if (!uploadComplete) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-accent" />
          <h2 className="text-xl font-semibold">Upload Required</h2>
          <p className="text-muted-foreground">Please upload a legal document first.</p>
          <Button onClick={() => navigate("/upload")} variant="outline">Go to Upload</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-7 h-7 text-primary" /> AI Lawyer
            </h1>
            <p className="text-muted-foreground mt-1">Extract structured attributes from legal documents</p>
          </div>
          {!legalExtraction && (
            <Button onClick={handleExtract} disabled={loading} className="gradient-primary text-primary-foreground font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting...</> : <>Run Extraction <FileText className="w-4 h-4 ml-2" /></>}
            </Button>
          )}
          {legalExtraction && (
            <Button onClick={() => navigate("/summary")} className="gradient-primary text-primary-foreground font-semibold">
              View Summary <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {legalExtraction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Borrower Name", value: legalExtraction.borrower_name, icon: <User className="w-5 h-5 text-primary" /> },
                { label: "Loan Amount", value: legalExtraction.loan_amount ? `$${legalExtraction.loan_amount.toLocaleString()}` : "Not Found", icon: <DollarSign className="w-5 h-5 text-success" /> },
                { label: "Maturity Date", value: legalExtraction.maturity_date, icon: <Calendar className="w-5 h-5 text-accent" /> },
                { label: "Agreement Date", value: legalExtraction.agreement_date, icon: <Calendar className="w-5 h-5 text-primary" /> },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                  </div>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>

            {legalExtraction.raw_text && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-3">Document Preview</h3>
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed bg-secondary p-4 rounded-lg">
                  {legalExtraction.raw_text}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
