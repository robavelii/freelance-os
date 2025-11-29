"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ExportCSVButtonProps {
  endpoint: "invoices" | "expenses" | "clients";
  label?: string;
}

export function ExportCSVButton({ endpoint, label = "Export CSV" }: ExportCSVButtonProps) {
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export/${endpoint}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `${endpoint}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Export completed");
    } catch {
      toast.error("Failed to export data");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
