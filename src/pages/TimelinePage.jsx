import { useEffect, useState } from 'react';
import { Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const STYLE_OPTIONS = ['light', 'dark'];

export default function TimelinePage() {
  const [data, setData] = useState({
    badge: '', heading: '', description: '',
    milestones: [
      { label: '', title: '', desc: '', style: 'light' },
      { label: '', title: '', desc: '', style: 'light' },
      { label: '', title: '', desc: '', style: 'dark' },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/tradition_timeline')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const updateMilestone = (i, field, val) => {
    const milestones = [...data.milestones];
    milestones[i] = { ...milestones[i], [field]: val };
    setData(d => ({ ...d, milestones }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings/tradition_timeline', data);
      setData(res.data);
      toast.success('Timeline saved!');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tradition Timeline</h1>
        <p className="text-gray-500 text-sm mt-1">Edit the "Rooted In Indian Heritage" section</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Section Header</h3>
        <Field label="Badge Text" value={data.badge} onChange={v => setData(d => ({ ...d, badge: v }))} placeholder="e.g. Our Legacy" />
        <Field label="Heading" value={data.heading} onChange={v => setData(d => ({ ...d, heading: v }))} />
        <TextArea label="Description" value={data.description} onChange={v => setData(d => ({ ...d, description: v }))} rows={3} />
      </div>

      <div className="space-y-4">
        {(data.milestones || []).map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">Milestone {i + 1}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Node Label (e.g. 1987)" value={m.label} onChange={v => updateMilestone(i, 'label', v)} />
              <Field label="Title" value={m.title} onChange={v => updateMilestone(i, 'title', v)} />
            </div>
            <TextArea label="Description" value={m.desc} onChange={v => updateMilestone(i, 'desc', v)} rows={2} />
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Node Style</label>
              <select value={m.style || 'light'} onChange={e => updateMilestone(i, 'style', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {STYLE_OPTIONS.map(s => <option key={s} value={s}>{s === 'dark' ? 'Dark (Purple)' : 'Light (White)'}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60">
        {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
        Save Changes
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1 block">{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1 block">{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;
}
