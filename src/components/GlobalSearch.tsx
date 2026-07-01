import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { Search } from "lucide-react";
import { Input, Badge } from "./ui";

export function GlobalSearch({ isOpen, onClose, setActiveSection }: { isOpen: boolean, onClose: () => void, setActiveSection: (s: string) => void }) {
  const [query, setQuery] = useState("");
  const store = useStore();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase();
  
  const formulaResults = store.formulas.filter(f => f.name.toLowerCase().includes(q) || f.content.toLowerCase().includes(q));
  const pyqResults = store.pyqLogs.filter(p => p.subject.toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q) || p.topic.toLowerCase().includes(q));
  const errorResults = store.errors.filter(e => e.topic.toLowerCase().includes(q) || e.correctAnswer.toLowerCase().includes(q) || e.thought.toLowerCase().includes(q) || e.ruleViolated.toLowerCase().includes(q));
  const noteResults = (store.notes || []).filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.topic.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center border-b border-border p-4 bg-bg-elevated">
          <Search className="w-5 h-5 text-text-muted mr-3" />
          <input 
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-text-primary text-lg font-mono placeholder:text-text-muted"
            placeholder="Search notes, formulas, PYQs, errors..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Badge variant="outline">ESC</Badge>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length < 2 ? (
            <p className="text-center text-text-muted py-8 text-sm">Type to start searching...</p>
          ) : (
            <>
              {noteResults.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-bold text-text-secondary uppercase mb-2 px-2">Learning Notes</h3>
                  {noteResults.map(n => (
                    <div key={n.id} className="p-2 hover:bg-bg-elevated rounded cursor-pointer" onClick={() => { setActiveSection('learning-notes'); onClose(); }}>
                      <p className="text-sm font-medium text-text-primary">{n.title}</p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {formulaResults.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-bold text-text-secondary uppercase mb-2 px-2">Formulas</h3>
                  {formulaResults.map(f => (
                    <div key={f.id} className="p-2 hover:bg-bg-elevated rounded cursor-pointer" onClick={() => { setActiveSection('formula-sheets'); onClose(); }}>
                      <p className="text-sm font-medium text-text-primary">{f.name}</p>
                      <p className="text-xs text-text-muted mt-1">{f.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {pyqResults.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-bold text-text-secondary uppercase mb-2 px-2">PYQs</h3>
                  {pyqResults.map(p => (
                    <div key={p.id} className="p-2 hover:bg-bg-elevated rounded cursor-pointer" onClick={() => { setActiveSection('pyq-log'); onClose(); }}>
                      <p className="text-sm font-medium text-text-primary">{p.subject} - {p.topic}</p>
                      <p className="text-xs text-text-muted mt-1">{p.notes || "No notes"}</p>
                    </div>
                  ))}
                </div>
              )}
              {errorResults.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-bold text-text-secondary uppercase mb-2 px-2">Error Journal</h3>
                  {errorResults.map(e => (
                    <div key={e.id} className="p-2 hover:bg-bg-elevated rounded cursor-pointer" onClick={() => { setActiveSection('error-journal'); onClose(); }}>
                      <p className="text-sm font-medium text-text-primary">{e.topic}</p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">{e.correctAnswer}</p>
                    </div>
                  ))}
                </div>
              )}
              {formulaResults.length === 0 && pyqResults.length === 0 && errorResults.length === 0 && noteResults.length === 0 && (
                <p className="text-center text-text-muted py-8 text-sm">No results found for "{query}"</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
