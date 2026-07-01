import React, { useState } from 'react';
import { useStore, ErrorLog } from '../store';
import { SUBJECTS, INITIAL_MASTERY } from '../store/initialData';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge, Textarea, cn } from '../components/ui';
import { Plus, RotateCcw, Target, AlertOctagon, Trash2 } from 'lucide-react';

export function ErrorJournal() {
  const { errors, addErrorLog, updateErrorLog, deleteErrorLog } = useStore();
  const [view, setView] = useState<'all' | 'pending' | 'add' | 'weekly'>('pending');

  // Form
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [thought, setThought] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [ruleViolated, setRuleViolated] = useState('');
  const [errorType, setErrorType] = useState('Concept Gap');

  const topics = INITIAL_MASTERY.filter(m => m.subject === subject).map(m => m.topic);

  const handleAdd = () => {
    if (!source || !thought || !correctAnswer || !ruleViolated) return;
    addErrorLog({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      subject,
      topic: topic || topics[0] || 'General',
      source,
      thought,
      correctAnswer,
      ruleViolated,
      errorType,
      status: 'Pending'
    });
    setSource(''); setThought(''); setCorrectAnswer(''); setRuleViolated('');
    setView('pending');
  };

  const pendingErrors = errors.filter(e => e.status === 'Pending').sort((a, b) => a.date.localeCompare(b.date));
  const allErrors = errors.slice().sort((a, b) => b.date.localeCompare(a.date));

  const displayedErrors = view === 'pending' ? pendingErrors : allErrors;

  // Weekly Summary Data
  const getWeeklySummary = () => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const weeklyErrors = errors.filter(e => new Date(e.date) >= lastWeek);
    
    const typeCount: Record<string, number> = {};
    const subjectCount: Record<string, number> = {};
    
    weeklyErrors.forEach(e => {
      typeCount[e.errorType] = (typeCount[e.errorType] || 0) + 1;
      subjectCount[e.subject] = (subjectCount[e.subject] || 0) + 1;
    });

    return { total: weeklyErrors.length, typeCount, subjectCount, errors: weeklyErrors };
  };

  const summary = getWeeklySummary();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-mono text-text-primary">ERROR JOURNAL</h1>
          <p className="text-text-secondary mt-1">Clinical autopsy of every mistake.</p>
        </div>
        <div className="flex gap-2 bg-bg-elevated p-1 rounded-lg border border-border">
          <Button variant={view === 'pending' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('pending')}>
            Pending ({pendingErrors.length})
          </Button>
          <Button variant={view === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('all')}>
            All Logs ({errors.length})
          </Button>
          <Button variant={view === 'weekly' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('weekly')}>
            Weekly Summary
          </Button>
          <Button variant={view === 'add' ? 'primary' : 'ghost'} size="sm" onClick={() => setView('add')}>
            <Plus className="w-4 h-4 mr-1" /> Log Error
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-none pb-8">
        {view === 'weekly' ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Last 7 Days Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-bg-elevated p-4 rounded text-center border border-border">
                    <span className="text-3xl font-mono font-bold text-accent-danger">{summary.total}</span>
                    <span className="block text-xs uppercase text-text-secondary mt-1">Total Errors</span>
                  </div>
                  <div className="bg-bg-elevated p-4 rounded text-center border border-border">
                    <span className="text-3xl font-mono font-bold text-accent-warning">
                      {summary.errors.filter(e => e.status === 'Pending').length}
                    </span>
                    <span className="block text-xs uppercase text-text-secondary mt-1">Still Pending</span>
                  </div>
                  <div className="bg-bg-elevated p-4 rounded text-center border border-border">
                    <span className="text-3xl font-mono font-bold text-accent-success">
                      {summary.errors.filter(e => e.status === 'Mastered').length}
                    </span>
                    <span className="block text-xs uppercase text-text-secondary mt-1">Mastered</span>
                  </div>
                  <div className="bg-bg-elevated p-4 rounded text-center border border-border">
                    <span className="text-xl font-bold text-text-primary line-clamp-1 mt-1">
                      {Object.keys(summary.subjectCount).length > 0 
                        ? Object.keys(summary.subjectCount).reduce((a, b) => summary.subjectCount[a] > summary.subjectCount[b] ? a : b)
                        : 'None'}
                    </span>
                    <span className="block text-xs uppercase text-text-secondary mt-2">Top Weak Subject</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary mb-3">Error Types Breakdown</h3>
                    <div className="space-y-2">
                      {Object.entries(summary.typeCount).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-sm p-2 bg-bg-elevated rounded border border-border">
                          <span>{type}</span>
                          <Badge variant="outline" className="font-mono">{count}</Badge>
                        </div>
                      ))}
                      {Object.keys(summary.typeCount).length === 0 && <p className="text-text-muted text-sm">No errors this week.</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-accent-danger mb-3">Rules Violated This Week</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none pr-2">
                      {summary.errors.map(e => (
                        <div key={e.id} className="text-sm p-2 bg-accent-danger/5 border border-accent-danger/20 rounded">
                          "{e.ruleViolated}" <span className="text-xs text-text-muted block mt-1">- {e.topic}</span>
                        </div>
                      ))}
                      {summary.errors.length === 0 && <p className="text-text-muted text-sm">Clean sheet this week.</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : view === 'add' ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-accent-danger flex items-center gap-2"><AlertOctagon className="w-5 h-5"/> Document Failure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Subject</label>
                  <Select value={subject} onChange={e => setSubject(e.target.value)}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Topic</label>
                  <Select value={topic} onChange={e => setTopic(e.target.value)}>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Source (e.g. GATE 2022, Mock 3)</label>
                  <Input value={source} onChange={e => setSource(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Error Type</label>
                  <Select value={errorType} onChange={e => setErrorType(e.target.value)}>
                    <option value="Concept Gap">Concept Gap</option>
                    <option value="Formula Slip">Formula Slip</option>
                    <option value="Time Panic">Time Panic</option>
                    <option value="Silly Mistake">Silly Mistake</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <label className="text-xs text-accent-warning mb-1 block">What I thought (My flawed reasoning)</label>
                  <Textarea value={thought} onChange={e => setThought(e.target.value)} className="font-mono text-sm border-accent-warning/30 focus-visible:ring-accent-warning" />
                </div>
                <div>
                  <label className="text-xs text-accent-success mb-1 block">Correct Answer / Approach</label>
                  <Textarea value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className="font-mono text-sm border-accent-success/30 focus-visible:ring-accent-success" />
                </div>
                <div>
                  <label className="text-xs text-accent-danger mb-1 block">Rule Violated (The core principle missed)</label>
                  <Input value={ruleViolated} onChange={e => setRuleViolated(e.target.value)} className="font-bold border-accent-danger/30 focus-visible:ring-accent-danger" />
                </div>
              </div>

              <Button onClick={handleAdd} variant="danger" className="w-full mt-4">Commit to Journal</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayedErrors.length === 0 ? (
              <div className="text-center py-16 text-text-muted border border-dashed border-border rounded-xl">
                No errors to display in this view.
              </div>
            ) : (
              displayedErrors.map(e => (
                <Card key={e.id} className={cn("transition-colors", e.status === 'Mastered' ? 'opacity-60 grayscale' : 'border-l-4 border-l-accent-danger')}>
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">{e.date}</Badge>
                          <Badge variant={e.errorType === 'Concept Gap' ? 'danger' : 'warning'} className="text-[10px]">{e.errorType}</Badge>
                          <Badge variant={e.status === 'Pending' ? 'danger' : e.status === 'Mastered' ? 'success' : 'default'} className="text-[10px] ml-auto lg:ml-0">
                            {e.status}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg text-text-primary">{e.topic} <span className="text-sm font-normal text-text-muted ml-2">({e.subject})</span></h3>
                        <p className="text-xs text-text-secondary mt-1">Source: <span className="font-mono">{e.source}</span></p>
                      </div>
                      
                      {e.status === 'Pending' && (
                        <div className="flex gap-2 items-start shrink-0">
                          <Button variant="outline" size="sm" onClick={() => updateErrorLog(e.id, { status: 'Re-attempted' })} className="text-xs h-8">
                            <RotateCcw className="w-3 h-3 mr-1" /> Re-attempted
                          </Button>
                          <Button variant="success" size="sm" onClick={() => updateErrorLog(e.id, { status: 'Mastered' })} className="text-xs h-8">
                            <Target className="w-3 h-3 mr-1" /> Mastered
                          </Button>
                        </div>
                      )}
                      {e.status === 'Re-attempted' && (
                        <Button variant="success" size="sm" onClick={() => updateErrorLog(e.id, { status: 'Mastered' })} className="text-xs h-8 shrink-0">
                          <Target className="w-3 h-3 mr-1" /> Mark Mastered
                        </Button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this error log?")) {
                            deleteErrorLog(e.id);
                          }
                        }}
                        className="p-1 text-text-muted hover:text-accent-danger transition-colors ml-2"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-border">
                      <div className="bg-bg-elevated p-3 rounded border border-accent-warning/20">
                        <span className="text-xs text-accent-warning font-bold block mb-1 uppercase tracking-wider">Flawed Logic</span>
                        <p className="font-mono text-text-secondary">{e.thought}</p>
                      </div>
                      <div className="bg-bg-elevated p-3 rounded border border-accent-success/20">
                        <span className="text-xs text-accent-success font-bold block mb-1 uppercase tracking-wider">Correct Approach</span>
                        <p className="font-mono text-text-primary">{e.correctAnswer}</p>
                      </div>
                      <div className="bg-bg-elevated p-3 rounded border border-accent-danger/30 flex flex-col justify-center text-center">
                        <span className="text-[10px] text-accent-danger font-bold block mb-2 uppercase tracking-widest">Rule Violated</span>
                        <p className="font-bold text-text-primary text-base leading-tight">"{e.ruleViolated}"</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
