import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ICONS = ['Target', 'Shield', 'Zap', 'Leaf', 'Star', 'Award', 'CheckCircle', 'TrendingUp', 'Globe', 'Package'];

const EMPTY = { icon: 'Target', title: '', description: '', isActive: true };

export default function FeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null); // null or { ...feature } or { ...EMPTY }
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/features/all').then(r => setFeatures(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const startAdd = () => { setEditItem({ ...EMPTY }); setIsNew(true); };
  const startEdit = (f) => { setEditItem({ ...f }); setIsNew(false); };
  const cancelEdit = () => { setEditItem(null); setIsNew(false); };

  const save = async () => {
    if (!editItem.title || !editItem.description) return toast.error('Title and description required.');
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/features', editItem);
        setFeatures(f => [...f, res.data]);
        toast.success('Feature added!');
      } else {
        const res = await api.put(`/features/${editItem._id}`, editItem);
        setFeatures(f => f.map(x => x._id === editItem._id ? res.data : x));
        toast.success('Feature updated!');
      }
      cancelEdit();
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this feature?')) return;
    await api.delete(`/features/${id}`);
    setFeatures(f => f.filter(x => x._id !== id));
    toast.success('Feature deleted.');
  };

  const toggle = async (f) => {
    const res = await api.put(`/features/${f._id}`, { isActive: !f.isActive });
    setFeatures(fs => fs.map(x => x._id === f._id ? res.data : x));
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Features / Strengths</h1><p className="text-gray-500 text-sm mt-1">Manage the "Our Strengths" section</p></div>
        <button onClick={startAdd} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700">
          <Plus size={16} /> Add Feature
        </button>
      </div>

      {/* Edit form */}
      {editItem && (
        <div className="bg-white rounded-xl border-2 border-purple-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">{isNew ? 'New Feature' : 'Edit Feature'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Icon</label>
              <select value={editItem.icon} onChange={e => setEditItem(f => ({ ...f, icon: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
              <input value={editItem.title} onChange={e => setEditItem(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Feature title" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <textarea value={editItem.description} onChange={e => setEditItem(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Feature description..." />
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60">
              {saving ? <><Loader size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save</>}
            </button>
            <button onClick={cancelEdit} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Feature list */}
      <div className="space-y-3">
        {features.length === 0 && <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">No features yet. Click "Add Feature" to get started.</div>}
        {features.map(f => (
          <div key={f._id} className={`bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 ${!f.isActive ? 'opacity-50' : ''}`}>
            <GripVertical size={16} className="text-gray-300 mt-1 flex-shrink-0" />
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">{f.icon[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
              <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{f.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggle(f)} className={`text-xs px-2 py-1 rounded font-medium ${f.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {f.isActive ? 'Active' : 'Hidden'}
              </button>
              <button onClick={() => startEdit(f)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Edit2 size={14} /></button>
              <button onClick={() => del(f._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() { return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>; }
