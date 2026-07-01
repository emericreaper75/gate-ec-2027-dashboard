import React, { useMemo } from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle, cn } from './ui';

export function ProductivityHeatmap() {
  const { tasks } = useStore();

  const numDays = 90;
  
  const { weeks, monthLabels } = useMemo(() => {
    const data = new Map<string, { completed: number; total: number }>();
    const today = new Date();
    
    // Initialize last 90 days
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const localDateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      data.set(localDateStr, { completed: 0, total: 0 });
    }

    // Add Tasks
    tasks.forEach(task => {
      const d = task.date.split('T')[0];
      if (data.has(d)) {
        const stats = data.get(d)!;
        stats.total += 1;
        if (task.completed) {
          stats.completed += 1;
        }
      }
    });

    // Convert to array
    const heatmapData = [];
    const keys = Array.from(data.keys()).sort();
    for (const key of keys) {
      heatmapData.push({ date: key, stats: data.get(key)! });
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
  }, [tasks]);

  const getIntensityClass = (stats: { completed: number; total: number }) => {
    if (stats.total === 0) return 'bg-bg-elevated border border-border/50';
    const completionRate = stats.completed / stats.total;
    if (completionRate === 0) return 'bg-accent-danger/30 border border-accent-danger/20';
    if (completionRate < 0.5) return 'bg-accent-warning/60 border border-accent-warning/40';
    if (completionRate < 1) return 'bg-accent-success/70 border border-accent-success/40';
    return 'bg-accent-success border border-accent-success shadow-[0_0_8px_rgba(34,197,94,0.5)]'; // 100% completed
  };

  return (
    <Card className="border border-border bg-bg-card rounded-lg overflow-hidden mb-6">
      <CardHeader className="p-4 border-b border-border bg-bg-elevated flex justify-between items-center flex-row space-y-0">
        <CardTitle className="font-mono text-xs font-bold text-text-primary uppercase flex items-center gap-2">
          <span>🎯</span> PRODUCTIVITY_CONSISTENCY (90 DAYS)
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
                          title={`${day.date}: ${day.stats.completed}/${day.stats.total} tasks completed`}
                          className={cn(
                            "w-3 h-3 rounded-sm transition-colors shrink-0",
                            getIntensityClass(day.stats)
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
          <span>0%</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-bg-elevated border border-border/50 shrink-0" title="No tasks" />
            <div className="w-3 h-3 rounded-sm bg-accent-danger/30 border border-accent-danger/20 shrink-0" title="0% completed" />
            <div className="w-3 h-3 rounded-sm bg-accent-warning/60 border border-accent-warning/40 shrink-0" title="< 50% completed" />
            <div className="w-3 h-3 rounded-sm bg-accent-success/70 border border-accent-success/40 shrink-0" title="< 100% completed" />
            <div className="w-3 h-3 rounded-sm bg-accent-success border border-accent-success shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="100% completed" />
          </div>
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  );
}
