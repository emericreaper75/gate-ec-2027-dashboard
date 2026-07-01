import React, { useState, useEffect, useRef } from 'react';
import { useStore, LearningNote } from '../store';
import { SUBJECTS } from '../store/initialData';
import { Plus, Search, BookOpen, Trash2, Edit3, Bold, Italic, List, Heading1, Heading2, Code, Quote, Eye, Columns, X, Tag } from 'lucide-react';
import { Badge, Button, Input, Select, Textarea } from '../components/ui';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const renderChart = async () => {
        try {
          const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substring(7)}`, chart);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (e) {
          console.error("Mermaid parsing error", e);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="text-accent-danger p-2 border border-accent-danger rounded bg-accent-danger/10">Failed to render diagram</div>`;
          }
        }
      };
      renderChart();
    }
  }, [chart]);

  return <div ref={containerRef} className="flex justify-center my-4 overflow-x-auto" />;
};

const MarkdownComponents = {
  code(props: any) {
    const {children, className, node, ...rest} = props;
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    if (language === 'mermaid') {
      return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
    }
    
    return (
      <code {...rest} className={className}>
        {children}
      </code>
    );
  }
};

export function LearningNotes() {
  const { notes, addNote, updateNote, deleteNote, triggerPersistenceSync } = useStore();
  
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');

  // Form states for active editing
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubject, setEditSubject] = useState(SUBJECTS[0]);
  const [editTopic, setEditTopic] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const activeNote = notes.find(n => n.id === activeNoteId);
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();

  const filteredNotes = notes.filter(n => {
    if (subjectFilter !== 'All' && n.subject !== subjectFilter) return false;
    if (tagFilter !== 'All' && !(n.tags || []).includes(tagFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || 
             n.content.toLowerCase().includes(q) || 
             n.topic.toLowerCase().includes(q) ||
             (n.tags || []).some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleCreateNew = () => {
    const newId = crypto.randomUUID();
    const newNote: LearningNote = {
      id: newId,
      title: 'Untitled Note',
      content: '',
      subject: subjectFilter !== 'All' ? subjectFilter : SUBJECTS[0],
      topic: '',
      date: new Date().toISOString().split('T')[0],
      tags: []
    };
    addNote(newNote);
    setActiveNoteId(newId);
    startEditing(newNote);
  };

  const startEditing = (note: LearningNote) => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditSubject(note.subject);
    setEditTopic(note.topic);
    setEditTags(note.tags || []);
    setNewTag('');
    setShowPreview(false);
    setSplitView(false);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (activeNoteId) {
      updateNote(activeNoteId, {
        title: editTitle || 'Untitled Note',
        content: editContent,
        subject: editSubject,
        topic: editTopic,
        tags: editTags,
      });
      setIsEditing(false);
      setShowPreview(false);
      setSplitView(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowPreview(false);
    setSplitView(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      triggerPersistenceSync();
      deleteNote(id);
      if (activeNoteId === id) {
        setActiveNoteId(null);
        setIsEditing(false);
      }
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editContent;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selected + suffix + after;
    setEditContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 pb-12">
      {/* Sidebar - List of Notes */}
      <div className="w-full md:w-80 flex flex-col gap-4 border-r border-border pr-4 shrink-0 h-[70vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-accent-primary"/> Learnings</h2>
          <Button size="sm" onClick={handleCreateNew}><Plus className="w-4 h-4"/></Button>
        </div>
        
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
            <Input 
              placeholder="Search notes..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="All">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          {allTags.length > 0 && (
            <Select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
              <option value="All">All Tags</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-none">
          {filteredNotes.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No notes found.</p>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id}
                onClick={() => {
                  if (isEditing) saveEdit();
                  setActiveNoteId(note.id);
                  setIsEditing(false);
                }}
                className={`group p-3 rounded-md cursor-pointer border transition-colors ${activeNoteId === note.id ? 'bg-bg-elevated border-accent-primary' : 'bg-transparent border-border hover:border-text-muted'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold truncate pr-2">{note.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-text-muted">{note.date.slice(5)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="p-1 text-text-muted hover:text-accent-danger transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px]">{note.subject}</Badge>
                  {note.topic && <span className="text-xs text-text-muted truncate">{note.topic}</span>}
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map(t => (
                      <span key={t} className="text-[10px] text-accent-primary bg-accent-primary/10 px-1.5 py-0.5 rounded-sm">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Editor/Viewer */}
      <div className="flex-1 h-[70vh] overflow-y-auto pr-2 scrollbar-none">
        {!activeNote ? (
          <div className="h-full flex flex-col items-center justify-center text-text-muted">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a note or create a new one to start writing.</p>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <input 
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Note Title"
                className="bg-transparent border-none outline-none text-2xl font-bold text-text-primary w-full placeholder:text-text-muted"
                autoFocus
              />
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                <Button size="sm" onClick={saveEdit}>Save</Button>
              </div>
            </div>
            <div className="flex gap-4">
              <Select className="w-1/3" value={editSubject} onChange={(e) => setEditSubject(e.target.value)}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Input className="w-1/3" placeholder="Topic (e.g. Nyquist Plot)" value={editTopic} onChange={e => setEditTopic(e.target.value)} />
              <div className="w-1/3 relative flex items-center">
                <Tag className="w-4 h-4 absolute left-3 text-text-muted" />
                <Input 
                  className="pl-9"
                  placeholder="Add tag + Enter" 
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const t = newTag.trim().replace(/,$/, '');
                      if (t && !editTags.includes(t)) {
                        setEditTags([...editTags, t]);
                      }
                      setNewTag('');
                    }
                  }}
                />
              </div>
            </div>
            {editTags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {editTags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1 cursor-pointer hover:border-accent-danger hover:text-accent-danger" onClick={() => setEditTags(editTags.filter(t => t !== tag))}>
                    {tag} <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="border border-border rounded-md overflow-hidden bg-bg-card">
              <div className="flex items-center gap-1 border-b border-border bg-bg-elevated p-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('**', '**')} title="Bold">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('_', '_')} title="Italic">
                  <Italic className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('# ')} title="Heading 1">
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('## ')} title="Heading 2">
                  <Heading2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('- ')} title="List">
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('> ')} title="Quote">
                  <Quote className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('```\n', '\n```')} title="Code Block">
                  <Code className="w-4 h-4" />
                </Button>
                <div className="flex-1" />
                <Button 
                  variant={showPreview && !splitView ? "primary" : "outline"} 
                  size="sm" 
                  className="h-8 px-3 text-xs" 
                  onClick={() => { setShowPreview(!showPreview); setSplitView(false); }}
                >
                  <Eye className="w-3 h-3 mr-2" />
                  Preview
                </Button>
                <Button 
                  variant={splitView ? "primary" : "outline"} 
                  size="sm" 
                  className="h-8 px-3 text-xs" 
                  onClick={() => { setSplitView(!splitView); setShowPreview(false); }}
                >
                  <Columns className="w-3 h-3 mr-2" />
                  Split View
                </Button>
              </div>
              
              <div className="flex w-full h-[500px]">
                {(!showPreview || splitView) && (
                  <textarea
                    id="markdown-editor"
                    className={`h-full bg-transparent p-4 text-text-primary resize-y outline-none font-mono text-sm leading-relaxed ${splitView ? 'w-1/2 border-r border-border resize-none' : 'w-full'}`}
                    placeholder="Write your notes here in Markdown..."
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                  />
                )}
                {(showPreview || splitView) && (
                  <div className={`h-full p-4 overflow-y-auto prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary max-w-none markdown-body text-text-primary text-sm ${splitView ? 'w-1/2' : 'w-full'}`}>
                    {editContent ? <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={MarkdownComponents}>{editContent}</Markdown> : <p className="text-text-muted italic">Nothing to preview</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">{activeNote.title}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline">{activeNote.subject}</Badge>
                  {activeNote.topic && <span className="text-sm text-text-secondary">{activeNote.topic}</span>}
                  <span className="text-xs text-text-muted">{activeNote.date}</span>
                </div>
                {activeNote.tags && activeNote.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {activeNote.tags.map(t => (
                      <span key={t} className="text-xs font-mono text-accent-primary bg-accent-primary/10 px-2 py-1 rounded-sm">#{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => startEditing(activeNote)}><Edit3 className="w-4 h-4 mr-2"/> Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(activeNote.id)}><Trash2 className="w-4 h-4"/></Button>
              </div>
            </div>
            
            {/* Render Markdown Content */}
            <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary max-w-none">
              {activeNote.content ? (
                <div className="markdown-body text-text-primary">
                  <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={MarkdownComponents}>{activeNote.content}</Markdown>
                </div>
              ) : (
                <p className="text-text-muted italic">No content. Click Edit to add some notes.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
