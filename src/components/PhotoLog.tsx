import { useState } from 'react';
import { useTable } from '../hooks/useSupabase';
import { formatDate } from '../lib/format';
import { supabase } from '../lib/supabase';
import type { Photo } from '../types';
import { Plus, Camera, X } from 'lucide-react';

const PHASES = [
  'Pre-construction', 'Demo & Site Prep', 'Foundation', 'Framing', 'Roof',
  'MEP Rough-in', 'Insulation', 'Drywall', 'Finishes', 'MEP Finish', 'Final & Punch',
];

export default function PhotoLog() {
  const { data: photos, loading, insert, remove } = useTable<Photo>('photos');
  const [showAdd, setShowAdd] = useState(false);
  const [filterPhase, setFilterPhase] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    phase: PHASES[0],
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `photos/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('project-files').upload(path, file);
    if (error) {
      console.error('Upload error:', error);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(path);
    await insert({
      phase: newPhoto.phase,
      date: newPhoto.date,
      description: newPhoto.description,
      file_url: urlData.publicUrl,
    });
    setNewPhoto({ phase: PHASES[0], date: new Date().toISOString().split('T')[0], description: '' });
    setShowAdd(false);
    setUploading(false);
  };

  const deletePhoto = async (id: string) => {
    if (confirm('Delete this photo?')) {
      await remove(id);
    }
  };

  const filtered = filterPhase ? photos.filter(p => p.phase === filterPhase) : photos;

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">Loading photos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-navy dark:text-white">Photo Log</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">{photos.length} photos</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-2 bg-navy text-white text-sm rounded-lg hover:bg-navy-light"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {/* Upload form */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upload Photo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <select value={newPhoto.phase} onChange={e => setNewPhoto({...newPhoto, phase: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm">
              {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="date" value={newPhoto.date} onChange={e => setNewPhoto({...newPhoto, date: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
            <input placeholder="Description" value={newPhoto.description} onChange={e => setNewPhoto({...newPhoto, description: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm" />
          </div>
          <label className={`flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 ${uploading ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-300 dark:border-slate-600'}`}>
            <Camera className="w-5 h-5 text-gray-400 dark:text-slate-500" />
            <span className="text-sm text-gray-500 dark:text-slate-400">{uploading ? 'Uploading...' : 'Click to select photo'}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterPhase('')}
          className={`px-3 py-1 rounded-full text-xs font-medium ${!filterPhase ? 'bg-navy text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
        >
          All
        </button>
        {PHASES.map(p => (
          <button
            key={p}
            onClick={() => setFilterPhase(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${filterPhase === p ? 'bg-navy text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 text-center text-gray-400 dark:text-slate-500">
          <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No photos yet. Upload your first job site photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(photo => (
            <div key={photo.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden group relative">
              <img src={photo.file_url} alt={photo.description} className="w-full h-48 object-cover" />
              <button
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-3">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">{photo.phase}</span>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{formatDate(photo.date)}</p>
                {photo.description && <p className="text-sm text-gray-700 dark:text-slate-300 mt-1">{photo.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
