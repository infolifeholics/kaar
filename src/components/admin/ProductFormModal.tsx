import React, { useState } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Product } from '../../types';
import { saveProduct, uploadProductImage } from '../../services/productService';

interface ProductFormModalProps {
  initialProduct?: Product | null;
  categories: string[];
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  categories,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [category, setCategory] = useState(initialProduct?.category || categories[0] || 'Daily Rituals');
  const [subcategory, setSubcategory] = useState(initialProduct?.subcategory || '');
  const [price, setPrice] = useState(initialProduct?.price ? String(initialProduct.price) : '');
  const [compareAt, setCompareAt] = useState(initialProduct?.compareAt ? String(initialProduct.compareAt) : '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [note, setNote] = useState(initialProduct?.note || 'Mindful · Natural · Balanced');
  const [accent, setAccent] = useState(initialProduct?.accent || 'sage');
  const [label, setLabel] = useState(initialProduct?.label || '');
  const [bestseller, setBestseller] = useState(initialProduct?.bestseller || false);
  const [newArrival, setNewArrival] = useState(initialProduct?.newArrival || false);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured || false);
  const [stockQuantity, setStockQuantity] = useState(initialProduct?.stockQuantity ? String(initialProduct.stockQuantity) : '50');
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>(
    initialProduct?.stockStatus || 'in_stock'
  );
  const [sku, setSku] = useState(initialProduct?.sku || `KAAR-${Date.now().toString().slice(-6)}`);
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(
    initialProduct?.status || 'published'
  );
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || '');

  // Images state
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Features list state
  const [features, setFeatures] = useState<string[]>(
    initialProduct?.features || ['Cold-pressed organic ingredients', 'Handcrafted according to Ayurvedic texts']
  );
  const [newFeatureText, setNewFeatureText] = useState('');

  // Specifications state
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initialProduct?.specifications
      ? Object.entries(initialProduct.specifications).map(([key, value]) => ({ key, value }))
      : [
          { key: 'Volume / Size', value: '100ml / 3.4 fl oz' },
          { key: 'Dosha', value: 'Tridoshic (Vata, Pitta, Kapha)' },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug when name changes if not editing
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadProductImage(file);
      setImages((prev) => [...prev, url]);
    } catch {
      setError('Could not process image upload. Try another file.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures((prev) => [...prev, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', text: string) => {
    setSpecs((prev) => {
      const copy = [...prev];
      copy[index][field] = text;
      return copy;
    });
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!price || isNaN(Number(price))) {
      setError('A valid product price is required.');
      return;
    }

    setSaving(true);
    setError('');

    const specObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specObj[s.key.trim()] = s.value.trim();
      }
    });

    try {
      const saved = await saveProduct({
        id: initialProduct?.id,
        name: name.trim(),
        slug: slug.trim(),
        category,
        subcategory: subcategory.trim(),
        price: Number(price),
        compareAt: compareAt ? Number(compareAt) : undefined,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        note: note.trim(),
        accent,
        label: label.trim(),
        bestseller,
        newArrival,
        isFeatured,
        stockQuantity: Number(stockQuantity) || 0,
        stockStatus,
        sku: sku.trim(),
        status,
        images,
        thumbnail: images[0] || initialProduct?.thumbnail || '',
        features: features.filter(Boolean),
        specifications: specObj,
        seoTitle: seoTitle.trim(),
        seoDescription: seoDescription.trim(),
        createdAt: initialProduct?.createdAt,
      });

      onSaved(saved);
      onClose();
    } catch {
      setError('Failed to save product to database. Please check connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay checkout-overlay" onClick={onClose} style={{ zIndex: 150 }}>
      <div
        className="checkout-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '920px', width: '100%' }}
      >
        <header className="checkout-header">
          <div>
            <span className="eyebrow">PRODUCT MANAGEMENT</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', margin: '4px 0 0' }}>
              {isEditing ? `Edit: ${initialProduct?.name}` : 'Add New Ayurvedic Product'}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close dialog">
            <X size={21} />
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ padding: '30px 40px' }}>
          {error && (
            <div
              style={{
                background: '#fdf2f2',
                border: '1px solid #f8b4b4',
                color: '#9b1c1c',
                padding: '12px',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Core Information Section */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#3d4036', marginBottom: '14px', borderBottom: '1px solid #e7e5dc', paddingBottom: '6px' }}>
              1. Basic Identification
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '14px' }}>
              <label className="checkout-form label" style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Product Name *</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Kumkumadi Radiant Facial Oil"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>URL Slug</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kumkumadi-radiant-facial-oil"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px', background: '#faf9f5' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '14px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Category *</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px', background: '#fff' }}
                >
                  {Array.from(new Set(categories.length > 0 ? categories : [
                    'Ritual Oils', 'Daily Rituals', 'Aromatherapy', 'Herbal Blends', 'Skin Rituals', 'Home Rituals'
                  ])).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Subcategory</span>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Body Oils, Tea, Masques"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Visual Accent Theme</span>
                <select
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px', background: '#fff' }}
                >
                  <option value="clay">Clay (Warm Earth)</option>
                  <option value="sage">Sage (Soft Botanical Green)</option>
                  <option value="rose">Rose (Blush Petal)</option>
                  <option value="cream">Cream (Quiet Sunlight)</option>
                  <option value="ochre">Ochre (Golden Turmeric)</option>
                  <option value="forest">Forest (Deep Herbal)</option>
                  <option value="night">Night (Deep Rest)</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Selling Price (₹) *</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1290"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Original / Compare (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={compareAt}
                  onChange={(e) => setCompareAt(e.target.value)}
                  placeholder="1490"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Stock Quantity</span>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="50"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>SKU Code</span>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="KAAR-KUM-07"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>
            </div>
          </div>

          {/* Descriptions and Sensory Notes */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#3d4036', marginBottom: '14px', borderBottom: '1px solid #e7e5dc', paddingBottom: '6px' }}>
              2. Descriptions & Sensory Poetry
            </h3>
            <div style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Sensory Note (Tagline displayed under title)</span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Warm · Ground · Restore"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Short Description (Card summary)</span>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A one-sentence intention for the product card."
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Full Ayurvedic Description</span>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed botanical narrative, ritual guidance, formulation philosophy and benefits..."
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', fontSize: '13px', lineHeight: '1.6' }}
                />
              </label>
            </div>
          </div>

          {/* Product Image Gallery & Cloud Upload */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#3d4036', marginBottom: '14px', borderBottom: '1px solid #e7e5dc', paddingBottom: '6px' }}>
              3. Product Imagery
            </h3>
            <p style={{ fontSize: '12px', color: '#77786e', margin: '0 0 12px' }}>
              Upload photographic assets to cloud storage. The first image will be used as the primary thumbnail. If no custom image is uploaded, Kaar's aesthetic botanical SVG will be rendered automatically.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'relative',
                    width: '90px',
                    height: '90px',
                    border: idx === 0 ? '2px solid #56644d' : '1px solid #deddd4',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {idx === 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: '#56644d',
                        color: '#fff',
                        fontSize: '9px',
                        textAlign: 'center',
                        padding: '2px 0',
                      }}
                    >
                      Primary
                    </span>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      display: 'flex',
                      gap: '3px',
                    }}
                  >
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        title="Make Primary"
                        style={{
                          background: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={11} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove"
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px',
                        cursor: 'pointer',
                        color: '#c53030',
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}

              <label
                style={{
                  width: '90px',
                  height: '90px',
                  border: '1px dashed #9ca3af',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#f9f9f6',
                  fontSize: '11px',
                  color: '#6b7280',
                  gap: '4px',
                }}
              >
                <Upload size={18} />
                <span>{uploadingImage ? 'Uploading...' : 'Add Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Features & Key Specifications */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#3d4036', marginBottom: '14px', borderBottom: '1px solid #e7e5dc', paddingBottom: '6px' }}>
              4. Features & Botanical Specifications
            </h3>

            {/* Feature Bullets */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                Key Features (Bullet points)
              </span>
              {features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => {
                      const copy = [...features];
                      copy[idx] = e.target.value;
                      setFeatures(copy);
                    }}
                    style={{ flex: 1, border: '1px solid #deddd4', padding: '8px 10px', fontSize: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    style={{ border: 'none', background: 'transparent', color: '#c53030', cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  placeholder="e.g. Free from synthetic perfumes and mineral oils"
                  style={{ flex: 1, border: '1px solid #deddd4', padding: '8px 10px', fontSize: '12px' }}
                />
                <button
                  type="button"
                  className="button button-outline"
                  onClick={handleAddFeature}
                  style={{ fontSize: '12px', height: '36px', padding: '0 14px' }}
                >
                  <Plus size={14} style={{ marginRight: '4px' }} /> Add Feature
                </button>
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                Specifications Table (Key-Value pairs)
              </span>
              {specs.map((spec, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '8px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    placeholder="Key (e.g. Volume)"
                    value={spec.key}
                    onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                    style={{ border: '1px solid #deddd4', padding: '8px 10px', fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 200ml / 6.7 fl oz)"
                    value={spec.value}
                    onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                    style={{ border: '1px solid #deddd4', padding: '8px 10px', fontSize: '12px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    style={{ border: 'none', background: 'transparent', color: '#c53030', cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="button button-outline"
                onClick={handleAddSpec}
                style={{ fontSize: '12px', height: '36px', padding: '0 14px', marginTop: '6px' }}
              >
                <Plus size={14} style={{ marginRight: '4px' }} /> Add Specification Row
              </button>
            </div>
          </div>

          {/* Visibility, Badges & Publication Status */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#3d4036', marginBottom: '14px', borderBottom: '1px solid #e7e5dc', paddingBottom: '6px' }}>
              5. Publishing & Badges
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Publishing Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')}
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px', background: '#fff' }}
                >
                  <option value="published">Published (Live on Store)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Stock Status</span>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as 'in_stock' | 'low_stock' | 'out_of_stock')}
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px', background: '#fff' }}
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Badge Label</span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Bestseller, New arrival"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '24px', padding: '12px 14px', background: '#faf9f5', border: '1px solid #e7e5dc' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={bestseller}
                  onChange={(e) => setBestseller(e.target.checked)}
                />
                Mark as Bestseller
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={newArrival}
                  onChange={(e) => setNewArrival(e.target.checked)}
                />
                Mark as New Arrival
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                Featured on Homepage Slider
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>SEO Meta Title</span>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Kumkumadi Oil | Kaar Ayurveda"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500 }}>SEO Meta Description</span>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Short description for search engines"
                  style={{ border: '1px solid #deddd4', padding: '10px 12px', height: '42px', fontSize: '13px' }}
                />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', borderTop: '1px solid #e7e5dc', paddingTop: '20px' }}>
            <button
              type="button"
              className="text-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-dark"
              disabled={saving}
              style={{ minWidth: '160px' }}
            >
              {saving ? 'Saving to Database...' : isEditing ? 'Update Product' : 'Create & Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProductFormModal;
