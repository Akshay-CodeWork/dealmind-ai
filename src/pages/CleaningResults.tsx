import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePipeline } from "@/contexts/PipelineContext";
import { cleanDataset } from "@/lib/cleaning-engine";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Loader2, Sparkles, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function CleaningResults() {
  const { frontendRaw, backendRaw, frontendCleaning, backendCleaning, setCleaningResults, uploadComplete } = usePipeline();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClean = () => {
    if (!frontendRaw || !backendRaw) {
      toast.error("No data to clean. Please upload files first.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const feResult = cleanDataset(frontendRaw);
      const beResult = cleanDataset(backendRaw);
      setCleaningResults(feResult, beResult);
      setLoading(false);
      toast.success("Data cleaned successfully!");
    }, 800);
  };

  if (!uploadComplete) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-accent" />
          <h2 className="text-xl font-semibold">Upload Required</h2>
          <p className="text-muted-foreground">Please upload files first.</p>
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
              <Sparkles className="w-7 h-7 text-primary" /> Cleaning Robot
            </h1>
            <p className="text-muted-foreground mt-1">Remove duplicates, inactive deals, and standardize fields</p>
          </div>
          {!frontendCleaning && (
            <Button onClick={handleClean} disabled={loading} className="gradient-primary text-primary-foreground font-semibold">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cleaning...</> : <>Run Cleaning <Sparkles className="w-4 h-4 ml-2" /></>}
            </Button>
          )}
          {frontendCleaning && (
            <Button onClick={() => navigate("/discrepancy")} className="gradient-primary text-primary-foreground font-semibold">
              Next: Discrepancy <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {frontendCleaning && backendCleaning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="FE Original" value={frontendCleaning.originalCount} icon={<Sparkles className="w-5 h-5 text-primary" />} />
              <StatCard title="FE Duplicates Removed" value={frontendCleaning.duplicatesRemoved} icon={<Trash2 className="w-5 h-5 text-destructive" />} variant="destructive" />
              <StatCard title="FE Inactive Removed" value={frontendCleaning.inactiveRemoved} icon={<Trash2 className="w-5 h-5 text-accent" />} variant="accent" />
              <StatCard title="FE Clean Records" value={frontendCleaning.cleanedData.length} icon={<Sparkles className="w-5 h-5 text-success" />} variant="success" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="BE Original" value={backendCleaning.originalCount} icon={<Sparkles className="w-5 h-5 text-primary" />} />
              <StatCard title="BE Duplicates Removed" value={backendCleaning.duplicatesRemoved} icon={<Trash2 className="w-5 h-5 text-destructive" />} variant="destructive" />
              <StatCard title="BE Inactive Removed" value={backendCleaning.inactiveRemoved} icon={<Trash2 className="w-5 h-5 text-accent" />} variant="accent" />
              <StatCard title="BE Clean Records" value={backendCleaning.cleanedData.length} icon={<Sparkles className="w-5 h-5 text-success" />} variant="success" />
            </div>

            {/* Preview table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Cleaned Frontend Data (Preview)</h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal ID</TableHead>
                      <TableHead>Borrower Name</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Maturity Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frontendCleaning.cleanedData.slice(0, 10).map((r) => (
                      <TableRow key={r.Deal_ID}>
                        <TableCell className="font-mono text-xs">{r.Deal_ID}</TableCell>
                        <TableCell>{r.Borrower_Name}</TableCell>
                        <TableCell>${r.Loan_Amount.toLocaleString()}</TableCell>
                        <TableCell>{r.Maturity_Date}</TableCell>
                        <TableCell><span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success">{r.Status}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
