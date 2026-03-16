import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function AboutPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/about').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put('/about', data);
      setData(res.data);
      toast.success('About section updated!');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const updatePara = (i, val) => setData(d => { const p = [...d.paragraphs]; p[i] = val; return { ...d, paragraphs: p }; });
  const addPara = () => setData(d => ({ ...d, paragraphs: [...d.paragraphs, ''] }));
  const removePara = (i) => setData(d => ({ ...d, paragraphs: d.paragraphs.filter((_, idx) => idx !== i) }));

  const updateCheck = (i, val) => setData(d => { const c = [...d.checkItems]; c[i] = val; return { ...d, checkItems: c }; });
  const addCheck = () => setData(d => ({ ...d, checkItems: [...d.checkItems, ''] }));
  const removeCheck = (i) => setData(d => ({ ...d, checkItems: d.checkItems.filter((_, idx) => idx !== i) }));

  if (loading || !data) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">About Section</h1><p className="text-gray-500 text-sm mt-1">Edit the about section content</p></div>

      <Card title="Heading">
        <Field label="Badge Text">
          <Input value={data.badge} onChange={e => setData(d => ({ ...d, badge: e.target.value }))} />
        </Field>
        <Field label="Main Heading">
          <Input value={data.heading} onChange={e => setData(d => ({ ...d, heading: e.target.value }))} />
        </Field>
      </Card>

      <Card title="Paragraphs" action={<Btn onClick={addPara}><Plus size={14} /> Add</Btn>}>
        {data.paragraphs.map((p, i) => (
          <div key={i} className="flex gap-2">
            <Textarea value={p} onChange={e => updatePara(i, e.target.value)} rows={2} />
            <button onClick={() => removePara(i)} className="text-red-400 hover:text-red-600 flex-shrink-0 mt-1"><Trash2 size={15} /></button>
          </div>
        ))}
        <p className="text-xs text-gray-400">Tip: You can use {'<strong>text</strong>'} for bold.</p>
      </Card>

      <Card title="Check Items" action={<Btn onClick={addCheck}><Plus size={14} /> Add</Btn>}>
        {data.checkItems.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input value={item} onChange={e => updateCheck(i, e.target.value)} />
            <button onClick={() => removeCheck(i)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={15} /></button>
          </div>
        ))}
      </Card>

      <Card title="Stats Badge">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Value (e.g. 80K+)">
            <Input value={data.statBadgeValue} onChange={e => setData(d => ({ ...d, statBadgeValue: e.target.value }))} />
          </Field>
          <Field label="Label">
            <Input value={data.statBadgeLabel} onChange={e => setData(d => ({ ...d, statBadgeLabel: e.target.value }))} />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <SaveBtn saving={saving} onClick={save} />
      </div>
    </div>
  );
}

function Spinner() { return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>; }
function Card({ title, children, action }) {
  return <div className="bg-white rounded-xl border border-gray-100 overflow-hidden"><div className="flex items-center justify-between px-5 py-4 border-b border-gray-50"><h2 className="font-semibold text-gray-800">{title}</h2>{action}</div><div className="p-5 space-y-3">{children}</div></div>;
}
function Field({ label, children }) { return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}</div>; }
function Input({ value, onChange, ...props }) { return <input value={value} onChange={onChange} {...props} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />; }
function Textarea({ value, onChange, rows = 3, ...props }) { return <textarea value={value} onChange={onChange} rows={rows} {...props} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" />; }
function Btn({ onClick, children }) { return <button onClick={onClick} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium">{children}</button>; }
function SaveBtn({ saving, onClick }) {
  return <button onClick={onClick} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-md transition-all disabled:opacity-60">{saving ? <><Loader size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}</button>;
}
