import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePipeline } from "@/contexts/PipelineContext";
import { detectDiscrepancies } from "@/lib/discrepancy-engine";
import { generateExplanation } from "@/lib/legal-engine";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import ExplanationModal from "@/components/ExplanationModal";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Loader2, Search, AlertTriangle, Brain } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DiscrepancyResults() {
  const { frontendCleaning, backendCleaning, discrepancy, setDiscrepancyResult, cleaningComplete } = usePipeline();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [explanation, setExplanation] = useState({ dealId: "", text: "" });
  const navigate = useNavigate();

  const handleDetect = () => {
    if (!frontendCleaning || !backendCleaning) return;
    setLoading(true);
    setTimeout(() => {
      const result = detectDiscrepancies(frontendCleaning.cleanedData, backendCleaning.cleanedData);
      setDiscrepancyResult(result);
      setLoading(false);
      toast.success(`Found ${result.totalMismatches} mismatches out of ${result.totalRecordsCompared} records.`);
    }, 600);
  };

  const handleExplain = (d: (typeof discrepancy)["discrepancies"][0]) => {
    const text = generateExplanation(
      d.Deal_ID,
      { loan_amount: d.FE_Loan_Amount, borrower_name: d.FE_Borrower_Name, maturity_date: d.FE_Maturity_Date },
      { loan_amount: d.BE_Loan_Amount, borrower_name: d.BE_Borrower_Name, maturity_date: d.BE_Maturity_Date }
    );
    setExplanation({ dealId: d.Deal_ID, text });
    setModalOpen(true);
  };

  if (!cleaningComplete) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-accent" />
          <h2 className="text-xl font-semibold">Cleaning Required</h2>
          <p className="text-muted-foreground">Please run cleaning first.</p>
          <Button onClick={() => navigate("/cleaning")} variant="outline">Go to Cleaning</Button>
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
              <Search className="w-7 h-7 text-primary" /> Lie Detector
            </h1>
            <p className="text-muted-foreground mt-1">Compare frontend and backend records for discrepancies</p>
          </div>
          {!discrepancy && (
            <Button onClick={handleDetect} disabled={loading} className="gradient-primary text-primary-foreground font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting...</> : <>Run Detection <Search className="w-4 h-4 ml-2" /></>}
            </Button>
          )}
          {discrepancy && (
            <Button onClick={() => navigate("/legal")} className="gradient-primary text-primary-foreground font-semibold">
              Next: Legal <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {discrepancy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Records Compared" value={discrepancy.totalRecordsCompared} icon={<Search className="w-5 h-5 text-primary" />} variant="primary" />
              <StatCard title="Mismatches Found" value={discrepancy.totalMismatches} icon={<AlertTriangle className="w-5 h-5 text-destructive" />} variant="destructive" />
              <StatCard title="Match Rate" value={`${(((discrepancy.totalRecordsCompared - discrepancy.totalMismatches) / discrepancy.totalRecordsCompared) * 100 || 0).toFixed(1)}%`} icon={<Search className="w-5 h-5 text-success" />} variant="success" />
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Discrepancy Report</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal ID</TableHead>
                      <TableHead>Loan</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discrepancy.discrepancies.filter(d => d.Loan_Mismatch || d.Name_Mismatch || d.Date_Mismatch).slice(0, 20).map((d) => (
                      <TableRow key={d.Deal_ID}>
                        <TableCell className="font-mono text-xs">{d.Deal_ID}</TableCell>
                        <TableCell>
                          {d.Loan_Mismatch ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Mismatch</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">Match</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {d.Name_Mismatch ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Mismatch</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">Match</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {d.Date_Mismatch ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Mismatch</span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">Match</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleExplain(d)}>
                            <Brain className="w-3.5 h-3.5 mr-1" /> Explain
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ExplanationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dealId={explanation.dealId}
        explanation={explanation.text}
      />
    </Layout>
  );
}
