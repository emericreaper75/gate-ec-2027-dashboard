import React, { useState, useEffect } from 'react';
import { useStore, Milestone } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '../components/ui';
import { Check, Plus, AlertCircle, Clock } from 'lucide-react';

export function StrategicPlan() {
  const { milestones, addMilestone, updateMilestone } = useStore();
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('gate_schedule_table');
    if (saved) return JSON.parse(saved);
    return [
      { month: 'July 2026', subjects: 'Networks, Signals', daily: '3 hrs', weekly: 'Concept Lock' },
      { month: 'August 2026', subjects: 'Maths, GA', daily: '3 hrs', weekly: 'Concept Lock' },
      { month: 'September 2026', subjects: 'Communications', daily: '4 hrs', weekly: 'Formulas' },
      { month: 'October 2026', subjects: 'EM, Analog, Digital', daily: '4 hrs', weekly: 'Formulas' },
      { month: 'November 2026', subjects: 'All Subjects', daily: '5 hrs', weekly: 'ACE Mock 1' },
      { month: 'December 2026', subjects: 'Revision', daily: '6 hrs', weekly: '3 Mocks/week' },
      { month: 'January 2027', subjects: 'Revision', daily: '6 hrs', weekly: 'Speed Drills' },
      { month: 'February 2027', subjects: 'Read Only', daily: 'Light', weekly: 'Final Review' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('gate_schedule_table', JSON.stringify(schedule));
  }, [schedule]);

  const updateSchedule = (idx: number, field: string, val: string) => {
    const newSchedule = [...schedule];
    newSchedule[idx] = { ...newSchedule[idx], [field]: val };
    setSchedule(newSchedule);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle || !newMilestoneDate) return;
    addMilestone({
      id: Date.now().toString(),
      title: newMilestoneTitle,
      targetDate: newMilestoneDate,
      status: 'Pending',
      phase: 'Custom',
      isCustom: true
    });
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done': return <Badge variant="success"><Check className="w-3 h-3 mr-1"/> Done</Badge>;
      case 'At risk': return <Badge variant="danger"><AlertCircle className="w-3 h-3 mr-1"/> At risk</Badge>;
      case 'On track': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1"/> On track</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-mono text-text-primary">STRATEGIC PLAN</h1>
        <p className="text-text-secondary mt-1">7-Month Phase Timeline & Milestones</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-accent-primary font-mono text-xl">PHASE 1: Vigorous Prep</CardTitle>
              <p className="text-sm text-text-secondary">July 1 – November 30, 2026 (153 days)</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-l-2 border-border pl-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-primary"></div>
                  <h4 className="text-sm font-bold text-text-primary">Sub-phase A: Concept Lock (July–August)</h4>
                  <p className="text-xs text-text-muted mt-1">Networks, Signals, Maths, GA</p>
                </div>
                <div className="relative mt-4">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-primary"></div>
                  <h4 className="text-sm font-bold text-text-primary">Sub-phase B: Formula Drilling (Sept–Oct)</h4>
                  <p className="text-xs text-text-muted mt-1">Communications, EM, Analog, Digital</p>
                </div>
                <div className="relative mt-4">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-primary"></div>
                  <h4 className="text-sm font-bold text-text-primary">Sub-phase C: Mock Integration (Nov)</h4>
                  <p className="text-xs text-text-muted mt-1">All subjects, ACE mock series begins</p>
                </div>
              </div>

              <div className="bg-bg-elevated p-4 rounded-md mt-4">
                <h5 className="text-xs font-bold text-text-secondary uppercase mb-2">Phase 1 Rules</h5>
                <ul className="list-disc list-inside text-sm text-text-primary space-y-1">
                  <li>One subject per week priority.</li>
                  <li>Never re-read a concept without attempting PYQs first.</li>
                  <li>Build A4 "combat sheet" for weak formulas.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-accent-danger font-mono text-xl">PHASE 2: Ruthless Testing</CardTitle>
              <p className="text-sm text-text-secondary">December 1, 2026 – February 14, 2027 (75 days)</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-l-2 border-border pl-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-danger"></div>
                  <h4 className="text-sm font-bold text-text-primary">Week 1–6 (Dec – Mid Jan)</h4>
                  <p className="text-xs text-text-muted mt-1">3 full mocks/week, error journal review, speed drills</p>
                </div>
                <div className="relative mt-4">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-danger"></div>
                  <h4 className="text-sm font-bold text-text-primary">Week 7–10 (Mid Jan – Feb)</h4>
                  <p className="text-xs text-text-muted mt-1">No new material, combat sheet only, PYQ review</p>
                </div>
                <div className="relative mt-4">
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-danger"></div>
                  <h4 className="text-sm font-bold text-text-primary">Final 3 Days</h4>
                  <p className="text-xs text-text-muted mt-1">Read only, no problems</p>
                </div>
              </div>

              <div className="bg-bg-elevated p-4 rounded-md mt-4 border border-accent-danger/20">
                <h5 className="text-xs font-bold text-accent-danger uppercase mb-2">Phase 2 Rules</h5>
                <ul className="list-disc list-inside text-sm text-text-primary space-y-1">
                  <li>Every session is exam simulation.</li>
                  <li>Re-attempt every logged error once per week.</li>
                  <li>Last 2 weeks: absolutely no new material.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Milestone Tracker</CardTitle>
              <span className="text-xs font-mono text-accent-primary">{milestones.filter(m => m.status === 'Done').length} / {milestones.length} Completed</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
                {milestones.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()).map(m => (
                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-bg-elevated rounded-md border border-border gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button 
                        onClick={() => updateMilestone(m.id, { status: m.status === 'Done' ? 'Pending' : 'Done' })}
                        className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${m.status === 'Done' ? 'bg-accent-success border-accent-success text-white' : 'border-text-muted hover:border-accent-primary text-transparent'}`}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${m.status === 'Done' ? 'text-text-muted line-through' : 'text-text-primary'}`}>{m.title}</p>
                        <div className="flex gap-2 text-xs text-text-muted mt-1">
                          <span className="font-mono">{m.targetDate}</span>
                          <span>•</span>
                          <span>{m.phase}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {m.status !== 'Done' && (
                        <select 
                          className="bg-transparent text-xs border border-border rounded px-1 py-0.5 text-text-secondary focus:outline-none focus:border-accent-primary"
                          value={m.status}
                          onChange={(e) => updateMilestone(m.id, { status: e.target.value as any })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="On track">On track</option>
                          <option value="At risk">At risk</option>
                        </select>
                      )}
                      {getStatusBadge(m.status)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-3">Add Custom Milestone</h4>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Milestone title" 
                    value={newMilestoneTitle} 
                    onChange={e => setNewMilestoneTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Input 
                    type="date" 
                    value={newMilestoneDate} 
                    onChange={e => setNewMilestoneDate(e.target.value)}
                    className="w-40 flex-shrink-0"
                  />
                  <Button size="icon" onClick={handleAddMilestone} className="flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle>Subject Schedule Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-text-secondary uppercase bg-bg-elevated border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Month</th>
                      <th className="px-4 py-3 font-medium">Primary Subjects</th>
                      <th className="px-4 py-3 font-medium">Daily Target</th>
                      <th className="px-4 py-3 font-medium">Weekly Milestone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {schedule.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-bg-elevated/50 transition-colors">
                        <td className="px-4 py-3 font-mono whitespace-nowrap text-text-muted">{row.month}</td>
                        <td className="px-4 py-3">
                          <input 
                            className="bg-transparent border-none outline-none w-full text-text-primary" 
                            value={row.subjects} 
                            onChange={e => updateSchedule(i, 'subjects', e.target.value)} 
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            className="bg-transparent border-none outline-none w-full text-text-primary" 
                            value={row.daily} 
                            onChange={e => updateSchedule(i, 'daily', e.target.value)} 
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            className="bg-transparent border-none outline-none w-full text-text-primary" 
                            value={row.weekly} 
                            onChange={e => updateSchedule(i, 'weekly', e.target.value)} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
