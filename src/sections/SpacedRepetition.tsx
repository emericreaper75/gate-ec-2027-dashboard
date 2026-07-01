import React, { useState, useMemo } from 'react';
import { useStore, SRSData, Formula, ErrorLog, LearningNote, Mastery } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, cn } from '../components/ui';
import { BrainCircuit, Check, X, RotateCcw } from 'lucide-react';
import Markdown from 'react-markdown';

// SM-2 Algorithm
function computeNextSRS(srs: SRSData | undefined, quality: number): SRSData {
  let { interval, repetition, efactor } = srs || { interval: 0, repetition: 0, efactor: 2.5 };
  
  if (quality >= 3) {
    if (repetition === 0) {
      interval = 1; // 24 hours
    } else if (repetition === 1) {
      interval = 3; // 3 days
    } else if (repetition === 2) {
      interval = 7; // 7 days
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1; // reset to 24 hours
  }
  
  efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (efactor < 1.3) efactor = 1.3;
  
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const localNextDateStr = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  return {
    interval,
    repetition,
    efactor,
    nextReviewDate: localNextDateStr
  };
}

type ReviewItem = 
  | { type: 'formula', data: Formula }
  | { type: 'error', data: ErrorLog }
  | { type: 'note', data: LearningNote }
  | { type: 'topic', data: Mastery };

export function SpacedRepetition() {
  const store = useStore();
  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  const reviewQueue = useMemo(() => {
    const queue: ReviewItem[] = [];
    
    // Pull shaky formulas or formulas due for SRS review
    store.formulas.forEach(f => {
      if (f.confidence === 'Shaky' || (f.srs && f.srs.nextReviewDate <= todayStr)) {
        queue.push({ type: 'formula', data: f });
      }
    });
    
    store.errors.forEach(e => {
      if (!e.srs || e.srs.nextReviewDate <= todayStr) queue.push({ type: 'error', data: e });
    });
    store.notes.forEach(n => {
      if (!n.srs || n.srs.nextReviewDate <= todayStr) queue.push({ type: 'note', data: n });
    });
    store.mastery.forEach(m => {
      if (m.srs && m.srs.nextReviewDate <= todayStr) queue.push({ type: 'topic', data: m });
    });

    // Shuffle queue for varied review, but overdue first
    return queue.sort((a, b) => {
      const aDate = a.data.srs?.nextReviewDate || todayStr;
      const bDate = b.data.srs?.nextReviewDate || todayStr;
      if (aDate < todayStr && bDate >= todayStr) return -1;
      if (bDate < todayStr && aDate >= todayStr) return 1;
      return Math.random() - 0.5;
    });
  }, [store.formulas, store.errors, store.notes, store.mastery, todayStr]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (reviewQueue.length === 0 || currentIndex >= reviewQueue.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <BrainCircuit className="w-16 h-16 text-accent-success opacity-50" />
        <h2 className="text-2xl font-bold text-text-primary">You're all caught up!</h2>
        <p className="text-text-secondary">No items due for review today. Great job.</p>
      </div>
    );
  }

  const currentItem = reviewQueue[currentIndex];

  const handleRate = (quality: number) => {
    const nextSrs = computeNextSRS(currentItem.data.srs, quality);
    
    if (currentItem.type === 'formula') {
      const newConfidence = quality >= 4 ? 'Confident' : quality === 3 ? 'Learning' : 'Shaky';
      store.updateFormula(currentItem.data.id, { srs: nextSrs, confidence: newConfidence, lastReviewed: todayStr });
    } else if (currentItem.type === 'error') {
      store.updateErrorLog(currentItem.data.id, { srs: nextSrs });
    } else if (currentItem.type === 'note') {
      store.updateNote(currentItem.data.id, { srs: nextSrs });
    } else if (currentItem.type === 'topic') {
      const newMastery = quality >= 4 ? 100 : quality === 3 ? 80 : 50;
      store.updateMastery(currentItem.data.id, { srs: nextSrs, mastery: newMastery, lastUpdated: todayStr });
    }

    setShowAnswer(false);
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-accent-primary" />
            Spaced Repetition
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Reviewing item {currentIndex + 1} of {reviewQueue.length}
          </p>
        </div>
        <div className="bg-bg-elevated px-4 py-2 rounded-full border border-border font-mono text-sm">
          <span className="text-accent-primary">{reviewQueue.length - currentIndex}</span> remaining
        </div>
      </div>

      <Card className="min-h-[400px] flex flex-col">
        <CardHeader className="border-b border-border/50">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className={cn("uppercase text-[10px]", currentItem.data.srs && currentItem.data.srs.nextReviewDate < todayStr ? "bg-accent-danger/20 border-accent-danger text-accent-danger animate-pulse" : "")}>
              {currentItem.type} {currentItem.data.srs && currentItem.data.srs.nextReviewDate < todayStr && "- OVERDUE"}
            </Badge>
            <span className="text-xs text-text-muted font-mono">
              {currentItem.data.subject}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center p-8 space-y-8">
          
          {/* Front of Card */}
          <div className="text-center space-y-4">
            {currentItem.type === 'formula' && (
              <>
                <h3 className="text-sm text-text-secondary uppercase tracking-widest">Formula Name</h3>
                <p className="text-2xl font-bold text-text-primary">{currentItem.data.name}</p>
              </>
            )}
            {currentItem.type === 'error' && (
              <>
                <h3 className="text-sm text-text-secondary uppercase tracking-widest">Error Log</h3>
                <p className="text-xl font-medium text-text-primary">"{(currentItem.data as ErrorLog).thought}"</p>
                <p className="text-sm text-accent-danger mt-2">What is the correct approach?</p>
              </>
            )}
            {currentItem.type === 'note' && (
              <>
                <h3 className="text-sm text-text-secondary uppercase tracking-widest">Learning Note</h3>
                <p className="text-2xl font-bold text-text-primary">{currentItem.data.title}</p>
              </>
            )}
            {currentItem.type === 'topic' && (
              <>
                <h3 className="text-sm text-text-secondary uppercase tracking-widest">Topic Mastery</h3>
                <p className="text-2xl font-bold text-text-primary">{(currentItem.data as any).topic}</p>
                <p className="text-sm text-text-muted mt-2">Mentally recall the key concepts and formulas for this topic.</p>
              </>
            )}
          </div>

          {/* Back of Card (Answer) */}
          {showAnswer ? (
            <div className="border-t border-border pt-8 mt-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="prose prose-invert max-w-none text-center">
                {currentItem.type === 'formula' && (
                  <div className="text-xl font-mono bg-bg-elevated p-4 rounded-md inline-block">
                    {currentItem.data.content}
                  </div>
                )}
                {currentItem.type === 'error' && (
                  <div className="space-y-4 text-left bg-bg-elevated p-6 rounded-md">
                    <div>
                      <span className="text-xs text-accent-success uppercase font-bold block mb-1">Correct Answer</span>
                      <p className="text-text-primary">{(currentItem.data as ErrorLog).correctAnswer}</p>
                    </div>
                    <div>
                      <span className="text-xs text-accent-warning uppercase font-bold block mb-1">Rule Violated</span>
                      <p className="text-text-primary">{(currentItem.data as ErrorLog).ruleViolated}</p>
                    </div>
                  </div>
                )}
                {currentItem.type === 'note' && (
                  <div className="text-left bg-bg-elevated p-6 rounded-md markdown-body text-sm max-h-64 overflow-y-auto">
                    <Markdown>{currentItem.data.content}</Markdown>
                  </div>
                )}
                {currentItem.type === 'topic' && (
                  <div className="text-center bg-bg-elevated p-6 rounded-md text-sm">
                    <p className="text-text-primary">How well did you recall this topic? Rate your confidence honestly to update your mastery score.</p>
                  </div>
                )}
              </div>

              {/* Rating Buttons */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                <Button variant="danger" className="flex flex-col py-6 h-auto" onClick={() => handleRate(0)}>
                  <span className="font-bold mb-1">Again</span>
                  <span className="text-[10px] opacity-70">&lt; 1m</span>
                </Button>
                <Button variant="outline" className="flex flex-col py-6 h-auto" onClick={() => handleRate(3)}>
                  <span className="font-bold mb-1 text-text-primary">Hard</span>
                  <span className="text-[10px] text-text-muted">~2d</span>
                </Button>
                <Button variant="primary" className="flex flex-col py-6 h-auto bg-accent-success hover:bg-accent-success/90 text-white" onClick={() => handleRate(4)}>
                  <span className="font-bold mb-1">Good</span>
                  <span className="text-[10px] opacity-70">~5d</span>
                </Button>
                <Button variant="outline" className="flex flex-col py-6 h-auto border-accent-success text-accent-success hover:bg-accent-success/10" onClick={() => handleRate(5)}>
                  <span className="font-bold mb-1">Easy</span>
                  <span className="text-[10px] opacity-70">~8d</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-8">
              <Button size="lg" className="px-12" onClick={() => setShowAnswer(true)}>
                Show Answer
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
