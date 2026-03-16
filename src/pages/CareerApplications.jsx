import { useEffect, useState } from 'react';
import { Trash2, Search, RefreshCw, Download, User, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const STATUS_OPTIONS = ['new', 'reviewing', 'shortlisted', 'rejected'];
const STATUS_COLORS = {
  new: 'bg-blue-50 text-blue-700',
  reviewing: 'bg-yellow-50 text-yellow-700',
  shortlisted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

export default function CareerApplications() {
  const [data, setData] = useState({ applications: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    setLoading(true);
    const params = filterStatus ? `?status=${filterStatus}&limit=100` : '?limit=100';
    api.get(`/careers/applications${params}`).then(r => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filterStatus]);

  const updateStatus = async (app, status) => {
    const res = await api.put(`/careers/applications/${app._id}`, { status, isRead: true });
    setData(d => ({ ...d, applications: d.applications.map(x => x._id === app._id ? res.data : x) }));
    if (selected?._id === app._id) setSelected(res.data);
    toast.success('Status updated.');
  };

  const del = async (id) => {
    if (!confirm('Delete this application?')) return;
    await api.delete(`/careers/applications/${id}`);
    setData(d => ({ ...d, applications: d.applications.filter(x => x._id !== id) }));
    if (selected?._id === id) setSelected(null);
    toast.success('Deleted.');
  };

  const openItem = async (item) => {
    setSelected(item);
    if (!item.isRead) {
      const res = await api.put(`/careers/applications/${item._id}`, { isRead: true });
      setData(d => ({ ...d, applications: d.applications.map(x => x._id === item._id ? res.data : x) }));
    }
  };

  const filtered = data.applications.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.position.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{data.total} total applications</p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600"><RefreshCw size={16} /></button>
      </div>

      <div className="flex gap-4 items-start">
        {/* List */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden min-w-0">
          <div className="p-3 border-b border-gray-50 flex gap-2">
            <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, position..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {loading ? <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div> : (
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {filtered.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No applications found</div>}
              {filtered.map(app => (
                <button key={app._id} onClick={() => openItem(app)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3 ${selected?._id === app._id ? 'bg-purple-50' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0 mt-0.5">
                    {app.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!app.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{app.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{app.position}</p>
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">{selected.name[0]}</div>
                <div><p className="font-semibold text-gray-800">{selected.name}</p><p className="text-xs text-gray-400">{selected.email}</p></div>
              </div>
              <button onClick={() => del(selected._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={15} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm max-h-[600px] overflow-y-auto">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Applied For</p>
                <p className="font-semibold text-gray-800">{selected.position}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {selected.phone && <div><p className="text-gray-400">Phone</p><p className="text-gray-700 mt-0.5">{selected.phone}</p></div>}
                {selected.experience && <div><p className="text-gray-400">Experience</p><p className="text-gray-700 mt-0.5">{selected.experience}</p></div>}
                <div><p className="text-gray-400">Applied on</p><p className="text-gray-700 mt-0.5">{new Date(selected.createdAt).toLocaleDateString()}</p></div>
              </div>

              {selected.coverLetter && (
                <div><p className="text-xs font-medium text-gray-500 mb-1">Cover Letter</p>
                  <p className="text-gray-700 leading-relaxed text-xs whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{selected.coverLetter}</p>
                </div>
              )}

              {selected.resumeUrl && (
                <a href={`http://localhost:5000${selected.resumeUrl}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 border border-purple-200 text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50">
                  <Download size={14} /> Download Resume ({selected.resumeOriginalName || 'resume'})
                </a>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => updateStatus(selected, s)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${selected.status === s ? STATUS_COLORS[s] + ' border-current' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-96 flex-shrink-0 hidden lg:flex items-center justify-center h-64 bg-white rounded-xl border border-gray-100 border-dashed">
            <p className="text-sm text-gray-400">Select an application to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
