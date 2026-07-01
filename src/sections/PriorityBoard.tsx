import React, { useState } from 'react';
import { useStore, PriorityCard } from '../store';
import { SUBJECTS } from '../store/initialData';
import { Button, Input, Select, Badge, cn } from '../components/ui';
import { Plus, GripVertical, Trash2 } from 'lucide-react';

const COLUMNS = ['⚡ Daily Drill', '📌 This Week', '🎯 On Deck', '✅ Done'] as const;

export function PriorityBoard() {
  const { priorityBoard, addPriorityCard, updatePriorityCard, deletePriorityCard } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [marks, setMarks] = useState('5');
  const [priorityLevel, setPriorityLevel] = useState('P2');

  const handleAdd = () => {
    if (!title.trim()) return;
    addPriorityCard({
      id: Date.now().toString(),
      title,
      subject,
      marksAtStake: parseInt(marks) || 0,
      priorityLevel,
      status: '🎯 On Deck'
    });
    setTitle('');
    setShowAdd(false);
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('cardId', id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, status: string) => {
    const cardId = e.dataTransfer.getData('cardId');
    if (cardId) updatePriorityCard(cardId, { status: status as any });
  };

  const renderColumn = (colName: string) => {
    const cards = priorityBoard
      .filter(c => c.status === colName)
      .sort((a, b) => b.marksAtStake - a.marksAtStake);

    return (
      <div 
        key={colName}
        className="flex flex-col bg-bg-card border border-border rounded-[10px] overflow-hidden"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, colName)}
      >
        <div className="p-3 bg-bg-elevated border-b border-border font-mono text-sm font-bold flex justify-between items-center">
          <span>{colName}</span>
          <Badge variant="outline" className="text-[10px]">{cards.length}</Badge>
        </div>
        <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[300px] scrollbar-none">
          {cards.map(card => (
            <div 
              key={card.id}
              draggable
              onDragStart={(e) => onDragStart(e, card.id)}
              className={cn(
                "bg-bg-elevated border border-border rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-accent-primary transition-colors group",
                card.status === '✅ Done' ? "opacity-60" : ""
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <Badge variant={card.priorityLevel === 'P1' ? 'danger' : card.priorityLevel === 'P2' ? 'warning' : 'outline'} className="text-[10px] px-1.5 py-0">
                  {card.priorityLevel}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-mono text-text-muted">
                  <span className="text-accent-success font-bold">+{card.marksAtStake}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this card?")) {
                        deletePriorityCard(card.id);
                      }
                    }}
                    className="p-0.5 text-text-muted hover:text-accent-danger transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Card"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <h4 className="text-sm font-bold text-text-primary leading-tight mb-1">{card.title}</h4>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider">{card.subject}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-mono text-text-primary">PRIORITY BOARD</h1>
          <p className="text-text-secondary mt-1">Mark-Recovery Target Matrix</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Topic
        </Button>
      </div>

      {showAdd && (
        <div className="bg-bg-elevated border border-border p-4 rounded-[10px] grid grid-cols-1 md:grid-cols-5 gap-4 items-end animate-in fade-in slide-in-from-top-4">
          <div className="md:col-span-2">
            <label className="text-xs text-text-secondary mb-1 block">Topic / Task</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Transient Analysis" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Subject</label>
            <Select value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1 block">Marks at Stake</label>
            <Input type="number" value={marks} onChange={e => setMarks(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-text-secondary mb-1 block">Priority</label>
              <Select value={priorityLevel} onChange={e => setPriorityLevel(e.target.value)}>
                <option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option>
              </Select>
            </div>
            <Button onClick={handleAdd} className="mb-0">Save</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 pb-8 min-h-[500px]">
        {COLUMNS.map(renderColumn)}
      </div>
    </div>
  );
}
