import { useState } from 'react';
import { useTable } from '../hooks/useSupabase';
import { formatDate } from '../lib/format';
import type { Note } from '../types';
import { BookOpen, Plus, Pencil, Trash2, X, Check, Tag } from 'lucide-react';

const CATEGORIES: { value: Note['category']; label: string; color: string }[] = [
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300' },
  { value: 'inspection', label: 'Inspection', color: 'bg-blue-100 text-blue-700' },
  { value: 'issue', label: 'Issue', color: 'bg-red-100 text-red-700' },
  { value: 'weather', label: 'Weather', color: 'bg-amber-100 text-amber-700' },
  { value: 'delivery', label: 'Delivery', color: 'bg-purple-100 text-purple-700' },
];

export default function NotesJournal() {
  const { data: notes, loading, insert, update, remove } = useTable<Note>('notes');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Note>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [newNote, setNewNote] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    category: 'general' as Note['category'],
  });

  const addNote = async () => {
    if (!newNote.title.trim()) return;
    await insert({
      ...newNote,
      created_at: new Date().toISOString(),
    });
    setNewNote({
      date: new Date().toISOString().split('T')[0],
      title: '',
      content: '',
      category: 'general',
    });
    setShowAdd(false);
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditData({ title: note.title, content: note.content, category: note.category, date: note.date });
  };

  const saveEdit = async (id: string) => {
    await update(id, editData);
    setEditingId(null);
  };

  const deleteNote = async (id: string) => {
    await remove(id);
  };

  const filteredNotes = filterCategory === 'all'
    ? notes
    : notes.filter(n => n.category === filterCategory);

  const sortedNotes = [...filteredNotes].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryStyle = (cat: string) => {
    return CATEGORIES.find(c => c.value === cat)?.color || CATEGORIES[0].color;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading notes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-navy dark:text-white">Field Notes</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Daily journal for site updates and observations</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-light"
        >
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {/* Add note form */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">New Field Note</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="date"
                value={newNote.date}
                onChange={e => setNewNote({ ...newNote, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm"
              />
              <input
                placeholder="Title *"
                value={newNote.title}
                onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm sm:col-span-2"
              />
            </div>
            <textarea
              placeholder="Note details..."
              value={newNote.content}
              onChange={e => setNewNote({ ...newNote, content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm"
            />
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setNewNote({ ...newNote, category: cat.value })}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      newNote.category === cat.value ? cat.color + ' ring-2 ring-offset-1 ring-navy' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={addNote} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Save</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
            filterCategory === 'all' ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          All ({notes.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = notes.filter(n => n.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                filterCategory === cat.value ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Notes list */}
      {sortedNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400">No field notes yet. Add your first note to start tracking site updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map(note => (
            <div key={note.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
              {editingId === note.id ? (
                <div className="space-y-3">
                  <input
                    value={editData.title || ''}
                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm font-semibold"
                  />
                  <textarea
                    value={editData.content || ''}
                    onChange={e => setEditData({ ...editData, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setEditData({ ...editData, category: cat.value })}
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          editData.category === cat.value ? cat.color + ' ring-2 ring-offset-1 ring-navy' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                    <div className="flex gap-1 ml-auto">
                      <button onClick={() => saveEdit(note.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{note.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle(note.category)}`}>
                        <Tag className="w-3 h-3 inline mr-0.5" />
                        {note.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(note)} className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteNote(note.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{formatDate(note.date)}</p>
                  {note.content && (
                    <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">{note.content}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
