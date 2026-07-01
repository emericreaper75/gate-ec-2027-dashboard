import React, { useState, useMemo } from 'react';
import { useStore, PYQLog as PYQLogType } from '../store';
import { SUBJECTS, INITIAL_MASTERY } from '../store/initialData';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge, cn } from '../components/ui';
import { Plus, Target, Check, X, SkipForward, BarChart, Trash2 } from 'lucide-react';

export function PYQLog() {
  const { pyqLogs, addPYQLog, deletePYQLog, settings, updateSettings, triggerPersistenceSync } = useStore();
  const [view, setView] = useState<'log' | 'stats'>('log');
  
  // Form state
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState('');
  const [year, setYear] = useState('2023');
  const [marksType, setMarksType] = useState<'1-mark' | '2-mark'>('2-mark');
  const [questionType, setQuestionType] = useState<'MCQ' | 'NAT' | 'MSQ'>('MCQ');
  const [result, setResult] = useState<'Correct ✅' | 'Wrong ❌' | 'Skipped ⏭️'>('Correct ✅');
  const [timeTaken, setTimeTaken] = useState('');
  const [errorType, setErrorType] = useState('Concept Gap');
  const [notes, setNotes] = useState('');

  const topicsForSubject = useMemo(() => {
    const defaultTopics = INITIAL_MASTERY.filter(m => m.subject === subject).map(m => m.topic);
    if (!topic && defaultTopics.length > 0) setTopic(defaultTopics[0]);
    return defaultTopics;
  }, [subject]);

  const handleAdd = () => {
    if (!timeTaken) return;
    addPYQLog({
      id: Date.now().toString(),
      date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
      subject,
      topic,
      year,
      marksType,
      questionType,
      result,
      timeTaken: parseInt(timeTaken) || 0,
      errorType: result === 'Wrong ❌' ? errorType : undefined,
      notes
    });
    setTimeTaken('');
    setNotes('');
  };

  // Stats calculation
  const totalAttempted = pyqLogs.length;
  const correct = pyqLogs.filter(l => l.result === 'Correct ✅').length;
  const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;
  
  const twoMarkCorrect = pyqLogs.filter(l => l.marksType === '2-mark' && l.result === 'Correct ✅');
  const avgTime2Mark = twoMarkCorrect.length > 0 
    ? Math.round(twoMarkCorrect.reduce((acc, curr) => acc + curr.timeTaken, 0) / twoMarkCorrect.length) 
    : 0;

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const todaysCount = pyqLogs.filter(l => l.date === todayStr).length;

  const weakSpots = useMemo(() => {
    const topics: Record<string, { wrongCount: number, slowCount: number, subject: string }> = {};
    pyqLogs.forEach(log => {
      if (!topics[log.topic]) topics[log.topic] = { wrongCount: 0, slowCount: 0, subject: log.subject };
      if (log.result === 'Wrong ❌') topics[log.topic].wrongCount++;
      if (log.timeTaken > 180) topics[log.topic].slowCount++; // > 3 mins = 180s
    });
    
    return Object.entries(topics)
      .filter(([_, data]) => data.wrongCount > 1 || data.slowCount > 1)
      .map(([topic, data]) => ({ topic, ...data }));
  }, [pyqLogs]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-mono text-text-primary">PYQ LOG</h1>
          <p className="text-text-secondary mt-1">Practice Feedback Engine</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'log' ? 'primary' : 'outline'} onClick={() => setView('log')} size="sm">Log</Button>
          <Button variant={view === 'stats' ? 'primary' : 'outline'} onClick={() => setView('stats')} size="sm"><BarChart className="w-4 h-4 mr-2"/> Stats</Button>
        </div>
      </div>

      {view === 'log' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Log PYQ Attempt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Subject</label>
                  <Select value={subject} onChange={e => setSubject(e.target.value)}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Topic</label>
                  <Select value={topic} onChange={e => setTopic(e.target.value)}>
                    {topicsForSubject.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">Year</label>
                    <Input value={year} onChange={e => setYear(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">Marks</label>
                    <Select value={marksType} onChange={e => setMarksType(e.target.value as any)}>
                      <option value="1-mark">1-mark</option>
                      <option value="2-mark">2-mark</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary block mb-1">Type</label>
                    <Select value={questionType} onChange={e => setQuestionType(e.target.value as any)}>
                      <option value="MCQ">MCQ</option>
                      <option value="NAT">NAT</option>
                      <option value="MSQ">MSQ</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-secondary block mb-2">Result</label>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 text-xs" 
                      variant={result === 'Correct ✅' ? 'success' : 'outline'} 
                      onClick={() => setResult('Correct ✅')}
                    ><Check className="w-3 h-3 mr-1"/> Correct</Button>
                    <Button 
                      className="flex-1 text-xs" 
                      variant={result === 'Wrong ❌' ? 'danger' : 'outline'} 
                      onClick={() => setResult('Wrong ❌')}
                    ><X className="w-3 h-3 mr-1"/> Wrong</Button>
                    <Button 
                      className="flex-1 text-xs" 
                      variant={result === 'Skipped ⏭️' ? 'ghost' : 'outline'} 
                      onClick={() => setResult('Skipped ⏭️')}
                    ><SkipForward className="w-3 h-3 mr-1"/> Skip</Button>
                  </div>
                </div>

                {result === 'Wrong ❌' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs text-accent-danger block mb-1">Error Classification</label>
                    <Select value={errorType} onChange={e => setErrorType(e.target.value)} className="border-accent-danger text-accent-danger">
                      <option value="Concept Gap">Concept Gap</option>
                      <option value="Formula Slip">Formula Slip</option>
                      <option value="Time Panic">Time Panic</option>
                      <option value="Silly Mistake">Silly Mistake</option>
                      <option value="Guessed wrong">Guessed wrong</option>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-xs text-text-secondary block mb-1">Time Taken (seconds)</label>
                  <Input type="number" value={timeTaken} onChange={e => setTimeTaken(e.target.value)} placeholder="e.g. 120" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Notes (Optional)</label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="What went wrong?" />
                </div>

                <Button onClick={handleAdd} className="w-full mt-2"><Plus className="w-4 h-4 mr-2"/> Log PYQ</Button>
              </CardContent>
            </Card>

            <Card className="border-accent-primary border-t-2">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-secondary font-mono uppercase">Daily Target</p>
                  <p className="text-xl font-bold font-mono mt-1"><span className={todaysCount >= settings.dailyPYQTarget ? 'text-accent-success' : 'text-text-primary'}>{todaysCount}</span> / {settings.dailyPYQTarget}</p>
                </div>
                <Target className="w-8 h-8 text-accent-primary opacity-50" />
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-none pr-2">
                  {pyqLogs.slice().reverse().map(log => (
                    <div key={log.id} className="p-3 border border-border rounded-md bg-bg-elevated hover:border-accent-primary transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center">
                          <span className="text-lg" title={log.result}>{log.result.split(' ')[1]}</span>
                          <div>
                            <p className="text-sm font-bold text-text-primary leading-tight">{log.topic}</p>
                            <p className="text-xs text-text-secondary font-mono mt-0.5">{log.subject} • GATE {log.year}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[10px]">{log.timeTaken}s</Badge>
                          <Badge variant="outline" className="text-[10px]">{log.marksType}</Badge>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this log?")) {
                                triggerPersistenceSync();
                                deletePYQLog(log.id);
                              }
                            }}
                            className="p-0.5 text-text-muted hover:text-accent-danger transition-colors"
                            title="Delete Log"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {(log.errorType || log.notes) && (
                        <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1">
                          {log.errorType && <span className="text-xs text-accent-danger font-medium">Error: {log.errorType}</span>}
                          {log.notes && <span className="text-xs text-text-muted italic">"{log.notes}"</span>}
                        </div>
                      )}
                    </div>
                  ))}
                  {pyqLogs.length === 0 && <p className="text-text-muted text-center py-8">No PYQs logged yet. Start crushing them.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-mono text-text-primary mb-2">{totalAttempted}</p>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Total PYQs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className={cn("text-4xl font-mono mb-2", accuracy >= 80 ? 'text-accent-success' : accuracy >= 60 ? 'text-accent-warning' : 'text-accent-danger')}>{accuracy}%</p>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Overall Accuracy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-mono text-accent-primary mb-2">{avgTime2Mark}s</p>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Avg Time (2-mark)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center flex flex-col justify-center items-center">
                 <p className="text-2xl font-mono text-text-primary mb-2">
                   {/* Simple dominant error calc */}
                   {(() => {
                     const errors = pyqLogs.filter(l => l.errorType).map(l => l.errorType!);
                     if (!errors.length) return 'None';
                     const counts = errors.reduce((acc, e) => { acc[e] = (acc[e] || 0) + 1; return acc; }, {} as Record<string, number>);
                     return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                   })()}
                 </p>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Dominant Error</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Accuracy Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SUBJECTS.map(sub => {
                    const subLogs = pyqLogs.filter(l => l.subject === sub);
                    if (subLogs.length === 0) return null;
                    const correct = subLogs.filter(l => l.result === 'Correct ✅').length;
                    const acc = Math.round((correct / subLogs.length) * 100);
                    return (
                      <div key={sub} className="flex items-center gap-4 text-sm">
                        <div className="w-48 text-text-secondary truncate">{sub} <span className="text-[10px] ml-1">({subLogs.length})</span></div>
                        <div className="flex-1 bg-bg-elevated h-2 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all", acc >= 80 ? 'bg-accent-success' : acc >= 60 ? 'bg-accent-warning' : 'bg-accent-danger')} style={{ width: `${acc}%` }}></div>
                        </div>
                        <div className="w-12 text-right font-mono font-bold">{acc}%</div>
                      </div>
                    );
                  })}
                  {pyqLogs.length === 0 && <p className="text-text-muted text-sm text-center">No data yet.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-accent-danger flex items-center gap-2">
                  <Target className="w-4 h-4" /> Auto-Detected Weak Spots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weakSpots.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-4">No weak spots detected yet. Keep logging PYQs.</p>
                ) : (
                  <div className="space-y-3">
                    {weakSpots.map(ws => (
                      <div key={ws.topic} className="flex justify-between items-center p-3 border border-accent-danger/20 bg-accent-danger/5 rounded-md">
                        <div>
                          <p className="text-sm font-bold text-text-primary">{ws.topic}</p>
                          <p className="text-xs text-text-secondary">{ws.subject}</p>
                        </div>
                        <div className="flex gap-2">
                          {ws.wrongCount > 1 && <Badge variant="danger" className="text-[10px]">{ws.wrongCount} Wrongs</Badge>}
                          {ws.slowCount > 1 && <Badge variant="warning" className="text-[10px]">{ws.slowCount} Slow (&gt;3m)</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
