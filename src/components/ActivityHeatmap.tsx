import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, cn } from './ui';

export function ActivityHeatmap() {
  const { pyqLogs, tasks, errors, notes } = useStore();

  const numDays = 90;
  
  const { weeks, monthLabels } = useMemo(() => {
    const data = new Map<string, number>();
    const today = new Date();
    
    // Initialize last 90 days
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const localDateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      data.set(localDateStr, 0);
    }

    // Add PYQs
    pyqLogs.forEach(log => {
      const d = log.date.split('T')[0];
      if (data.has(d)) data.set(d, data.get(d)! + 1);
    });

    // Add Tasks
    tasks.forEach(task => {
      if (task.completed) {
        const d = task.date.split('T')[0];
        if (data.has(d)) data.set(d, data.get(d)! + 1);
      }
    });

    // Add Errors
    errors.forEach(err => {
      const d = err.date.split('T')[0];
      if (data.has(d)) data.set(d, data.get(d)! + 1);
    });

    // Add Notes
    notes.forEach(note => {
      const d = note.date.split('T')[0];
      if (data.has(d)) data.set(d, data.get(d)! + 1);
    });

    // Convert to array
    const heatmapData = [];
    const keys = Array.from(data.keys()).sort();
    for (const key of keys) {
      heatmapData.push({ date: key, count: data.get(key)! });
    }

    // Group into weeks
    const weeksArr: (typeof heatmapData[0] | null)[][] = [];
    let currentWeek: (typeof heatmapData[0] | null)[] = [];
    
    if (heatmapData.length > 0) {
      const startDate = new Date(heatmapData[0].date);
      const startDayOfWeek = startDate.getDay();
      for (let i = 0; i < startDayOfWeek; i++) {
        currentWeek.push(null);
      }
    }

    for (const day of heatmapData) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArr.push(currentWeek);
    }

    const mLabels: { label: string, colIndex: number }[] = [];
    let currentMonth = -1;

    weeksArr.forEach((week, index) => {
      const validDay = week.find(d => d !== null);
      if (validDay) {
        const d = new Date(validDay.date);
        if (d.getMonth() !== currentMonth) {
          mLabels.push({ label: d.toLocaleString('default', { month: 'short' }), colIndex: index });
          currentMonth = d.getMonth();
        }
      }
    });

    return { weeks: weeksArr, monthLabels: mLabels };
  }, [pyqLogs, tasks, errors, notes]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-bg-elevated border border-border/50';
    if (count <= 3) return 'bg-accent-primary/40 border border-accent-primary/20';
    if (count <= 6) return 'bg-accent-primary/70 border border-accent-primary/40';
    if (count <= 9) return 'bg-accent-primary border border-accent-primary';
    return 'bg-blue-400 border border-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]';
  };

  // Group into columns (weeks)
  // Assuming each column is 7 days, let's just lay them out in a flex wrap or grid
  return (
    <Card className="border border-border bg-bg-card rounded-lg overflow-hidden">
      <CardHeader className="p-4 border-b border-border bg-bg-elevated flex justify-between items-center flex-row space-y-0">
        <CardTitle className="font-mono text-xs font-bold text-text-primary">
          🔥 ACTIVITY_HEATMAP (90 DAYS)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-bg-card">
        <div className="flex">
          <div className="flex flex-col gap-1 text-[10px] text-text-muted font-mono mr-2 pt-[18px]">
            <div className="h-3 leading-3">Sun</div>
            <div className="h-3 leading-3">Mon</div>
            <div className="h-3 leading-3">Tue</div>
            <div className="h-3 leading-3">Wed</div>
            <div className="h-3 leading-3">Thu</div>
            <div className="h-3 leading-3">Fri</div>
            <div className="h-3 leading-3">Sat</div>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="relative">
              <div className="flex text-[10px] text-text-muted font-mono mb-1 relative h-4">
                {monthLabels.map((m, i) => (
                  <div key={i} className="absolute" style={{ left: `calc(${m.colIndex} * 16px)` }}>
                    {m.label}
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-1">
                    {week.map((day, dIndex) => (
                      day ? (
                        <div
                          key={day.date}
                          title={`${day.date}: ${day.count} activities`}
                          className={cn(
                            "w-3 h-3 rounded-sm transition-colors shrink-0",
                            getIntensityClass(day.count)
                          )}
                        />
                      ) : (
                        <div key={`empty-${wIndex}-${dIndex}`} className="w-3 h-3 shrink-0" />
                      )
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-text-secondary font-mono">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-bg-elevated border border-border/50 shrink-0" />
            <div className="w-3 h-3 rounded-sm bg-accent-primary/40 border border-accent-primary/20 shrink-0" />
            <div className="w-3 h-3 rounded-sm bg-accent-primary/70 border border-accent-primary/40 shrink-0" />
            <div className="w-3 h-3 rounded-sm bg-accent-primary border border-accent-primary shrink-0" />
            <div className="w-3 h-3 rounded-sm bg-blue-400 border border-blue-400 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
