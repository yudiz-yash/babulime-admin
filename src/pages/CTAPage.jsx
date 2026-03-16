import { useEffect, useState } from 'react';
import { Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function CTAPage() {
  const [data, setData] = useState({ heading: '', description: '', primaryBtnText: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/cta')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load CTA settings.'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings/cta', data);
      setData(res.data);
      toast.success('CTA section saved!');
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
        <h1 className="text-2xl font-bold text-gray-900">CTA Section</h1>
        <p className="text-gray-500 text-sm mt-1">Edit the call-to-action section content</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <Field label="Heading" value={data.heading} onChange={v => setData(d => ({ ...d, heading: v }))} />
        <TextArea label="Description" value={data.description} onChange={v => setData(d => ({ ...d, description: v }))} rows={3} />
        <Field label="Primary Button Text" value={data.primaryBtnText} onChange={v => setData(d => ({ ...d, primaryBtnText: v }))} placeholder="e.g. Write to Us" />
        <Field label="Phone Number" value={data.phone} onChange={v => setData(d => ({ ...d, phone: v }))} placeholder="e.g. +91-9227706516" />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
      >
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
