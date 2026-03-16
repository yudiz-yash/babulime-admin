import { useEffect, useState, useRef } from 'react';
import { Trash2, Upload, Eye, EyeOff, Loader, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Images are base64 data URLs — use directly
function resolveUrl(src) {
  return src || null;
}

export default function BannerPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = () => api.get('/banner/all').then(r => setSlides(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    let added = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('image', file);
        const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        const count = await api.get('/banner/all').then(r => r.data.length);
        const slideRes = await api.post('/banner', { imageUrl: res.data.url, alt: file.name, order: count });
        setSlides(s => [...s, slideRes.data]);
        added++;
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    if (added > 0) toast.success(`${added} slide${added > 1 ? 's' : ''} uploaded!`);
    setUploading(false);
    fileRef.current.value = '';
  };

  const toggle = async (slide) => {
    const res = await api.put(`/banner/${slide._id}`, { isActive: !slide.isActive });
    setSlides(s => s.map(x => x._id === slide._id ? res.data : x));
    toast.success(res.data.isActive ? 'Slide shown.' : 'Slide hidden.');
  };

  const del = async (id) => {
    if (!confirm('Delete this slide permanently?')) return;
    await api.delete(`/banner/${id}`);
    setSlides(s => s.filter(x => x._id !== id));
    toast.success('Slide deleted.');
  };

  const updateAlt = async (slide, alt) => {
    const res = await api.put(`/banner/${slide._id}`, { alt });
    setSlides(s => s.map(x => x._id === slide._id ? res.data : x));
  };

  const activeCount = slides.filter(s => s.isActive).length;

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Slides</h1>
          <p className="text-gray-500 text-sm mt-1">
            {slides.length} total · <span className="text-green-600 font-medium">{activeCount} active</span> · {slides.length - activeCount} hidden
          </p>
        </div>
        <label className={`flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Uploading…' : 'Upload Slides'}
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} className="sr-only" />
        </label>
      </div>

      {/* Upload drop hint */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 text-sm text-blue-700">
        💡 You can upload multiple slides at once. Recommended size: <strong>1400×500px</strong> or wider. Formats: JPG, PNG, WEBP.
      </div>

      {/* Slides grid */}
      {slides.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={28} className="text-purple-400" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">No banner slides yet</p>
          <p className="text-sm text-gray-400">Click "Upload Slides" to add your first banner image</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {slides.map((slide, i) => (
            <div key={slide._id} className={`bg-white rounded-xl border border-gray-100 overflow-hidden transition-opacity ${!slide.isActive ? 'opacity-60' : ''}`}>
              <div className="flex gap-4 p-4 items-start">
                {/* Slide number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                  {i + 1}
                </div>

                {/* Image preview */}
                <div className="flex-shrink-0 w-48 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                  <img
                    src={resolveUrl(slide.imageUrl)}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-gray-300">
                    <ImageIcon size={24} />
                  </div>
                </div>

                {/* Info + alt text editor */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {slide.isActive ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-xs text-gray-400 truncate max-w-xs">{slide.imageUrl?.split('/').pop()}</span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Alt text (for SEO)</label>
                    <input
                      defaultValue={slide.alt}
                      onBlur={e => { if (e.target.value !== slide.alt) updateAlt(slide, e.target.value); }}
                      className="w-full max-w-xs px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe this image..."
                    />
                  </div>
                  <p className="text-xs text-gray-400">Stored as base64 in database</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggle(slide)}
                    title={slide.isActive ? 'Hide slide' : 'Show slide'}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                      slide.isActive
                        ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {slide.isActive ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                  </button>
                  <button
                    onClick={() => del(slide._id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>

              {/* Full-width image preview on hover — shown at the bottom */}
              <div className="border-t border-gray-50 bg-gray-50 px-4 py-2">
                <img
                  src={resolveUrl(slide.imageUrl)}
                  alt={slide.alt}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={e => { e.target.parentNode.style.display = 'none'; }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;
}
