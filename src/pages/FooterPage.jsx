import { useEffect, useState } from 'react';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function FooterPage() {
  const [data, setData] = useState({
    description: '', address: '', email: '',
    phones: ['', ''], instagramUrl: '', facebookUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/footer')
      .then(r => setData({ ...data, ...r.data }))
      .catch(() => toast.error('Failed to load footer settings.'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings/footer', data);
      setData(res.data);
      toast.success('Footer settings saved!');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const updatePhone = (i, val) => {
    const phones = [...(data.phones || [])];
    phones[i] = val;
    setData(d => ({ ...d, phones }));
  };

  const addPhone = () => setData(d => ({ ...d, phones: [...(d.phones || []), ''] }));
  const removePhone = (i) => setData(d => ({ ...d, phones: d.phones.filter((_, idx) => idx !== i) }));

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Footer</h1>
        <p className="text-gray-500 text-sm mt-1">Edit footer contact info and social links</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <TextArea label="Brand Tagline / Description" value={data.description} onChange={v => setData(d => ({ ...d, description: v }))} rows={3} />
        <TextArea label="Address (use line breaks)" value={data.address} onChange={v => setData(d => ({ ...d, address: v }))} rows={3} />
        <Field label="Email" value={data.email} onChange={v => setData(d => ({ ...d, email: v }))} placeholder="e.g. contact@babulime.com" />

        <div>
          <label className="text-xs font-medium text-gray-700 mb-2 block">Phone Numbers</label>
          <div className="space-y-2">
            {(data.phones || []).map((ph, i) => (
              <div key={i} className="flex gap-2">
                <input value={ph} onChange={e => updatePhone(i, e.target.value)} placeholder={`Phone ${i + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={() => removePhone(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={addPhone} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium">
              <Plus size={12} /> Add phone
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Social Links</p>
          <Field label="Instagram URL" value={data.instagramUrl} onChange={v => setData(d => ({ ...d, instagramUrl: v }))} />
          <Field label="Facebook URL" value={data.facebookUrl} onChange={v => setData(d => ({ ...d, facebookUrl: v }))} />
        </div>
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
