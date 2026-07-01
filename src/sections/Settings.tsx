import React, { useRef } from "react";
import { useStore } from "../store";
import { Card, CardContent, CardHeader, CardTitle, Button } from "../components/ui";
import { Trash2, HardDrive, Download, Upload } from "lucide-react";
import { del, get, set } from 'idb-keyval';
import { toast } from 'sonner';

export function Settings() {
  const store = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      if (window.electronAPI) {
        await window.electronAPI.storeDelete("gate_store");
      } else {
        await del("gate_store");
      }
      window.location.reload();
    }
  };

  const handleExportData = async () => {
    try {
      let data;
      if (window.electronAPI) {
        data = await window.electronAPI.storeGet("gate_store");
      } else {
        data = await get("gate_store");
      }
      
      if (!data) {
        toast.error("No data found to export.");
        return;
      }
      
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gate_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      store.updateSettings({ lastBackupTime: Date.now(), activeUsageSinceLastBackup: 0 });
      toast.success("Data exported successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export data.");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        // Verify it's valid JSON
        JSON.parse(content);
        
        if (confirm("Importing data will overwrite your current progress. Do you want to proceed?")) {
          if (window.electronAPI) {
            await window.electronAPI.storeSet("gate_store", content);
          } else {
            await set("gate_store", content);
          }
          toast.success("Data imported successfully! Reloading...");
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (e) {
        console.error(e);
        toast.error("Invalid backup file. Import failed.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Card className="border-accent-primary/20 bg-accent-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-primary">
            <HardDrive className="w-5 h-5" />
            Local Machine Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary leading-relaxed">
            <strong>Privacy First:</strong> Your GATE Tracker data is stored strictly on your local machine using an offline-first {window.electronAPI ? "SQLite database" : "IndexedDB database"}. 
            No data is ever sent to a remote server. {window.electronAPI ? "You are running the native desktop app. Data is persisted to your file system." : "You can install this application as a PWA and use it completely offline."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border bg-bg-elevated rounded-md gap-4">
            <div>
              <h3 className="font-bold text-text-primary">Export Data</h3>
              <p className="text-sm text-text-secondary">Download a JSON backup of all your progress, notes, and formulas.</p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto shrink-0 gap-2" onClick={handleExportData}>
              <Download className="w-4 h-4" /> Export Backup
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border bg-bg-elevated rounded-md gap-4">
            <div>
              <h3 className="font-bold text-text-primary">Import Data</h3>
              <p className="text-sm text-text-secondary">Restore your progress from a previous JSON backup file.</p>
            </div>
            <div>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImportData}
              />
              <Button variant="outline" className="w-full sm:w-auto shrink-0 gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" /> Import Backup
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-accent-danger/20 bg-accent-danger/5 rounded-md mt-8 gap-4">
            <div>
              <h3 className="font-bold text-accent-danger">Danger Zone</h3>
              <p className="text-sm text-text-secondary">Permanently delete all local data.</p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto shrink-0 border-accent-danger text-accent-danger hover:bg-accent-danger/10 gap-2" onClick={handleClear}>
              <Trash2 className="w-4 h-4" /> Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
