import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LayoutGrid, GripVertical } from 'lucide-react';
import api from '../api/axios';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ALL_SECTIONS = [
  { key: 'banner',        label: 'Banner Slides',        description: 'Hero carousel image slider at the top' },
  { key: 'hero',          label: 'Hero Section',          description: 'Main heading, stats and CTA buttons' },
  { key: 'about',         label: 'About Section',         description: 'Company information and history' },
  { key: 'features',      label: 'Features / Strengths',  description: '"Our Strengths" feature cards' },
  { key: 'timeline',      label: 'Tradition Timeline',    description: 'Company history & milestones timeline' },
  { key: 'industryTrust', label: 'Industry Trust',        description: 'Industry trust badges and logos' },
  { key: 'manufacturing', label: 'Manufacturing',         description: 'Manufacturing process information' },
  { key: 'products',      label: 'Products',              description: 'Product categories and items showcase' },
  { key: 'compliance',    label: 'Compliance',            description: 'Compliance certifications section' },
  { key: 'certification', label: 'Certification',         description: 'Product certifications section' },
  { key: 'distribution',  label: 'Distribution',          description: 'Distribution information section' },
  { key: 'branding',      label: 'Branding',              description: 'Branding guidelines section' },
  { key: 'careers',       label: 'Careers',               description: 'Job openings and career listings' },
  { key: 'contact',       label: 'Contact',               description: 'Contact form and details' },
  { key: 'cta',           label: 'CTA Section',           description: 'Call-to-action section' },
  { key: 'footer',        label: 'Footer',                description: 'Footer links, social and info' },
];

const DEFAULT_ORDER = ALL_SECTIONS.map(s => s.key);
const DEFAULT_VISIBILITY = ALL_SECTIONS.reduce((acc, s) => ({ ...acc, [s.key]: true }), {});

// ── Sortable row ────────────────────────────────────────────────────────────
function SortableRow({ section, isOn, onToggle, saving, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between px-5 py-4 transition-colors border-b border-gray-50 last:border-0
        ${isDragging ? 'bg-purple-50 shadow-lg rounded-xl' : !isOn ? 'bg-gray-50/60' : 'bg-white hover:bg-purple-50/20'}`}
    >
      {/* Drag handle + index */}
      <div className="flex items-center gap-1 mr-3 flex-shrink-0">
        <span className="text-xs text-gray-300 font-medium w-5 text-right select-none">{index + 1}</span>
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
      </div>

      {/* Icon + label */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isOn ? 'bg-green-100' : 'bg-gray-100'}`}>
          {isOn
            ? <Eye size={15} className="text-green-600" />
            : <EyeOff size={15} className="text-gray-400" />
          }
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold truncate ${isOn ? 'text-gray-800' : 'text-gray-400'}`}>
            {section.label}
          </p>
          <p className="text-xs text-gray-400 truncate">{section.description}</p>
        </div>
      </div>

      {/* Badge + toggle */}
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        <span className={`hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full ${isOn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
          {isOn ? 'Visible' : 'Hidden'}
        </span>
        <button
          onClick={() => !saving && onToggle(section.key)}
          disabled={saving}
          aria-label={`Toggle ${section.label}`}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
            disabled:opacity-60 ${isOn ? 'bg-purple-600' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function SectionVisibilityPage() {
  const [order, setOrder] = useState(DEFAULT_ORDER);           // array of keys
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Build ordered sections list from current order state
  const orderedSections = order
    .map(key => ALL_SECTIONS.find(s => s.key === key))
    .filter(Boolean);

  useEffect(() => {
    Promise.all([
      api.get('/settings/section_visibility').then(r => r.data).catch(() => DEFAULT_VISIBILITY),
      api.get('/settings/section_order').then(r => r.data).catch(() => DEFAULT_ORDER),
    ]).then(([vis, ord]) => {
      setVisibility({ ...DEFAULT_VISIBILITY, ...vis });
      // Merge: keep stored order but ensure all sections are present
      const stored = Array.isArray(ord) ? ord : DEFAULT_ORDER;
      const merged = [
        ...stored.filter(k => ALL_SECTIONS.some(s => s.key === k)),
        ...DEFAULT_ORDER.filter(k => !stored.includes(k)),
      ];
      setOrder(merged);
    }).finally(() => setLoading(false));
  }, []);

  const saveOrder = useCallback(async (newOrder) => {
    setSaving(true);
    try {
      await api.put('/settings/section_order', newOrder);
      toast.success('Order saved');
    } catch {
      toast.error('Failed to save order.');
    } finally {
      setSaving(false);
    }
  }, []);

  const saveVisibility = useCallback(async (newVis, label, nextState) => {
    setSaving(true);
    try {
      await api.put('/settings/section_visibility', newVis);
      toast.success(`${label} ${nextState ? 'visible' : 'hidden'}`);
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id);
    const newIndex = order.indexOf(over.id);
    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);
    saveOrder(newOrder);
  };

  const handleToggle = (key) => {
    const section = ALL_SECTIONS.find(s => s.key === key);
    const nextState = !visibility[key];
    const newVis = { ...visibility, [key]: nextState };
    setVisibility(newVis);
    saveVisibility(newVis, section?.label, nextState);
  };

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <LayoutGrid size={18} className="text-purple-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Section Visibility & Order</h1>
        </div>
        <p className="text-sm text-gray-500 ml-12">
          Drag rows to reorder sections. Toggle to show/hide them on the website.
          <span className="ml-2 inline-flex items-center gap-1 text-purple-600 font-medium">
            {visibleCount}/{ALL_SECTIONS.length} visible
          </span>
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <GripVertical size={13} />
          <span>Drag to reorder</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Eye size={13} />
          <span>Toggle visibility</span>
        </div>
      </div>

      {/* Sortable list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {orderedSections.map((section, index) => (
              <SortableRow
                key={section.key}
                section={section}
                isOn={visibility[section.key] !== false}
                onToggle={handleToggle}
                saving={saving}
                index={index}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Changes apply on the website instantly.
      </p>
    </div>
  );
}
