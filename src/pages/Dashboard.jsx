import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, FileText, Package, Briefcase, ArrowRight, Clock } from 'lucide-react';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ contact: 0, contactUnread: 0, applications: 0, products: 0, positions: 0 });
  const [recentContact, setRecentContact] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/contact?limit=5'),
      api.get('/careers/applications?limit=5'),
      api.get('/products/all'),
      api.get('/careers/positions/all'),
    ]).then(([contact, apps, products, positions]) => {
      setStats({
        contact: contact.data.total,
        contactUnread: contact.data.unread,
        applications: apps.data.total,
        products: products.data.length,
        positions: positions.data.length,
      });
      setRecentContact(contact.data.submissions.slice(0, 5));
      setRecentApps(apps.data.applications.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: 'Contact Enquiries', value: stats.contact, sub: `${stats.contactUnread} unread`, icon: Mail, color: 'purple', to: '/contact-submissions' },
    { label: 'Job Applications', value: stats.applications, sub: 'Total received', icon: FileText, color: 'blue', to: '/applications' },
    { label: 'Product Categories', value: stats.products, sub: 'In catalog', icon: Package, color: 'green', to: '/products' },
    { label: 'Open Positions', value: stats.positions, sub: 'Job listings', icon: Briefcase, color: 'orange', to: '/careers' },
  ];

  const colorMap = {
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.to} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow group">
              <div className={`inline-flex p-2.5 rounded-lg border ${colorMap[card.color]} mb-4`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent contacts */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Enquiries</h2>
            <Link to="/contact-submissions" className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentContact.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No enquiries yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentContact.map(item => (
                <div key={item._id} className="px-5 py-3 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isRead ? 'bg-gray-200' : 'bg-purple-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">{item.subject || item.message?.substring(0, 40)}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                    <Clock size={11} /> {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent applications */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Recent Applications</h2>
            <Link to="/applications" className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No applications yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentApps.map(app => (
                <div key={app._id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                    {app.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{app.name}</p>
                    <p className="text-xs text-gray-400 truncate">{app.position}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    app.status === 'new' ? 'bg-blue-50 text-blue-600' :
                    app.status === 'shortlisted' ? 'bg-green-50 text-green-600' :
                    app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
