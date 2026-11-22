import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Plus, Leaf } from 'lucide-react';
import { Product } from '../../types';

interface LatestProductsSliderProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const LatestProductsSlider: React.FC<LatestProductsSliderProps> = ({
  products,
  onViewProduct,
  onAddToCart,
}) => {
  // Sort by createdAt descending and take latest 5 active published products
  const latestFive = [...products]
    .filter((p) => p.status !== 'draft' && p.status !== 'archived')
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 6 seconds
  useEffect(() => {
    if (latestFive.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % latestFive.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [latestFive.length]);

  if (latestFive.length === 0) return null;

  const currentProduct = latestFive[currentIndex];
  const money = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const hasCustomImage = currentProduct.thumbnail || (currentProduct.images && currentProduct.images[0]);

  return (
    <section
      className="section product-section"
      style={{
        background: '#faf8f2',
        borderTop: '1px solid #eae7dd',
        borderBottom: '1px solid #eae7dd',
        padding: '60px 0',
      }}
    >
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 30px' }}>
        <div className="section-heading" style={{ marginBottom: '32px' }}>
          <div>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} /> LATEST ADDITIONS · HARVESTED & CRAFTED
            </div>
            <h2>New Botanical Creations</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + latestFive.length) % latestFive.length)}
              aria-label="Previous product"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid #d5d3c8',
                background: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: '12px', color: '#77786e', minWidth: '40px', textAlign: 'center' }}>
              0{currentIndex + 1} / 0{latestFive.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % latestFive.length)}
              aria-label="Next product"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid #d5d3c8',
                background: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Featured Slider Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            background: '#fff',
            border: '1px solid #e7e5dc',
            overflow: 'hidden',
          }}
        >
          {/* Visual Showcase (Clickable) */}
          <div
            onClick={() => onViewProduct(currentProduct)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              minHeight: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f2f0e6',
              overflow: 'hidden',
            }}
          >
            {hasCustomImage ? (
              <img
                src={hasCustomImage}
                alt={currentProduct.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  maxHeight: '420px',
                  transition: 'transform 0.4s ease',
                }}
              />
            ) : (
              <div
                className={`product-art art-${currentProduct.accent || 'sage'} product-art-large`}
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

            {currentProduct.label && (
              <span
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  background: '#2d3029',
                  color: '#fff',
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  textTransform: 'uppercase',
                }}
              >
                {currentProduct.label}
              </span>
            )}
          </div>

          {/* Narrative & Details */}
          <div
            style={{
              padding: '40px 44px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div className="eyebrow" style={{ color: '#68775e' }}>{currentProduct.category}</div>
            <h3
              onClick={() => onViewProduct(currentProduct)}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '30px',
                fontWeight: 500,
                margin: '8px 0 12px',
                cursor: 'pointer',
                lineHeight: '1.2',
              }}
            >
              {currentProduct.name}
            </h3>

            <div style={{ fontSize: '13px', color: '#686a61', fontStyle: 'italic', marginBottom: '16px' }}>
              {currentProduct.note}
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#4d5047', marginBottom: '22px' }}>
              {currentProduct.shortDescription || currentProduct.description.slice(0, 160) + '...'}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '26px' }}>
              <span style={{ fontSize: '22px', fontWeight: 600, color: '#2d3029' }}>
                {money(currentProduct.price)}
              </span>
              {currentProduct.compareAt && (
                <del style={{ fontSize: '14px', color: '#8d8f85' }}>{money(currentProduct.compareAt)}</del>
              )}
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                className="button button-dark"
                onClick={() => onAddToCart(currentProduct)}
                style={{ minWidth: '150px' }}
              >
                Add to bag <Plus size={16} style={{ marginLeft: '6px' }} />
              </button>
              <button
                className="button button-outline"
                onClick={() => onViewProduct(currentProduct)}
              >
                View details <ArrowRight size={15} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          </div>
        </div>

        {/* 5 Indicator Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '22px' }}>
          {latestFive.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === currentIndex ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentIndex ? '#354332' : '#d5d3c8',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default LatestProductsSlider;
