import { useEffect, useState } from 'react';
import { Trash2, Mail, MailOpen, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function ContactSubmissions() {
  const [data, setData] = useState({ submissions: [], total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/contact?limit=100').then(r => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const markRead = async (item, isRead) => {
    const res = await api.put(`/contact/${item._id}`, { isRead });
    setData(d => ({ ...d, submissions: d.submissions.map(x => x._id === item._id ? res.data : x) }));
    if (selected?._id === item._id) setSelected(res.data);
  };

  const del = async (id) => {
    if (!confirm('Delete this submission?')) return;
    await api.delete(`/contact/${id}`);
    setData(d => ({ ...d, submissions: d.submissions.filter(x => x._id !== id) }));
    if (selected?._id === id) setSelected(null);
    toast.success('Deleted.');
  };

  const filtered = data.submissions.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  const openItem = (item) => {
    setSelected(item);
    if (!item.isRead) markRead(item, true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Enquiries</h1>
          <p className="text-gray-500 text-sm mt-1">{data.total} total · <span className="text-purple-600 font-medium">{data.unread} unread</span></p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600"><RefreshCw size={16} /></button>
      </div>

      <div className="flex gap-4 items-start">
        {/* List */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden min-w-0">
          <div className="p-3 border-b border-gray-50">
            <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          {loading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div> : (
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {filtered.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No enquiries found</div>}
              {filtered.map(item => (
                <button key={item._id} onClick={() => openItem(item)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${selected?._id === item._id ? 'bg-purple-50' : ''}`}>
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.isRead ? 'bg-gray-200' : 'bg-purple-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!item.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{item.name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{item.subject || item.message?.substring(0, 50)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="w-96 bg-white rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <p className="font-semibold text-gray-800 truncate">{selected.name}</p>
              <div className="flex gap-1">
                <button onClick={() => markRead(selected, !selected.isRead)} className="p-1.5 text-gray-400 hover:text-purple-600 rounded" title={selected.isRead ? 'Mark unread' : 'Mark read'}>
                  {selected.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
                </button>
                <button onClick={() => del(selected._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <Row label="Email"><a href={`mailto:${selected.email}`} className="text-purple-600 hover:underline">{selected.email}</a></Row>
              {selected.phone && <Row label="Phone">{selected.phone}</Row>}
              {selected.company && <Row label="Company">{selected.company}</Row>}
              {selected.subject && <Row label="Subject">{selected.subject}</Row>}
              <Row label="Date">{new Date(selected.createdAt).toLocaleString()}</Row>
              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2">Message</p>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-96 flex-shrink-0 hidden lg:flex items-center justify-center h-64 bg-white rounded-xl border border-gray-100 border-dashed">
            <p className="text-sm text-gray-400">Select an enquiry to view</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return <div className="flex gap-2"><span className="text-gray-400 w-20 flex-shrink-0 text-xs font-medium">{label}</span><span className="text-gray-700">{children}</span></div>;
}
