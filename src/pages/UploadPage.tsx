import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePipeline } from "@/contexts/PipelineContext";
import Layout from "@/components/Layout";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import * as pdfjsLib from "pdfjs-dist";

// Set up the PDF.js worker so it can parse PDFs in the browser
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function UploadPage() {
  const [feFile, setFeFile] = useState<File | null>(null);
  const [beFile, setBeFile] = useState<File | null>(null);
  const [legalFile, setLegalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUploadData } = usePipeline();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!feFile || !beFile || !legalFile) {
      toast.error("Please upload all three files.");
      return;
    }

    setLoading(true);

    try {
      const [feData, beData, legalText] = await Promise.all([
        parseCSV(feFile),
        parseCSV(beFile),
        readFileAsText(legalFile),
      ]);

      setUploadData(feFile, beFile, legalFile, feData, beData, legalText);
      toast.success("Files uploaded and parsed successfully!");
      navigate("/cleaning");
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse files. Please check the format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Files</h1>
          <p className="text-muted-foreground mt-1">
            Upload your frontend CSV, backend CSV, and legal PDF to begin processing.
          </p>
        </div>

        <div className="space-y-4">
          <FileUploader
            label="Frontend CSV"
            accept=".csv"
            file={feFile}
            onFileSelect={setFeFile}
            onClear={() => setFeFile(null)}
          />
          <FileUploader
            label="Backend CSV"
            accept=".csv"
            file={beFile}
            onFileSelect={setBeFile}
            onClear={() => setBeFile(null)}
          />
          <FileUploader
            label="Legal Document (PDF/TXT)"
            accept=".pdf,.txt"
            file={legalFile}
            onFileSelect={setLegalFile}
            onClear={() => setLegalFile(null)}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!feFile || !beFile || !legalFile || loading}
          className="gradient-primary text-primary-foreground font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
            </>
          ) : (
            <>
              Upload & Continue <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </Layout>
  );
}

function parseCSV(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as Record<string, string>[]),
      error: reject,
    });
  });
}

// Updated to handle both PDF and plain text correctly
async function readFileAsText(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // Loop through each page to extract text
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw new Error("Failed to parse PDF document.");
    }
  } else {
    // For .txt files, keep using standard FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
