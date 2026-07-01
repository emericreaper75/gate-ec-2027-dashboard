import React, { useState, useEffect } from 'react';
import { useStore, Task } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge, cn } from '../components/ui';
import { SUBJECTS } from '../store/initialData';
import { Check, Plus, Clock, Tag, Award, Flame, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

export function DailyChecklist() {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(SUBJECTS[0]);
  const [newTaskPriority, setNewTaskPriority] = useState('P2');
  const [newTaskTime, setNewTaskTime] = useState('30');
  
  const [filter, setFilter] = useState<'All' | 'Pending' | 'P1' | 'P2' | 'P3'>('All');
  const [showMissionAccomplished, setShowMissionAccomplished] = useState(false);

  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

  // In a real app with midnight reset, we'd have an initialization hook to check carry-over.
  // Assuming 'tasks' holds pending from previous days and completed from *today only*.
  // (Completed tasks from past days should ideally be archived, but for simplicity we filter them out if date != today and completed).
  
  const activeTasks = tasks.filter(t => !t.completed || t.date === todayStr);

  const { formulas, mastery, errors, notes } = useStore();
  const dueRecallItems = [
    ...formulas.filter(f => f.srs && f.srs.nextReviewDate <= todayStr).map(f => ({
      id: `recall_f_${f.id}`,
      title: `Recall Formula: ${f.name}`,
      subject: f.subject,
      priority: 'P1',
      estimatedMinutes: 5,
      completed: false,
      date: todayStr,
      isRecall: true
    })),
    ...mastery.filter(m => m.srs && m.srs.nextReviewDate <= todayStr).map(m => ({
      id: `recall_m_${m.id}`,
      title: `Recall Topic: ${m.topic}`,
      subject: m.subject,
      priority: 'P1',
      estimatedMinutes: 10,
      completed: false,
      date: todayStr,
      isRecall: true
    }))
  ];

  const combinedTasks = [...activeTasks, ...dueRecallItems];
  
  const completedTasks = combinedTasks.filter(t => t.completed);
  const pendingTasks = combinedTasks.filter(t => !t.completed);

  const [prevPendingCount, setPrevPendingCount] = useState(pendingTasks.length);

  useEffect(() => {
    if (combinedTasks.length > 0 && prevPendingCount > 0 && pendingTasks.length === 0) {
      setShowMissionAccomplished(true);
      
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00E5FF', '#1A2942', '#FFFFFF']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00E5FF', '#1A2942', '#FFFFFF']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
    setPrevPendingCount(pendingTasks.length);
  }, [pendingTasks.length, combinedTasks.length, prevPendingCount]);

  const calculateStreak = () => {
     const today = new Date();
     let streak = 0;
     for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.date === dateStr);
        const completed = dayTasks.filter(t => t.completed).length;
        if (completed > 0 || (i === 0 && showMissionAccomplished)) {
           streak++;
        } else if (i > 0) {
           break;
        }
     }
     return Math.max(streak, 1);
  };

  const displayedTasks = filter === 'All' ? combinedTasks :
                         filter === 'Pending' ? pendingTasks :
                         combinedTasks.filter(t => t.priority === filter);

  // Sorting: Pending first, then by priority, then completed at bottom
  displayedTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if ((a as any).isRecall !== (b as any).isRecall) return (a as any).isRecall ? -1 : 1; // Prioritize recall
    if (a.priority !== b.priority) return a.priority.localeCompare(b.priority);
    return 0;
  });

  const totalTimeEst = combinedTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const timeCompleted = completedTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  const handleAdd = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      subject: newTaskSubject,
      priority: newTaskPriority,
      estimatedMinutes: parseInt(newTaskTime) || 30,
      completed: false,
      date: todayStr
    };
    addTask(task);
    setNewTaskTitle('');
  };

  const addTemplate = (templateId: number) => {
    const templates = [
      { title: 'Solve 10 PYQs', subject: 'Networks', p: 'P1', t: 45 },
      { title: 'Review combat formula sheet', subject: 'Signals & Systems', p: 'P2', t: 15 },
      { title: 'Watch NPTEL lecture', subject: 'Engineering Mathematics', p: 'P2', t: 60 }
    ];
    const tmpl = templates[templateId];
    addTask({
      id: Date.now().toString(),
      title: `${tmpl.title} — ${tmpl.subject}`,
      subject: tmpl.subject,
      priority: tmpl.p,
      estimatedMinutes: tmpl.t,
      completed: false,
      date: todayStr
    });
  };

  return (
    <div className="space-y-6 relative">
      <AnimatePresence>
        {showMissionAccomplished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-bg-card border-2 border-accent-primary p-8 rounded-xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary via-accent-success to-accent-primary"></div>
              <div className="w-20 h-20 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-accent-primary">
                <Award className="w-10 h-10 text-accent-primary" />
              </div>
              <h2 className="text-2xl font-mono font-bold text-text-primary mb-2 tracking-tighter">MISSION ACCOMPLISHED</h2>
              <p className="text-text-secondary mb-6 text-sm">All daily targets have been successfully neutralized.</p>
              
              <div className="bg-bg-elevated rounded-lg p-4 mb-6 border border-border">
                <div className="flex items-center justify-center gap-3">
                  <Flame className="w-6 h-6 text-accent-warning" />
                  <div className="text-left">
                    <div className="text-[10px] text-text-secondary font-mono uppercase">Current Streak</div>
                    <div className="text-xl font-bold font-mono text-accent-warning">{calculateStreak()} DAYS</div>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => setShowMissionAccomplished(false)} className="w-full font-bold tracking-widest text-xs h-12">
                ACKNOWLEDGE & RETURN
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-mono text-text-primary">DAILY CHECKLIST</h1>
          <p className="text-text-secondary mt-1 tracking-wide font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-bg-elevated rounded-md px-4 py-2 border border-border flex items-center gap-3 text-sm">
            <span className="text-text-secondary">Progress:</span>
            <span className="font-mono text-accent-primary">{completedTasks.length}/{activeTasks.length}</span>
          </div>
          <div className="bg-bg-elevated rounded-md px-4 py-2 border border-border flex items-center gap-3 text-sm">
            <span className="text-text-secondary">Time:</span>
            <span className="font-mono text-accent-success">{timeCompleted}m / {totalTimeEst}m</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 mb-2">
            {['All', 'Pending', 'P1', 'P2', 'P3'].map(f => (
              <Badge 
                key={f} 
                variant={filter === f ? 'default' : 'outline'}
                className={cn("cursor-pointer", filter === f ? "bg-accent-primary text-white border-accent-primary" : "")}
                onClick={() => setFilter(f as any)}
              >
                {f}
              </Badge>
            ))}
          </div>

          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {displayedTasks.length === 0 ? (
                <div className="p-8 text-center text-text-muted">No tasks found.</div>
              ) : (
                displayedTasks.map(task => (
                  <div key={task.id} className={cn("flex items-center p-4 gap-4 hover:bg-bg-elevated transition-colors", task.completed ? "opacity-60" : "")}>
                    <button 
                      onClick={() => {
                        if ((task as any).isRecall) {
                           // They should go to Spaced Repetition or we can just redirect them
                           window.location.hash = "recall"; 
                        } else {
                           updateTask(task.id, { completed: !task.completed });
                        }
                      }}
                      className={cn(
                        "w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors", 
                        task.completed ? "bg-accent-success border-accent-success text-white" : "border-text-muted hover:border-accent-primary text-transparent hover:text-bg-elevated",
                        (task as any).isRecall && !task.completed ? "bg-accent-primary/20 border-accent-primary animate-pulse" : ""
                      )}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", task.completed ? "line-through text-text-muted" : "text-text-primary", (task as any).isRecall ? "text-accent-primary" : "")}>
                        {(task as any).isRecall && <span className="mr-2">🧠</span>}
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {task.subject}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.estimatedMinutes}m</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.date !== todayStr && !task.completed && (
                        <Badge variant="warning" title="Carried over from a previous day">
                          {Math.floor((new Date(todayStr).getTime() - new Date(task.date).getTime()) / (1000 * 3600 * 24))}d old
                        </Badge>
                      )}
                      <Badge variant={task.priority === 'P1' ? 'danger' : task.priority === 'P2' ? 'warning' : 'outline'}>
                        {task.priority}
                      </Badge>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this task?")) {
                            deleteTask(task.id);
                          }
                        }}
                        className="p-1 text-text-muted hover:text-accent-danger transition-colors ml-2"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Task Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Task Description</label>
                <Input 
                  placeholder="e.g. Solve Z-transform PYQs" 
                  value={newTaskTitle} 
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Subject</label>
                <Select value={newTaskSubject} onChange={e => setNewTaskSubject(e.target.value)}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Priority</label>
                  <Select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Est. Time (min)</label>
                  <Input type="number" value={newTaskTime} onChange={e => setNewTaskTime(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full gap-2"><Plus className="w-4 h-4" /> Add Task</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-text-secondary font-normal uppercase tracking-wider">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs h-auto py-2 px-3 whitespace-normal text-left" onClick={() => addTemplate(0)}>
                + Solve 10 PYQs (45m)
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-auto py-2 px-3 whitespace-normal text-left" onClick={() => addTemplate(1)}>
                + Review combat sheet (15m)
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-auto py-2 px-3 whitespace-normal text-left" onClick={() => addTemplate(2)}>
                + Watch NPTEL lecture (60m)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
