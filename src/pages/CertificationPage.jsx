import { useEffect, useState, useRef } from 'react';
import { Save, Loader, Upload, X, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function CertificationPage() {
  const [data, setData] = useState({ badge: '', heading: '', description: '', items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const fileRefs = [useRef(), useRef()];

  useEffect(() => {
    api.get('/settings/certification')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load.'))
      .finally(() => setLoading(false));
  }, []);

  const uploadImage = async (file, idx) => {
    if (!file) return;
    setUploading(idx);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const items = [...(data.items || [])];
      items[idx] = { ...items[idx], image: res.data.url };
      setData(d => ({ ...d, items }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const updateItem = (i, field, val) => {
    const items = [...(data.items || [])];
    items[i] = { ...items[i], [field]: val };
    setData(d => ({ ...d, items }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/settings/certification', data);
      setData(res.data);
      toast.success('Certification section saved!');
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
        <h1 className="text-2xl font-bold text-gray-900">Certification Section</h1>
        <p className="text-gray-500 text-sm mt-1">Upload FSSAI and ISO certificate images</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <Field label="Badge Text" value={data.badge} onChange={v => setData(d => ({ ...d, badge: v }))} />
        <Field label="Heading" value={data.heading} onChange={v => setData(d => ({ ...d, heading: v }))} />
        <TextArea label="Description" value={data.description} onChange={v => setData(d => ({ ...d, description: v }))} rows={2} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <h3 className="font-semibold text-gray-800 text-sm">Certificate Images</h3>

        {(data.items || []).map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Certificate {i + 1}</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Label" value={item.label} onChange={v => updateItem(i, 'label', v)} placeholder="e.g. FSSAI Certified" />
              <Field label="Alt Text" value={item.alt} onChange={v => updateItem(i, 'alt', v)} placeholder="Alt text for SEO" />
            </div>

            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-32 h-32 rounded-xl border-2 border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                {item.image
                  ? <img src={item.image} alt={item.alt} className="w-full h-full object-contain p-1" />
                  : <ImageIcon size={24} className="text-gray-300" />
                }
              </div>

              {/* Upload */}
              <div className="space-y-2">
                <input ref={fileRefs[i]} type="file" accept="image/*"
                  onChange={e => { uploadImage(e.target.files?.[0], i); e.target.value = ''; }}
                  className="sr-only" />
                <button
                  onClick={() => fileRefs[i].current?.click()}
                  disabled={uploading !== null}
                  className="flex items-center gap-2 border border-purple-200 text-purple-700 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 disabled:opacity-50"
                >
                  {uploading === i ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading === i ? 'Uploading…' : 'Upload Image'}
                </button>
                {item.image && (
                  <button onClick={() => updateItem(i, 'image', null)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
                    <X size={11} /> Remove
                  </button>
                )}
                <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
              </div>
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
