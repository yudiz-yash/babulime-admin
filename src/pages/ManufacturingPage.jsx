import { useEffect, useState } from 'react';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const MFG_ICONS = ['Layers', 'Droplets', 'Settings', 'Activity', 'Thermometer', 'Cpu', 'Factory', 'Zap', 'Package'];

export default function ManufacturingPage() {
  const [data, setData] = useState({
    badge: '', heading: '', description: '',
    steps: [],
    quality: { heading: '', description: '', items: [], infrastructureHeading: '', infrastructureText: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/manufacturing')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const updateStep = (i, field, val) => {
    const steps = [...data.steps];
    steps[i] = { ...steps[i], [field]: val };
    setData(d => ({ ...d, steps }));
  };

  const addStep = () => setData(d => ({ ...d, steps: [...d.steps, { icon: 'Layers', title: '', desc: '' }] }));
  const removeStep = (i) => setData(d => ({ ...d, steps: d.steps.filter((_, idx) => idx !== i) }));

  const updateQualityItem = (i, val) => {
    const items = [...(data.quality?.items || [])];
    items[i] = val;
    setData(d => ({ ...d, quality: { ...d.quality, items } }));
  };
  const addQualityItem = () => setData(d => ({ ...d, quality: { ...d.quality, items: [...(d.quality?.items || []), ''] } }));
  const removeQualityItem = (i) => setData(d => ({ ...d, quality: { ...d.quality, items: d.quality.items.filter((_, idx) => idx !== i) } }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings/manufacturing', data);
      setData(res.data);
      toast.success('Manufacturing section saved!');
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
        <h1 className="text-2xl font-bold text-gray-900">Manufacturing Excellence</h1>
        <p className="text-gray-500 text-sm mt-1">Edit manufacturing process steps and quality section</p>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Section Header</h3>
        <Field label="Badge Text" value={data.badge} onChange={v => setData(d => ({ ...d, badge: v }))} />
        <Field label="Heading" value={data.heading} onChange={v => setData(d => ({ ...d, heading: v }))} />
        <TextArea label="Description" value={data.description} onChange={v => setData(d => ({ ...d, description: v }))} rows={2} />
      </div>

      {/* Steps */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Process Steps</h3>
          <button onClick={addStep} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-2.5 py-1.5 rounded-lg">
            <Plus size={12} /> Add Step
          </button>
        </div>
        <div className="space-y-4">
          {(data.steps || []).map((step, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Step {i + 1}</span>
                <button onClick={() => removeStep(i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Icon</label>
                  <select value={step.icon || 'Layers'} onChange={e => updateStep(i, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {MFG_ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <Field label="Title" value={step.title} onChange={v => updateStep(i, 'title', v)} />
              </div>
              <TextArea label="Description" value={step.desc} onChange={v => updateStep(i, 'desc', v)} rows={2} />
            </div>
          ))}
        </div>
      </div>

      {/* Quality Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Quality & Compliance Block</h3>
        <Field label="Heading" value={data.quality?.heading} onChange={v => setData(d => ({ ...d, quality: { ...d.quality, heading: v } }))} />
        <TextArea label="Description" value={data.quality?.description} onChange={v => setData(d => ({ ...d, quality: { ...d.quality, description: v } }))} rows={2} />

        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">Compliance Items</label>
          <div className="space-y-2">
            {(data.quality?.items || []).map((item, i) => (
              <div key={i} className="flex gap-2">
                <input value={item} onChange={e => updateQualityItem(i, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={() => removeQualityItem(i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
            ))}
            <button onClick={addQualityItem} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium">
              <Plus size={12} /> Add item
            </button>
          </div>
        </div>

        <Field label="Infrastructure Highlights Heading" value={data.quality?.infrastructureHeading} onChange={v => setData(d => ({ ...d, quality: { ...d.quality, infrastructureHeading: v } }))} />
        <TextArea label="Infrastructure Text" value={data.quality?.infrastructureText} onChange={v => setData(d => ({ ...d, quality: { ...d.quality, infrastructureText: v } }))} rows={3} />
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
