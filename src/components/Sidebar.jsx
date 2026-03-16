import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Star, Info, Zap, Package, Briefcase,
  Mail, FileText, Image, LogOut, ChevronRight, X,
  Clock, Factory, ShieldCheck, Award, Map, Megaphone, Phone, AlignLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { divider: true, label: 'Content Sections' },
  { to: '/hero', icon: Star, label: 'Hero Section' },
  { to: '/about', icon: Info, label: 'About Section' },
  { to: '/features', icon: Zap, label: 'Features' },
  { to: '/timeline', icon: Clock, label: 'Timeline' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/manufacturing', icon: Factory, label: 'Manufacturing' },
  { to: '/compliance', icon: ShieldCheck, label: 'Compliance' },
  { to: '/certification', icon: Award, label: 'Certification' },
  { to: '/distribution', icon: Map, label: 'Distribution' },
  { to: '/branding', icon: Megaphone, label: 'Branding' },
  { to: '/cta', icon: Phone, label: 'CTA Section' },
  { to: '/footer', icon: AlignLeft, label: 'Footer' },
  { divider: true, label: 'Media' },
  { to: '/banner', icon: Image, label: 'Banner Slides' },
  { divider: true, label: 'Enquiries' },
  { to: '/contact-submissions', icon: Mail, label: 'Contact Enquiries' },
  { to: '/applications', icon: FileText, label: 'Applications' },
];

export default function Sidebar({ open, onClose }) {
  const { admin, logout } = useAuth();

  return (
    <>
      {/* Overlay (mobile) */}
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="Babu Lime" className="h-10 w-auto object-contain" />
            <p className="text-xs text-gray-400 font-medium">Admin Panel</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">
          {NAV.map((item, i) => {
            if (item.divider) return (
              <div key={i} className="mt-3 mb-1">
                <div className="border-t border-gray-100 mb-2" />
                {item.label && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">{item.label}</p>}
              </div>
            );
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all group
                  ${isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className={isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="text-purple-400" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom user */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
              {admin?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{admin?.name}</p>
              <p className="text-xs text-gray-400 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
