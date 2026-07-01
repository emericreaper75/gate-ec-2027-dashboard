import React, { useState } from 'react';
import { useStore } from '../store';
import { SUBJECTS } from '../store/initialData';
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge, Button } from '../components/ui';
import { ChevronDown, ChevronUp, AlertTriangle, Download } from 'lucide-react';

export function SubjectTracker() {
  const { mastery, updateMastery } = useStore();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [showWeakOnly, setShowWeakOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'mastery'>('name');

  const getSubjectAverage = (sub: string) => {
    const topics = mastery.filter(m => m.subject === sub);
    if (!topics.length) return 0;
    return Math.round(topics.reduce((acc, curr) => acc + curr.mastery, 0) / topics.length);
  };

  const sortedSubjects = [...SUBJECTS].sort((a, b) => {
    if (sortBy === 'mastery') {
      return getSubjectAverage(b) - getSubjectAverage(a);
    }
    return a.localeCompare(b);
  });

  const getColorClass = (val: number) => val >= 75 ? 'bg-accent-success' : val >= 50 ? 'bg-accent-warning' : 'bg-accent-danger';
  const getTextColorClass = (val: number) => val >= 75 ? 'text-accent-success' : val >= 50 ? 'text-accent-warning' : 'text-accent-danger';

  const exportData = () => {
    let text = "GATE EC 2027 Mastery Export\n===========================\n\n";
    SUBJECTS.forEach(sub => {
      text += `[${sub}] - Overall: ${getSubjectAverage(sub)}%\n`;
      mastery.filter(m => m.subject === sub).forEach(topic => {
        text += `  - ${topic.topic}: ${topic.mastery}%\n`;
      });
      text += '\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GATE_Mastery_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-mono text-text-primary truncate">SUBJECT TRACKER</h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">Topic-level Mastery Engine</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          <select 
            className="bg-transparent border border-border rounded px-2 py-2 min-h-[44px] text-sm text-text-secondary focus:outline-none focus:border-accent-primary flex-1 md:flex-none"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="name">Sort by Name</option>
            <option value="mastery">Sort by Mastery %</option>
          </select>
          <Button 
            variant={showWeakOnly ? 'danger' : 'outline'} 
            onClick={() => setShowWeakOnly(!showWeakOnly)}
            className="gap-2 text-xs flex-1 md:flex-none min-h-[44px] justify-center"
          >
            <AlertTriangle className="w-4 h-4" /> <span className="hidden sm:inline">{showWeakOnly ? 'Showing Weak (<60%)' : 'Filter Weak'}</span><span className="sm:hidden">{showWeakOnly ? 'Weak' : 'All'}</span>
          </Button>
          <Button variant="outline" onClick={exportData} className="gap-2 text-xs flex-1 md:flex-none min-h-[44px] justify-center">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        {sortedSubjects.map(subject => {
          const avg = getSubjectAverage(subject);
          const topics = mastery.filter(m => m.subject === subject);
          const filteredTopics = showWeakOnly ? topics.filter(t => t.mastery < 60) : topics;
          
          if (showWeakOnly && filteredTopics.length === 0) return null;

          const isExpanded = expandedSubject === subject;

          return (
            <Card key={subject} className="overflow-hidden transition-all duration-200">
              <div 
                className={`p-4 cursor-pointer hover:bg-bg-elevated transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isExpanded ? 'bg-bg-elevated border-b border-border' : ''}`}
                onClick={() => setExpandedSubject(isExpanded ? null : subject)}
              >
                <div className="flex items-center gap-3 md:gap-4 flex-1 w-full">
                  <div className="w-8 h-8 rounded bg-bg-primary border border-border flex items-center justify-center font-mono text-xs text-text-muted shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-text-primary line-clamp-1">{subject}</h3>
                </div>
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-1/3 md:min-w-[200px] pl-11 md:pl-0">
                  <div className="flex-1">
                    <ProgressBar value={avg} barClassName={getColorClass(avg)} />
                  </div>
                  <div className={`font-mono font-bold w-10 md:w-12 text-right text-sm md:text-base ${getTextColorClass(avg)}`}>{avg}%</div>
                </div>
              </div>

              {isExpanded && (
                <CardContent className="p-0 bg-bg-primary/30">
                  <div className="divide-y divide-border">
                    {filteredTopics.map(topic => (
                      <div key={topic.id} className="p-4 pl-4 md:pl-16 flex flex-col md:flex-row md:items-center gap-4 hover:bg-bg-elevated/50">
                        <div className="w-full md:w-1/3 md:min-w-[200px]">
                          <p className="text-sm font-medium text-text-primary">{topic.topic}</p>
                          <p className="text-[10px] text-text-muted mt-1 font-mono">Last updated: {topic.lastUpdated || 'Never'}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-4 w-full">
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={topic.mastery}
                            onChange={(e) => updateMastery(topic.id, { mastery: parseInt(e.target.value), lastUpdated: new Date().toISOString().split('T')[0] })}
                            className="w-full accent-accent-primary h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer"
                          />
                          <Badge variant="outline" className={`w-12 justify-center font-mono ${getTextColorClass(topic.mastery)} border-current`}>
                            {topic.mastery}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

