import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function HeroPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/hero').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/hero', data);
      setData(res.data);
      toast.success('Hero section updated!');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (i, key, val) => {
    setData(d => {
      const stats = [...d.stats];
      stats[i] = { ...stats[i], [key]: key === 'end' ? Number(val) : val };
      return { ...d, stats };
    });
  };

  const addStat = () => setData(d => ({ ...d, stats: [...d.stats, { end: 0, suffix: '+', label: 'New Stat' }] }));
  const removeStat = (i) => setData(d => ({ ...d, stats: d.stats.filter((_, idx) => idx !== i) }));

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Hero Section" subtitle="Edit the main hero section content" />

      <Card title="Text Content">
        <Field label="Title (before highlight)">
          <input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))} />
        </Field>
        <Field label="Highlighted word(s)">
          <input value={data.titleHighlight} onChange={e => setData(d => ({ ...d, titleHighlight: e.target.value }))} />
        </Field>
        <Field label="Title (after highlight)">
          <input value={data.titleEnd} onChange={e => setData(d => ({ ...d, titleEnd: e.target.value }))} />
        </Field>
        <Field label="Subtitle">
          <input value={data.subtitle} onChange={e => setData(d => ({ ...d, subtitle: e.target.value }))} />
        </Field>
        <Field label="Tagline">
          <input value={data.tagline} onChange={e => setData(d => ({ ...d, tagline: e.target.value }))} />
        </Field>
        <Field label="Button Text">
          <input value={data.buttonText} onChange={e => setData(d => ({ ...d, buttonText: e.target.value }))} />
        </Field>
      </Card>

      <Card title="Stats Cards" action={<button onClick={addStat} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"><Plus size={14} /> Add Stat</button>}>
        <div className="space-y-3">
          {data.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Number</label>
                  <input className="input-sm" type="number" value={stat.end} onChange={e => updateStat(i, 'end', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Suffix</label>
                  <input className="input-sm" value={stat.suffix} onChange={e => updateStat(i, 'suffix', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Label</label>
                  <input className="input-sm" value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} />
                </div>
              </div>
              <button onClick={() => removeStat(i)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveBtn saving={saving} onClick={save} />
      </div>
    </div>
  );
}

// ── Shared components ──────────────────────────────────────
function Spinner() {
  return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;
}

function PageHeader({ title, subtitle }) {
  return <div><h1 className="text-2xl font-bold text-gray-900">{title}</h1><p className="text-gray-500 text-sm mt-1">{subtitle}</p></div>;
}

function Card({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function SaveBtn({ saving, onClick }) {
  return (
    <button onClick={onClick} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60">
      {saving ? <><Loader size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}
    </button>
  );
}

// Global input styles applied via index.css or inline
const styles = `
  input, textarea, select { @apply w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent; }
  .input-sm { @apply w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500; }
`;
