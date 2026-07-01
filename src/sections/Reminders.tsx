import React, { useState } from 'react';
import { useStore, Reminder } from '../store';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Badge } from '../components/ui';
import { Bell, BellOff, Plus, Trash2 } from 'lucide-react';

export function Reminders() {
  const { reminders, addReminder, updateReminder, deleteReminder } = useStore();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('08:00');
  const [repeat, setRepeat] = useState('daily');

  const handleAdd = () => {
    if (!title.trim() || !message.trim()) return;
    addReminder({
      id: Date.now().toString(),
      title,
      message,
      time,
      repeat,
      active: true
    });
    setTitle('');
    setMessage('');
  };

  const toggleReminder = (id: string, active: boolean) => {
    updateReminder(id, { active: !active });
    if (!active) {
      // Simulate asking for browser permission if enabling
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    }
  };

  const testPing = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification("GATE EC 2027 Dashboard", { body: "Audio & Notification Test Successful" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getTimeline = () => {
    const active = reminders.filter(r => r.active);
    if (active.length === 0) return [];
    
    const timeline = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      active.forEach(r => {
        if (r.repeat === 'daily' || 
            (r.repeat === 'weekly' && d.getDay() === 0 /* assuming sunday for weekly */) ||
            (r.repeat === 'one-time' && i === 0)) { // simplify one-time for now
          timeline.push({
            date: d,
            dayName,
            dateStr,
            time: r.time,
            title: r.title,
            id: r.id + '-' + i
          });
        }
      });
    }
    
    return timeline.sort((a, b) => {
      if (a.date.getTime() !== b.date.getTime()) return a.date.getTime() - b.date.getTime();
      return a.time.localeCompare(b.time);
    });
  };

  const timelineEntries = getTimeline();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-mono text-text-primary">REMINDERS</h1>
          <p className="text-text-secondary mt-1">Browser Notifications & Audio Pings</p>
        </div>
        <Button variant="outline" onClick={testPing} className="gap-2">
          <Bell className="w-4 h-4" /> Test Ping
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active & Configured Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.map(r => (
                <div key={r.id} className={`flex items-center justify-between p-4 rounded-md border transition-colors ${r.active ? 'bg-bg-elevated border-accent-primary/50' : 'bg-bg-card border-border opacity-60'}`}>
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleReminder(r.id, r.active)}
                      className={`mt-1 p-2 rounded-full transition-colors ${r.active ? 'bg-accent-primary/20 text-accent-primary' : 'bg-bg-elevated text-text-muted hover:text-text-primary'}`}
                    >
                      {r.active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{r.title}</h4>
                      <p className="text-xs text-text-secondary mt-1">{r.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="font-mono bg-bg-card">{r.time}</Badge>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{r.repeat}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this reminder?")) {
                        deleteReminder(r.id);
                      }
                    }} 
                    className="text-text-muted hover:text-accent-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next 7 Days Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timelineEntries.length === 0 ? (
                <p className="text-center text-text-muted py-4">No active reminders.</p>
              ) : (
                <div className="space-y-4 border-l-2 border-border pl-4">
                  {timelineEntries.map((t, i) => {
                    const isNewDay = i === 0 || timelineEntries[i-1].dateStr !== t.dateStr;
                    return (
                      <div key={t.id} className="relative">
                        {isNewDay && (
                          <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-border ring-4 ring-bg-card"></div>
                        )}
                        <div className="flex items-start gap-4">
                          <div className="w-20 pt-1 flex-shrink-0">
                            {isNewDay ? (
                              <>
                                <div className="text-xs font-bold text-text-primary">{t.dayName}</div>
                                <div className="text-[10px] text-text-muted">{t.dateStr}</div>
                              </>
                            ) : null}
                          </div>
                          <div className="flex-1 bg-bg-elevated p-3 rounded-md border border-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono bg-bg-primary text-[10px] py-0.5">{t.time}</Badge>
                              <span className="text-sm font-medium text-text-primary">{t.title}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Reminder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. PYQ Session" />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Message</label>
                <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Notification text..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Time</label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1 block">Repeat</label>
                  <Select value={repeat} onChange={e => setRepeat(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="one-time">One-time</option>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full gap-2"><Plus className="w-4 h-4" /> Add Reminder</Button>
            </CardContent>
          </Card>

          <div className="bg-bg-elevated p-4 rounded-md border border-border text-sm">
            <h4 className="font-bold text-accent-primary mb-2 flex items-center gap-2"><Bell className="w-4 h-4" /> How it works</h4>
            <p className="text-text-secondary mb-2">Reminders rely on the browser's Notification API and Web Audio API.</p>
            <ul className="list-disc list-inside text-text-muted space-y-1 text-xs">
              <li>Keep this app open in a tab to receive pings.</li>
              <li>A simple 440Hz beep will sound.</li>
              <li>Make sure browser notifications are enabled for this site.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
