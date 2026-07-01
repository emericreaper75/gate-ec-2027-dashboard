import React, { useState } from 'react';
import { useStore } from '../store';
import { SUBJECTS } from '../store/initialData';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Badge } from '../components/ui';
import { Calendar as CalIcon, Plus } from 'lucide-react';
import { ProductivityHeatmap } from '../components/ProductivityHeatmap';

export function WeeklyReview() {
  const { weeklyReviews, addWeeklyReview, deleteWeeklyReview, pyqLogs, mocks, mastery } = useStore();
  const [view, setView] = useState<'history' | 'new'>('history');

  const [wentWell, setWentWell] = useState('');
  const [toFix, setToFix] = useState('');
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);

  const updatePriority = (idx: number, val: string) => {
    const newP = [...priorities];
    newP[idx] = val;
    setPriorities(newP);
  };

  const addPriorityField = () => setPriorities([...priorities, '']);

  // Auto-calculated fields for current week
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const weekStartStr = oneWeekAgo.toISOString().split('T')[0];
  
  const pyqsThisWeek = pyqLogs.filter(l => l.date >= weekStartStr);
  const pyqsSolved = pyqsThisWeek.length;
  const correctPyqs = pyqsThisWeek.filter(l => l.result === 'Correct ✅').length;
  const accuracy = pyqsSolved > 0 ? Math.round((correctPyqs / pyqsSolved) * 100) : 0;
  
  const mocksThisWeek = mocks.filter(m => m.date >= weekStartStr);
  const bestMockScore = mocksThisWeek.length > 0 ? Math.max(...mocksThisWeek.map(m => m.overallScore)) : 0;

  const topicsMastered = mastery.filter(m => m.mastery >= 75 && m.lastUpdated >= weekStartStr).map(m => m.topic);
  const subjectsCovered = Array.from(new Set(pyqsThisWeek.map(l => l.subject)));

  const handleSave = () => {
    addWeeklyReview({
      id: Date.now().toString(),
      weekRange: `${weekStartStr} to ${today.toISOString().split('T')[0]}`,
      subjectsCovered,
      pyqsSolved,
      accuracy,
      mocksTaken: mocksThisWeek.length,
      bestMockScore,
      topicsMastered,
      wentWell,
      toFix,
      priorities: priorities.filter(Boolean),
      formulaSheetsReviewed: [] // simplified
    });
    setWentWell(''); setToFix(''); setPriorities(['', '', '']);
    setView('history');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-mono text-text-primary">WEEKLY REVIEW</h1>
          <p className="text-text-secondary mt-1">Sunday Ritual & Reflection</p>
        </div>
        <Button variant={view === 'new' ? 'outline' : 'primary'} onClick={() => setView(view === 'new' ? 'history' : 'new')}>
          {view === 'new' ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Start Review</>}
        </Button>
      </div>

      {view === 'new' ? (
        <Card className="max-w-3xl mx-auto border-accent-primary/50">
          <CardHeader className="border-b border-border bg-bg-elevated">
            <CardTitle className="text-accent-primary flex items-center gap-2"><CalIcon className="w-5 h-5"/> New Review: {weekStartStr} to {today.toISOString().split('T')[0]}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-bg-elevated p-3 rounded border border-border text-center">
                <p className="text-xs text-text-secondary uppercase">PYQs Solved</p>
                <p className="text-2xl font-mono mt-1">{pyqsSolved}</p>
              </div>
              <div className="bg-bg-elevated p-3 rounded border border-border text-center">
                <p className="text-xs text-text-secondary uppercase">Accuracy</p>
                <p className="text-2xl font-mono mt-1 text-accent-success">{accuracy}%</p>
              </div>
              <div className="bg-bg-elevated p-3 rounded border border-border text-center">
                <p className="text-xs text-text-secondary uppercase">Mocks Taken</p>
                <p className="text-2xl font-mono mt-1">{mocksThisWeek.length}</p>
              </div>
              <div className="bg-bg-elevated p-3 rounded border border-border text-center">
                <p className="text-xs text-text-secondary uppercase">Best Mock</p>
                <p className="text-2xl font-mono mt-1 text-accent-primary">{bestMockScore}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase mb-2">Subjects Covered</h3>
              <div className="flex flex-wrap gap-2">
                {subjectsCovered.length > 0 ? subjectsCovered.map(s => <Badge key={s} variant="outline">{s}</Badge>) : <span className="text-sm text-text-muted">None</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-accent-success mb-1 block">What went well?</label>
                <Textarea value={wentWell} onChange={e => setWentWell(e.target.value)} className="min-h-[100px]" placeholder="Consistent PYQ target met..." />
              </div>
              <div>
                <label className="text-xs text-accent-danger mb-1 block">What to fix?</label>
                <Textarea value={toFix} onChange={e => setToFix(e.target.value)} className="min-h-[100px]" placeholder="Silly mistakes in maths..." />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-accent-warning uppercase">Carry-Forward Priorities</h3>
                <Button variant="outline" size="sm" onClick={addPriorityField} className="h-8 px-2 text-xs">
                  <Plus className="w-3 h-3 mr-1"/> Add Item
                </Button>
              </div>
              {priorities.map((p, i) => (
                <Input key={i} placeholder={`Priority ${i + 1}`} value={p} onChange={e => updatePriority(i, e.target.value)} />
              ))}
            </div>

            <Button onClick={handleSave} className="w-full text-lg h-12">Commit Review</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <ProductivityHeatmap />
          <div className="space-y-4">
            {weeklyReviews.length === 0 ? (
              <div className="text-center py-16 text-text-muted border border-dashed border-border rounded-xl">
                No weekly reviews logged yet. Check in this Sunday.
              </div>
            ) : (
            weeklyReviews.slice().reverse().map(wr => (
              <Card key={wr.id} className="hover:border-accent-primary/50 transition-colors">
                <CardHeader className="bg-bg-elevated border-b border-border py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalIcon className="w-4 h-4 text-accent-primary" /> {wr.weekRange}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm font-mono">
                      <span>PYQs: <strong className="text-text-primary">{wr.pyqsSolved}</strong></span>
                      <span>Acc: <strong className="text-accent-success">{wr.accuracy}%</strong></span>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this weekly review?")) {
                            deleteWeeklyReview(wr.id);
                          }
                        }}
                        className="p-1 ml-2 text-text-muted hover:text-accent-danger transition-colors"
                        title="Delete Review"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-accent-success uppercase mb-1">Went Well</h4>
                    <p className="text-sm text-text-secondary">{wr.wentWell || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-accent-danger uppercase mb-1">To Fix</h4>
                    <p className="text-sm text-text-secondary">{wr.toFix || '-'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-accent-warning uppercase mb-1">Priorities</h4>
                    <ul className="list-disc list-inside text-sm text-text-primary">
                      {wr.priorities.map((p, i) => <li key={i}>{p}</li>)}
                      {wr.priorities.length === 0 && '-'}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
}
