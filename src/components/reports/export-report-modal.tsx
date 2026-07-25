"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { getMonthDisplayName } from "@/lib/utils";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportReportModal({ isOpen, onClose }: ExportReportModalProps) {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // Generate options for past 12 months
  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      value: val,
      label: getMonthDisplayName(val),
    };
  });

  const handleExportCsv = () => {
    window.open(`/api/export/csv?month=${selectedMonth}`, "_blank");
    onClose();
  };

  const handleExportPdf = () => {
    window.open(`/api/export/pdf?month=${selectedMonth}`, "_blank");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Financial Report" size="sm">
      <div className="space-y-5">
        <p className="text-sm text-hive-500 font-medium">
          Select the month you want to export report data for:
        </p>

        <Select
          label="Select Month"
          options={monthOptions}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-2 border-emerald-300 hover:bg-emerald-50 text-emerald-800"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            CSV Spreadsheet
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleExportPdf}
            className="flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Print PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
