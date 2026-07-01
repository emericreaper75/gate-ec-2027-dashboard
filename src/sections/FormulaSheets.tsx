import React, { useState } from 'react';
import { useStore, Formula } from '../store';
import { SUBJECTS } from '../store/initialData';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge, cn, Textarea } from '../components/ui';
import { Layers, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import remarkGfm from 'remark-gfm';

export function FormulaSheets() {
  const { formulas, addFormula, updateFormula, deleteFormula, triggerPersistenceSync } = useStore();
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);
  const [reviewMode, setReviewMode] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  
  // Add formula state
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  const subjectFormulas = formulas.filter(f => f.subject === activeSubject);
  
  // Review queue: all shaky + learning + haven't been reviewed in a while.
  // For simplicity, just Shaky and Learning.
  const reviewQueue = subjectFormulas.filter(f => f.confidence !== 'Confident');

  const handleAdd = () => {
    if (!newName.trim() || !newContent.trim()) return;
    addFormula({
      id: Date.now().toString(),
      name: newName,
      content: newContent,
      subject: activeSubject,
      topic: 'General',
      confidence: 'Learning',
      lastReviewed: new Date().toISOString().split('T')[0]
    });
    setNewName('');
    setNewContent('');
    setShowAdd(false);
  };

  const markConfidence = (id: string, conf: Formula['confidence']) => {
    updateFormula(id, { 
      confidence: conf, 
      lastReviewed: new Date().toISOString().split('T')[0] 
    });
  };

  const toggleReveal = (id: string) => setRevealed(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-mono text-text-primary">COMBAT FORMULA SHEETS</h1>
          <p className="text-text-secondary mt-1">High-speed recall & pattern recognition</p>
        </div>
        <div className="flex gap-2">
          <Button variant={reviewMode ? "primary" : "outline"} onClick={() => setReviewMode(!reviewMode)} className="gap-2">
            <Layers className="w-4 h-4" /> {reviewMode ? 'Exit Review' : 'Start Review'}
          </Button>
          <Button variant="outline" onClick={() => setShowAdd(!showAdd)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Formula
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {SUBJECTS.map(s => {
          const shakyCount = formulas.filter(f => f.subject === s && f.confidence === 'Shaky').length;
          return (
            <button
              key={s}
              onClick={() => { setActiveSubject(s); setReviewMode(false); }}
              className={cn(
                "px-4 py-2 whitespace-nowrap text-sm font-medium transition-colors border-b-2",
                activeSubject === s 
                  ? "border-accent-primary text-accent-primary bg-accent-primary/5" 
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              )}
            >
              {s} {shakyCount > 0 && <span className="ml-1 text-[10px] bg-accent-danger text-white px-1.5 py-0.5 rounded-full">{shakyCount}</span>}
            </button>
          );
        })}
      </div>

      {showAdd && (
        <Card className="animate-in fade-in slide-in-from-top-4">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div className="md:col-span-1">
              <label className="text-xs text-text-secondary mb-1 block">Formula Name</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Carson's Rule" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-text-secondary mb-1 block">Content (Formula)</label>
              <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="e.g. $$ BW = 2(\Delta f + f_m) $$" className="font-mono text-accent-primary min-h-[40px] resize-y" />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button onClick={handleAdd} className="w-full">Save to Arsenal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-none">
        {reviewMode ? (
          <div className="space-y-6 max-w-2xl mx-auto py-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-mono text-text-primary">REVIEW QUEUE: {reviewQueue.length} CARDS</h2>
              <p className="text-text-secondary text-sm">Recall the formula before revealing.</p>
            </div>
            {reviewQueue.length === 0 ? (
              <div className="text-center text-text-muted py-12 border border-border rounded-xl border-dashed">
                Queue empty for {activeSubject}. You are combat ready.
              </div>
            ) : (
              reviewQueue.map(f => (
                <Card key={f.id} className="border-accent-primary/20">
                  <CardContent className="p-8 text-center flex flex-col items-center">
                    <p className="text-sm text-text-secondary uppercase tracking-widest mb-4">{f.topic}</p>
                    <h3 className="text-2xl font-bold text-text-primary mb-8">{f.name}</h3>
                    
                    {revealed[f.id] ? (
                      <div className="w-full animate-in zoom-in-95 duration-200">
                        <div className="bg-bg-elevated p-6 rounded-lg mb-8 font-mono text-xl text-accent-primary border border-border prose prose-invert prose-p:text-accent-primary prose-headings:text-text-primary max-w-none markdown-body">
                          <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{f.content}</Markdown>
                        </div>
                        <div className="flex gap-4 justify-center w-full">
                          <Button variant="danger" onClick={() => { markConfidence(f.id, 'Shaky'); toggleReveal(f.id); }} className="flex-1">Shaky</Button>
                          <Button variant="warning" onClick={() => { markConfidence(f.id, 'Learning'); toggleReveal(f.id); }} className="flex-1">Learning</Button>
                          <Button variant="success" onClick={() => { markConfidence(f.id, 'Confident'); toggleReveal(f.id); }} className="flex-1">Confident</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="lg" onClick={() => toggleReveal(f.id)} className="w-full max-w-xs gap-2 border-accent-primary/50 text-accent-primary hover:bg-accent-primary/10">
                        <Eye className="w-5 h-5" /> Reveal Formula
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectFormulas.map(f => (
              <div key={f.id} className="bg-bg-card border border-border rounded-[10px] p-5 flex flex-col group hover:border-text-muted transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <Badge 
                    variant={f.confidence === 'Confident' ? 'success' : f.confidence === 'Shaky' ? 'danger' : 'warning'}
                    className="text-[10px]"
                  >
                    {f.confidence}
                  </Badge>
                  <span className="text-[10px] font-mono text-text-muted">Last: {f.lastReviewed || 'Never'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this formula?")) {
                        triggerPersistenceSync();
                        deleteFormula(f.id);
                      }
                    }}
                    className="p-1 text-text-muted hover:text-accent-danger transition-colors opacity-0 group-hover:opacity-100 ml-2"
                    title="Delete Formula"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <h4 className="text-sm font-bold text-text-primary mb-3">{f.name}</h4>
                <div className="bg-bg-elevated rounded-md p-3 font-mono text-sm text-accent-primary flex-1 flex items-center justify-center text-center border border-transparent group-hover:border-border transition-colors prose prose-invert prose-p:text-accent-primary prose-headings:text-text-primary max-w-none markdown-body overflow-x-auto">
                  <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{f.content}</Markdown>
                </div>
              </div>
            ))}
            {subjectFormulas.length === 0 && (
              <div className="col-span-full py-12 text-center text-text-muted border border-dashed border-border rounded-xl">
                No formulas logged for {activeSubject} yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
