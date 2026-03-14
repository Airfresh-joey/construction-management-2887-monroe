import { useTable } from '../hooks/useSupabase';
import { statusColor } from '../lib/format';
import { supabase } from '../lib/supabase';
import type { Document } from '../types';
import { Upload, FileText, ExternalLink } from 'lucide-react';

export default function DocumentChecklist() {
  const { data: docs, loading, update } = useTable<Document>('documents');

  const sections = Array.from(new Set(docs.map(d => d.section)));

  const handleUpload = async (doc: Document, file: File) => {
    const ext = file.name.split('.').pop();
    const path = `documents/${doc.id}.${ext}`;
    const { error } = await supabase.storage.from('project-files').upload(path, file, { upsert: true });
    if (error) {
      console.error('Upload error:', error);
      return;
    }
    const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(path);
    await update(doc.id, { file_url: urlData.publicUrl, status: 'complete' });
  };

  const cycleStatus = async (doc: Document) => {
    const next = doc.status === 'needed' ? 'pending' : doc.status === 'pending' ? 'complete' : 'needed';
    await update(doc.id, { status: next });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-400">Loading documents...</div>;
  }

  const totalDocs = docs.length;
  const completeDocs = docs.filter(d => d.status === 'complete').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy dark:text-white">Document Checklist</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{completeDocs} of {totalDocs} documents complete</p>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-slate-400">Document completion</span>
          <span className="font-medium text-gray-900 dark:text-white">{totalDocs > 0 ? Math.round((completeDocs / totalDocs) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${totalDocs > 0 ? (completeDocs / totalDocs) * 100 : 0}%` }} />
        </div>
      </div>

      {sections.map(section => (
        <div key={section} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">{section}</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {docs.filter(d => d.section === section).map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <FileText className="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700 dark:text-slate-300">{doc.name}</span>

                <button
                  onClick={() => cycleStatus(doc)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(doc.status)} hover:opacity-80`}
                >
                  {doc.status}
                </button>

                {doc.file_url ? (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <label className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(doc, file);
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
