import { useEffect, useState } from 'react';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ICON_OPTIONS = ['Newspaper', 'Trophy', 'Store', 'Award', 'Megaphone', 'Users', 'Star', 'Heart', 'Zap', 'TrendingUp'];

export default function BrandingPage() {
  const [data, setData] = useState({ badge: '', heading: '', description: '', items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/branding')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const updateItem = (i, field, val) => {
    const items = [...data.items];
    items[i] = { ...items[i], [field]: val };
    setData(d => ({ ...d, items }));
  };

  const addItem = () => setData(d => ({ ...d, items: [...d.items, { icon: 'Star', title: '', desc: '' }] }));
  const removeItem = (i) => setData(d => ({ ...d, items: d.items.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings/branding', data);
      setData(res.data);
      toast.success('Branding section saved!');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media & Branding</h1>
        <p className="text-gray-500 text-sm mt-1">Edit branding showcase cards</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <Field label="Badge Text" value={data.badge} onChange={v => setData(d => ({ ...d, badge: v }))} />
        <Field label="Heading" value={data.heading} onChange={v => setData(d => ({ ...d, heading: v }))} />
        <TextArea label="Description" value={data.description} onChange={v => setData(d => ({ ...d, description: v }))} rows={2} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Showcase Cards</h3>
          <button onClick={addItem} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-2.5 py-1.5 rounded-lg">
            <Plus size={12} /> Add Card
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {(data.items || []).map((item, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Card {i + 1}</span>
                <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Icon</label>
                <select value={item.icon || 'Star'} onChange={e => updateItem(i, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <Field label="Title" value={item.title} onChange={v => updateItem(i, 'title', v)} />
              <TextArea label="Description" value={item.desc} onChange={v => updateItem(i, 'desc', v)} rows={2} />
            </div>
          ))}
        </div>
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
