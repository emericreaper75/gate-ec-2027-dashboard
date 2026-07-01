import React, { useState } from 'react';
import { useStore } from '../store';
import { SUBJECTS } from '../store/initialData';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge, Textarea, cn } from '../components/ui';
import { Plus, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';

export function MockAnalyzer() {
  const { mocks, addMock, deleteMock, triggerPersistenceSync } = useStore();
  const [view, setView] = useState<'dashboard' | 'add'>('dashboard');

  const [date, setDate] = useState(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
  const [type, setType] = useState('Full Mock');
  const [source, setSource] = useState('ACE Engineering Academy');
  const [overallScore, setOverallScore] = useState('');
  const [totalAttempted, setTotalAttempted] = useState('');
  const [correct, setCorrect] = useState('');
  const [wrong, setWrong] = useState('');
  const [notes, setNotes] = useState('');

  const [subjectScores, setSubjectScores] = useState<Record<string, { obtained: string; available: string }>>(
    SUBJECTS.reduce((acc, sub) => ({ ...acc, [sub]: { obtained: '', available: '10' } }), {})
  );

  const [errors, setErrors] = useState({ concept: '0', formula: '0', time: '0', silly: '0' });

  const handleAdd = () => {
    if (!overallScore) return;
    
    const parsedSubjectScores: Record<string, {obtained: number; available: number}> = {};
    for (const sub of SUBJECTS) {
      parsedSubjectScores[sub] = {
        obtained: parseFloat(subjectScores[sub].obtained) || 0,
        available: parseFloat(subjectScores[sub].available) || 10
      };
    }

    addMock({
      id: Date.now().toString(),
      date,
      type,
      source,
      overallScore: parseFloat(overallScore) || 0,
      totalAttempted: parseInt(totalAttempted) || 0,
      correct: parseInt(correct) || 0,
      wrong: parseInt(wrong) || 0,
      unattempted: 65 - (parseInt(totalAttempted) || 0),
      timeTaken: 180,
      notes,
      subjects: parsedSubjectScores,
      errorTypes: {
        concept: parseInt(errors.concept) || 0,
        formula: parseInt(errors.formula) || 0,
        time: parseInt(errors.time) || 0,
        silly: parseInt(errors.silly) || 0
      }
    });
    
    setView('dashboard');
  };

  const sortedMocks = [...mocks].sort((a, b) => a.date.localeCompare(b.date));
  const fullMocks = sortedMocks.filter(m => m.type === 'Full Mock');
  const bestScore = fullMocks.length > 0 ? Math.max(...fullMocks.map(m => m.overallScore)) : 0;
  const latestScore = fullMocks.length > 0 ? fullMocks[fullMocks.length - 1].overallScore : 0;
  const avgScore = fullMocks.length > 0 ? Math.round(fullMocks.reduce((acc, m) => acc + m.overallScore, 0) / fullMocks.length) : 0;

  const trendData = sortedMocks.map(m => ({
    name: m.date.slice(5), // MM-DD
    Score: m.overallScore,
    Accuracy: m.totalAttempted > 0 ? Math.round((m.correct / m.totalAttempted) * 100) : 0
  }));

  const latestMock = fullMocks.length > 0 ? fullMocks[fullMocks.length - 1] : null;

  const radarData = latestMock ? SUBJECTS.map(sub => {
    const s = latestMock.subjects[sub] || { obtained: 0, available: 10 };
    return {
      subject: sub.split(' ')[0], // short name
      Score: s.obtained,
      fullMark: s.available
    };
  }) : [];

  const errorData = latestMock ? [
    { name: 'Concept', value: latestMock.errorTypes.concept },
    { name: 'Formula', value: latestMock.errorTypes.formula },
    { name: 'Time', value: latestMock.errorTypes.time },
    { name: 'Silly', value: latestMock.errorTypes.silly }
  ].filter(e => e.value > 0) : [];

  const COLORS = ['#F87171', '#FBBF24', '#60A5FA', '#9CA3AF'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-mono text-text-primary">MOCK ANALYZER</h1>
          <p className="text-text-secondary mt-1">Full-spectrum exam simulation telemetry</p>
        </div>
        <Button variant={view === 'add' ? 'outline' : 'primary'} onClick={() => setView(view === 'add' ? 'dashboard' : 'add')}>
          {view === 'add' ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Log Mock</>}
        </Button>
      </div>

      {view === 'add' ? (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Log New Mock Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Date</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Type</label>
                <Select value={type} onChange={e => setType(e.target.value)}>
                  <option>Full Mock</option>
                  <option>Subject-wise</option>
                  <option>Self-made</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-text-secondary mb-1 block">Source</label>
                <Input value={source} onChange={e => setSource(e.target.value)} />
              </div>
            </div>

            <div className="p-4 bg-bg-elevated border border-border rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-accent-primary font-bold mb-1 block uppercase">Overall Score</label>
                <Input type="number" step="0.33" value={overallScore} onChange={e => setOverallScore(e.target.value)} className="font-mono text-lg font-bold border-accent-primary/50 focus-visible:ring-accent-primary" />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Attempted</label>
                <Input type="number" value={totalAttempted} onChange={e => setTotalAttempted(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-accent-success mb-1 block">Correct</label>
                <Input type="number" value={correct} onChange={e => setCorrect(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-accent-danger mb-1 block">Wrong</label>
                <Input type="number" value={wrong} onChange={e => setWrong(e.target.value)} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">Error Classification (for wrong answers)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="text-xs text-text-secondary">Concept Gaps</label><Input type="number" value={errors.concept} onChange={e => setErrors({...errors, concept: e.target.value})} /></div>
                <div><label className="text-xs text-text-secondary">Formula Slips</label><Input type="number" value={errors.formula} onChange={e => setErrors({...errors, formula: e.target.value})} /></div>
                <div><label className="text-xs text-text-secondary">Time Panics</label><Input type="number" value={errors.time} onChange={e => setErrors({...errors, time: e.target.value})} /></div>
                <div><label className="text-xs text-text-secondary">Silly Mistakes</label><Input type="number" value={errors.silly} onChange={e => setErrors({...errors, silly: e.target.value})} /></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">Subject-wise Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {SUBJECTS.map(sub => (
                  <div key={sub} className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary w-40 truncate">{sub}</span>
                    <Input 
                      type="number" step="0.33" placeholder="Score" className="h-8 text-xs font-mono"
                      value={subjectScores[sub].obtained}
                      onChange={e => setSubjectScores({...subjectScores, [sub]: { ...subjectScores[sub], obtained: e.target.value }})}
                    />
                    <span className="text-text-muted">/</span>
                    <Input 
                      type="number" placeholder="Total" className="h-8 text-xs font-mono w-16"
                      value={subjectScores[sub].available}
                      onChange={e => setSubjectScores({...subjectScores, [sub]: { ...subjectScores[sub], available: e.target.value }})}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-text-secondary mb-1 block">Key Observations / Notes</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <Button onClick={handleAdd} className="w-full h-12 text-lg">Save Mock Analysis</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-bg-elevated border-accent-primary/50">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <span className="text-xs text-accent-primary font-bold uppercase tracking-wider mb-2">Latest Score</span>
                <span className="text-4xl font-mono font-bold text-text-primary">{latestScore}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <span className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">Best Score</span>
                <span className="text-4xl font-mono font-bold text-accent-success">{bestScore}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <span className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">Average Score</span>
                <span className="text-4xl font-mono font-bold text-text-primary">{avgScore}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <span className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">Est. Rank</span>
                <span className="text-4xl font-mono font-bold text-text-muted">
                  {latestScore >= 70 ? '< 100' : latestScore >= 60 ? '< 500' : latestScore >= 50 ? '< 1500' : '5000+'}
                </span>
              </CardContent>
            </Card>
          </div>

          {mocks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-text-muted">No mocks logged. The real test is coming.</p>
                <Button className="mt-4" onClick={() => setView('add')}>Log First Mock</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Score Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2D3342" />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#13161D', borderColor: '#2D3342', color: '#E2E8F0' }} />
                        <Line type="monotone" dataKey="Score" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subject Strength (Latest Mock)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#2D3342" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="Score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Error Distribution (Latest Mock)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    {errorData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={errorData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {errorData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#13161D', borderColor: '#2D3342', color: '#E2E8F0' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-text-muted text-sm">No errors logged.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mock History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto scrollbar-none">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-text-secondary uppercase bg-bg-elevated border-b border-border sticky top-0">
                          <tr>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Score</th>
                            <th className="px-4 py-3 font-medium">Acc.</th>
                            <th className="px-4 py-3 font-medium">Top Err</th>
                            <th className="px-4 py-3 font-medium text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sortedMocks.slice().reverse().map(m => {
                            const acc = m.totalAttempted > 0 ? Math.round((m.correct / m.totalAttempted) * 100) : 0;
                            const errs = m.errorTypes;
                            const maxErrVal = Math.max(errs.concept, errs.formula, errs.time, errs.silly);
                            const topErr = maxErrVal === 0 ? 'None' : 
                              maxErrVal === errs.concept ? 'Concept' : 
                              maxErrVal === errs.formula ? 'Formula' : 
                              maxErrVal === errs.time ? 'Time' : 'Silly';
                            
                            return (
                              <tr key={m.id} className="hover:bg-bg-elevated/50 transition-colors group">
                                <td className="px-4 py-3 font-mono">{m.date.slice(5)}</td>
                                <td className="px-4 py-3 text-text-secondary truncate max-w-[100px]">{m.type}</td>
                                <td className="px-4 py-3 font-mono font-bold text-accent-primary">{m.overallScore}</td>
                                <td className="px-4 py-3 text-text-secondary">{acc}%</td>
                                <td className="px-4 py-3 text-xs">{topErr}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this mock record?")) {
                                        triggerPersistenceSync();
                                        deleteMock(m.id);
                                      }
                                    }}
                                    className="p-1 text-text-muted hover:text-accent-danger transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Mock"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
