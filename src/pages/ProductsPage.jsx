import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Loader, ChevronDown, ChevronUp, Upload, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CAT_EMPTY = { slug: '', label: '', shortLabel: '', accent: '#7c3aed', lightBg: '#f3eeff', isActive: true, products: [] };
const PROD_EMPTY = { name: '', weight: '', pack: '', image: '' };
function ImgPreview({ src, alt = '', className = '' }) {
  if (!src) return (
    <div className={`bg-gray-100 flex items-center justify-center text-gray-300 ${className}`}>
      <ImageIcon size={20} />
    </div>
  );
  // src is always a base64 data URL (data:image/...;base64,...)
  return <img src={src} alt={alt} className={`object-contain bg-white ${className}`} />;
}

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editCat, setEditCat] = useState(null);
  const [isNewCat, setIsNewCat] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = () => api.get('/products/all').then(r => setCategories(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  // ── Image upload ───────────────────────────────────────
  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data.url;
    } catch {
      toast.error('Image upload failed.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onProdImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleImageUpload(file);
    if (url) setEditProd(p => ({ ...p, data: { ...p.data, image: url } }));
    e.target.value = '';
  };

  // ── Category CRUD ──────────────────────────────────────
  const startAddCat = () => { setEditCat({ ...CAT_EMPTY }); setIsNewCat(true); };
  const startEditCat = (c) => { setEditCat({ ...c }); setIsNewCat(false); };
  const cancelCat = () => { setEditCat(null); setIsNewCat(false); };

  const saveCat = async () => {
    if (!editCat.slug || !editCat.label) return toast.error('Slug and label required.');
    setSaving(true);
    try {
      if (isNewCat) {
        const res = await api.post('/products', editCat);
        setCategories(c => [...c, res.data]);
        toast.success('Category added!');
      } else {
        const res = await api.put(`/products/${editCat._id}`, editCat);
        setCategories(c => c.map(x => x._id === editCat._id ? res.data : x));
        toast.success('Category updated!');
      }
      cancelCat();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const delCat = async (id) => {
    if (!confirm('Delete this category and all its products?')) return;
    await api.delete(`/products/${id}`);
    setCategories(c => c.filter(x => x._id !== id));
    toast.success('Category deleted.');
  };

  // ── Product CRUD ───────────────────────────────────────
  const startAddProd = (catId) => {
    setEditProd({ catId, itemId: null, data: { ...PROD_EMPTY } });
    setExpandedId(catId);
  };
  const startEditProd = (catId, item) => {
    setEditProd({ catId, itemId: item._id, data: { name: item.name, weight: item.weight || '', pack: item.pack || '', image: item.image || '' } });
    setExpandedId(catId);
  };
  const cancelProd = () => setEditProd(null);

  const saveProd = async () => {
    if (!editProd.data.name) return toast.error('Product name required.');
    setSaving(true);
    try {
      if (!editProd.itemId) {
        const res = await api.post(`/products/${editProd.catId}/items`, editProd.data);
        setCategories(c => c.map(x => x._id === editProd.catId ? res.data : x));
        toast.success('Product added!');
      } else {
        const res = await api.put(`/products/${editProd.catId}/items/${editProd.itemId}`, editProd.data);
        setCategories(c => c.map(x => x._id === editProd.catId ? res.data : x));
        toast.success('Product updated!');
      }
      cancelProd();
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const delProd = async (catId, itemId) => {
    if (!confirm('Delete this product?')) return;
    const res = await api.delete(`/products/${catId}/items/${itemId}`);
    setCategories(c => c.map(x => x._id === catId ? res.data : x));
    toast.success('Product deleted.');
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Products</h1><p className="text-gray-500 text-sm mt-1">Manage product categories and items</p></div>
        <button onClick={startAddCat} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Category edit form */}
      {editCat && (
        <div className="bg-white rounded-xl border-2 border-purple-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">{isNewCat ? 'New Category' : 'Edit Category'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Inp label="Slug (unique ID)" value={editCat.slug} onChange={v => setEditCat(c => ({ ...c, slug: v }))} placeholder="e.g. medium-parcel" />
            <Inp label="Full Label" value={editCat.label} onChange={v => setEditCat(c => ({ ...c, label: v }))} />
            <Inp label="Short Label (tab)" value={editCat.shortLabel} onChange={v => setEditCat(c => ({ ...c, shortLabel: v }))} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs font-medium text-gray-700 mb-1 block">Accent Color</label><input type="color" value={editCat.accent} onChange={e => setEditCat(c => ({ ...c, accent: e.target.value }))} className="w-full h-9 rounded border border-gray-200 cursor-pointer p-1" /></div>
              <div><label className="text-xs font-medium text-gray-700 mb-1 block">Light BG</label><input type="color" value={editCat.lightBg} onChange={e => setEditCat(c => ({ ...c, lightBg: e.target.value }))} className="w-full h-9 rounded border border-gray-200 cursor-pointer p-1" /></div>
            </div>
          </div>
          <div className="flex gap-3">
            <BtnPrimary onClick={saveCat} loading={saving}><Save size={14} /> Save Category</BtnPrimary>
            <BtnOutline onClick={cancelCat}><X size={14} /> Cancel</BtnOutline>
          </div>
        </div>
      )}

      {/* Categories list */}
      {categories.length === 0 && <Empty text="No categories yet." />}
      {categories.map(cat => (
        <div key={cat._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Category header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.accent }} />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{cat.label}</p>
              <p className="text-xs text-gray-400">{cat.products.length} products · slug: {cat.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startAddProd(cat._id)} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium bg-purple-50 px-2.5 py-1.5 rounded-lg">
                <Plus size={12} /> Product
              </button>
              <button onClick={() => startEditCat(cat)} className="p-1.5 text-gray-400 hover:text-purple-600 rounded"><Edit2 size={14} /></button>
              <button onClick={() => delCat(cat._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
              <button onClick={() => setExpandedId(expandedId === cat._id ? null : cat._id)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                {expandedId === cat._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Product images thumbnail strip (always visible) */}
          {cat.products.length > 0 && expandedId !== cat._id && (
            <div className="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {cat.products.map(prod => (
                <div key={prod._id} className="flex-shrink-0 text-center">
                  <ImgPreview src={prod.image} alt={prod.name} className="w-14 h-14 rounded-lg border border-gray-100 object-contain" />
                  <p className="text-xs text-gray-400 mt-1 w-14 truncate">{prod.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* Expanded product list */}
          {expandedId === cat._id && (
            <div className="divide-y divide-gray-50">
              {/* Product edit form inline */}
              {editProd?.catId === cat._id && (
                <div className="p-5 bg-purple-50/40 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">{editProd.itemId ? 'Edit Product' : 'New Product'}</h4>

                  {/* Image upload area */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-2 block">Product Image</label>
                    <div className="flex items-start gap-4">
                      {/* Preview */}
                      <div className="w-24 h-24 rounded-xl border-2 border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
                        <ImgPreview src={editProd.data.image} alt="preview" className="w-full h-full" />
                      </div>
                      {/* Upload button */}
                      <div className="flex flex-col gap-2">
                        <input ref={fileRef} type="file" accept="image/*" onChange={onProdImageChange} className="sr-only" />
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-2 border border-purple-200 text-purple-700 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 disabled:opacity-50"
                        >
                          {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                          {uploading ? 'Uploading…' : 'Upload Image'}
                        </button>
                        {editProd.data.image && (
                          <button type="button" onClick={() => setEditProd(p => ({ ...p, data: { ...p.data, image: '' } }))}
                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                            <X size={11} /> Remove image
                          </button>
                        )}
                        <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <Inp label="Product Name *" value={editProd.data.name} onChange={v => setEditProd(p => ({ ...p, data: { ...p.data, name: v } }))} />
                    <Inp label="Weight (optional)" value={editProd.data.weight} onChange={v => setEditProd(p => ({ ...p, data: { ...p.data, weight: v } }))} placeholder="e.g. 350 gms" />
                    <Inp label="Pack Info (optional)" value={editProd.data.pack} onChange={v => setEditProd(p => ({ ...p, data: { ...p.data, pack: v } }))} placeholder="e.g. Pack of 20" />
                  </div>
                  <div className="flex gap-2">
                    <BtnPrimary onClick={saveProd} loading={saving || uploading}><Save size={13} /> Save</BtnPrimary>
                    <BtnOutline onClick={cancelProd}><X size={13} /> Cancel</BtnOutline>
                  </div>
                </div>
              )}

              {cat.products.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  No products yet. <button onClick={() => startAddProd(cat._id)} className="text-purple-600 hover:underline">Add one →</button>
                </div>
              ) : (
                cat.products.map(prod => (
                  <div key={prod._id} className="px-5 py-4 flex items-center gap-4">
                    {/* Image thumbnail */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                      <ImgPreview src={prod.image} alt={prod.name} className="w-full h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{prod.name}</p>
                      <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                        {prod.weight && <span>⚖ {prod.weight}</span>}
                        {prod.pack && <span>📦 {prod.pack}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEditProd(cat._id, prod)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => delProd(cat._id, prod._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Spinner() { return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>; }
function Empty({ text }) { return <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">{text}</div>; }
function Inp({ label, value, onChange, placeholder }) {
  return <div><label className="text-xs font-medium text-gray-700 mb-1 block">{label}</label><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>;
}
function BtnPrimary({ onClick, loading, children }) {
  return <button onClick={onClick} disabled={loading} className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60">{loading ? <Loader size={13} className="animate-spin" /> : null}{children}</button>;
}
function BtnOutline({ onClick, children }) {
  return <button onClick={onClick} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">{children}</button>;
}
