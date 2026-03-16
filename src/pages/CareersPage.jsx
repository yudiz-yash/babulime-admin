import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader, MapPin, Building, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const EMPTY = { title: '', department: '', location: 'Rajkot, Gujarat', type: 'Full-time', isNew: false, isActive: true };

export default function CareersPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/careers/positions/all').then(r => setPositions(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const startAdd = () => { setEditItem({ ...EMPTY }); setIsNew(true); };
  const startEdit = (p) => { setEditItem({ ...p }); setIsNew(false); };
  const cancel = () => { setEditItem(null); setIsNew(false); };

  const save = async () => {
    if (!editItem.title || !editItem.department) return toast.error('Title and department required.');
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/careers/positions', editItem);
        setPositions(p => [...p, res.data]);
        toast.success('Position added!');
      } else {
        const res = await api.put(`/careers/positions/${editItem._id}`, editItem);
        setPositions(p => p.map(x => x._id === editItem._id ? res.data : x));
        toast.success('Position updated!');
      }
      cancel();
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this position?')) return;
    await api.delete(`/careers/positions/${id}`);
    setPositions(p => p.filter(x => x._id !== id));
    toast.success('Position deleted.');
  };

  const toggle = async (pos) => {
    const res = await api.put(`/careers/positions/${pos._id}`, { isActive: !pos.isActive });
    setPositions(p => p.map(x => x._id === pos._id ? res.data : x));
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Career Positions</h1><p className="text-gray-500 text-sm mt-1">Manage open job positions on the website</p></div>
        <button onClick={startAdd} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700">
          <Plus size={16} /> Add Position
        </button>
      </div>

      {/* Edit form */}
      {editItem && (
        <div className="bg-white rounded-xl border-2 border-purple-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">{isNew ? 'New Position' : 'Edit Position'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Inp label="Job Title *" value={editItem.title} onChange={v => setEditItem(e => ({ ...e, title: v }))} placeholder="e.g. Production Supervisor" />
            <Inp label="Department *" value={editItem.department} onChange={v => setEditItem(e => ({ ...e, department: v }))} placeholder="e.g. Manufacturing" />
            <Inp label="Location" value={editItem.location} onChange={v => setEditItem(e => ({ ...e, location: v }))} />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Job Type</label>
              <select value={editItem.type} onChange={e => setEditItem(i => ({ ...i, type: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={editItem.isNew} onChange={e => setEditItem(i => ({ ...i, isNew: e.target.checked }))} className="rounded" />
              Mark as "New"
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={editItem.isActive} onChange={e => setEditItem(i => ({ ...i, isActive: e.target.checked }))} className="rounded" />
              Active (show on website)
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60">
              {saving ? <><Loader size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save</>}
            </button>
            <button onClick={cancel} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Positions list */}
      {positions.length === 0 && <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">No positions yet.</div>}
      <div className="space-y-3">
        {positions.map(pos => (
          <div key={pos._id} className={`bg-white rounded-xl border border-gray-100 p-4 ${!pos.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800">{pos.title}</p>
                  {pos.isNew && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">New</span>}
                  {!pos.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Hidden</span>}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Building size={11} /> {pos.department}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} /> {pos.location}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {pos.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggle(pos)} className={`text-xs px-2 py-1 rounded font-medium ${pos.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {pos.isActive ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => startEdit(pos)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"><Edit2 size={14} /></button>
                <button onClick={() => del(pos._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() { return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>; }
function Inp({ label, value, onChange, placeholder }) {
  return <div><label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>;
}
