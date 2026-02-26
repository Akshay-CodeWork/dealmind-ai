import { useCallback, useState } from "react";
import { Upload, FileCheck, X } from "lucide-react";

interface FileUploaderProps {
  label: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export default function FileUploader({ label, accept, file, onFileSelect, onClear }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) onFileSelect(f);
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
        ${dragOver ? "border-primary bg-primary/5" : file ? "border-success/50 bg-success/5" : "border-border hover:border-muted-foreground/40"}
      `}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileCheck className="w-5 h-5 text-success" />
          <span className="text-sm font-medium">{file.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
        </div>
      )}
    </div>
  );
}
