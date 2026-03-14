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
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading documents...</div>;
  }

  const totalDocs = docs.length;
  const completeDocs = docs.filter(d => d.status === 'complete').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Document Checklist</h2>
        <p className="text-gray-500 mt-1">{completeDocs} of {totalDocs} documents complete</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Document completion</span>
          <span className="font-medium">{totalDocs > 0 ? Math.round((completeDocs / totalDocs) * 100) : 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${totalDocs > 0 ? (completeDocs / totalDocs) * 100 : 0}%` }} />
        </div>
      </div>

      {sections.map(section => (
        <div key={section} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{section}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {docs.filter(d => d.section === section).map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700">{doc.name}</span>

                <button
                  onClick={() => cycleStatus(doc)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(doc.status)} hover:opacity-80`}
                >
                  {doc.status}
                </button>

                {doc.file_url ? (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <label className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
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
