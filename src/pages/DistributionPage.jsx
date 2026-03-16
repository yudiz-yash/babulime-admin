import { useEffect, useState } from 'react';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function DistributionPage() {
  const [data, setData] = useState({
    badge: '', heading: '', description: '',
    stats: [],
    mapLat: '22.319917062800005',
    mapLng: '70.84248014418061',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/distribution')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const updateStat = (i, field, val) => {
    const stats = [...data.stats];
    stats[i] = { ...stats[i], [field]: val };
    setData(d => ({ ...d, stats }));
  };

  const addStat = () => setData(d => ({ ...d, stats: [...d.stats, { value: '', label: '' }] }));
  const removeStat = (i) => setData(d => ({ ...d, stats: d.stats.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings/distribution', data);
      setData(res.data);
      toast.success('Distribution section saved!');
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
        <h1 className="text-2xl font-bold text-gray-900">Distribution Network</h1>
        <p className="text-gray-500 text-sm mt-1">Edit distribution section content and map location</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <Field label="Badge Text" value={data.badge} onChange={v => setData(d => ({ ...d, badge: v }))} />
        <Field label="Heading" value={data.heading} onChange={v => setData(d => ({ ...d, heading: v }))} />
        <TextArea label="Description" value={data.description} onChange={v => setData(d => ({ ...d, description: v }))} rows={2} />
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Statistics Cards</h3>
          <button onClick={addStat} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-2.5 py-1.5 rounded-lg">
            <Plus size={12} /> Add Stat
          </button>
        </div>

        {(data.stats || []).map((stat, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="grid sm:grid-cols-2 gap-3 flex-1">
              <Field label={`Value ${i + 1}`} value={stat.value} onChange={v => updateStat(i, 'value', v)} placeholder="e.g. 80,000+" />
              <Field label="Label" value={stat.label} onChange={v => updateStat(i, 'label', v)} placeholder="e.g. Retail Outlets" />
            </div>
            <button onClick={() => removeStat(i)} className="mt-6 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Map Location</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Latitude" value={data.mapLat} onChange={v => setData(d => ({ ...d, mapLat: v }))} placeholder="22.319917..." />
          <Field label="Longitude" value={data.mapLng} onChange={v => setData(d => ({ ...d, mapLng: v }))} placeholder="70.842480..." />
        </div>
        <p className="text-xs text-gray-400">Find coordinates at maps.google.com → right-click on location → copy coordinates</p>
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
