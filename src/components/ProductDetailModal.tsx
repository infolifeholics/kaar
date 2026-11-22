import React, { useState } from 'react';
import {
  X,
  Star,
  Leaf,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const money = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const allImages: string[] = product.images && product.images.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : [];

  const hasImages = allImages.length > 0;
  const currentImage = hasImages ? allImages[selectedImageIndex] || allImages[0] : null;

  return (
    <div className="overlay checkout-overlay" onClick={onClose} style={{ zIndex: 130 }}>
      <div
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1020px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) 1.25fr',
          padding: 0,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close product view"
          style={{ zIndex: 10 }}
        >
          <X size={20} />
        </button>

        {/* Gallery Column */}
        <div
          style={{
            background: '#faf8f2',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRight: '1px solid #ece9df',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: '2px',
            }}
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div
                className={`product-art art-${product.accent || 'sage'} product-art-large`}
                style={{ width: '100%', height: '100%' }}
              >
                <div className="art-orb" />
                <div className="art-bottle">
                  <span>KAAR</span>
                  <small>AYURVEDA</small>
                </div>
                <div className="art-leaf leaf-one"><Leaf size={52} /></div>
                <div className="art-leaf leaf-two"><Leaf size={40} /></div>
              </div>
            )}
          </div>

          {/* Thumbnails list if multiple images exist */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', overflowX: 'auto', maxWidth: '100%' }}>
              {allImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: '54px',
                    height: '54px',
                    padding: 0,
                    border: idx === selectedImageIndex ? '2px solid #354332' : '1px solid #d5d3c8',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Narrative & Purchase Column */}
        <div style={{ padding: '40px 44px', overflowY: 'auto', maxHeight: '82vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow" style={{ color: '#56664d' }}>{product.category}</span>
            {product.label && (
              <span
                style={{
                  background: '#f2f0e6',
                  color: '#34382e',
                  fontSize: '10px',
                  letterSpacing: '0.06em',
                  padding: '3px 8px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {product.label}
              </span>
            )}
          </div>

          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '32px',
              fontWeight: 500,
              margin: '8px 0 10px',
              lineHeight: '1.2',
            }}
          >
            {product.name}
          </h2>

          <div style={{ fontSize: '13px', color: '#686a60', fontStyle: 'italic', marginBottom: '14px' }}>
            {product.note}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: '#2d3029' }}>
              {money(product.price)}
            </span>
            {product.compareAt && (
              <del style={{ fontSize: '15px', color: '#88897e' }}>{money(product.compareAt)}</del>
            )}
          </div>

          <div className="rating" style={{ marginBottom: '20px' }}>
            <Star size={14} fill="currentColor" /> 4.9 · Handcrafted small batch
          </div>

          <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#44463e', marginBottom: '22px' }}>
            {product.description}
          </p>

          {/* Key Features */}
          {product.features && product.features.length > 0 && (
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#67695f', marginBottom: '10px' }}>
                Formulation Highlights
              </h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {product.features.map((feat: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#3d4036' }}>
                    <Check size={14} color="#55694b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div style={{ marginBottom: '24px', background: '#faf9f5', padding: '14px 18px', border: '1px solid #ece9df' }}>
              <div style={{ display: 'grid', gap: '8px', fontSize: '12px' }}>
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0eee5', paddingBottom: '4px' }}>
                    <span style={{ color: '#77786e' }}>{key}</span>
                    <strong style={{ fontWeight: 500, color: '#33362d' }}>{String(val)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Actions */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '24px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #deddd4',
                height: '46px',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: '36px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                -
              </button>
              <span style={{ width: '36px', textAlign: 'center', fontSize: '13px' }}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                style={{ width: '36px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                +
              </button>
            </div>

            <button
              className="button button-dark"
              onClick={() => {
                onAddToCart(product, quantity);
                onClose();
              }}
              style={{ flex: 1, height: '46px' }}
            >
              Add to ritual bag ({money(product.price * quantity)}) <ShoppingBag size={16} style={{ marginLeft: '6px' }} />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f0eee5',
              fontSize: '11px',
              color: '#77786e',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Truck size={13} /> Free delivery over ₹1,500
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={13} /> 100% Botanical Authenticity
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailModal;
