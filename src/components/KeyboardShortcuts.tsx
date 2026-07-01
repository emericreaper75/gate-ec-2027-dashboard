import React from "react";
import { Badge } from "./ui";

export function KeyboardShortcuts({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-lg shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-text-primary mb-4 border-b border-border pb-2">Keyboard Shortcuts</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Global Search</span>
            <Badge variant="outline" className="font-mono">Ctrl + K</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Learning Notes</span>
            <Badge variant="outline" className="font-mono">N</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Daily Checklist</span>
            <Badge variant="outline" className="font-mono">D</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">PYQ Log</span>
            <Badge variant="outline" className="font-mono">P</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Error Journal</span>
            <Badge variant="outline" className="font-mono">E</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Formula Sheets</span>
            <Badge variant="outline" className="font-mono">F</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Navigate Sections</span>
            <Badge variant="outline" className="font-mono">1 - 9</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Show this menu</span>
            <Badge variant="outline" className="font-mono">?</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
