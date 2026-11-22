import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Plus, Leaf } from 'lucide-react';
import { Product } from '../../types';

interface HeroProductShowcaseProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const HeroProductShowcase: React.FC<HeroProductShowcaseProps> = ({
  products,
  onViewProduct,
  onAddToCart,
}) => {
  // Take latest 5 published products
  const latestFive = [...products]
    .filter((p) => p.status !== 'draft' && p.status !== 'archived')
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 6 seconds
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
    <div className="hero-product-showcase">
      <style>{`
        .hero-product-showcase {
          position: relative;
          width: 100%;
        }

        .hero-showcase-card {
          position: relative;
          height: 480px;
          border-radius: 4px;
          overflow: hidden;
          background: #758966;
          box-shadow: 0 16px 40px rgba(45, 53, 39, 0.12);
        }

        @media (max-width: 900px) {
          .hero-showcase-card {
            height: 400px;
          }
        }

        @media (max-width: 560px) {
          .hero-showcase-card {
            height: 350px;
          }
        }

        .hero-showcase-image-wrap {
          width: 100%;
          height: 100%;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #b7b996;
        }

        .hero-showcase-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        /* Glassmorphic Overlay for Details directly over the Image */
        .hero-showcase-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(20, 27, 18, 0.92) 0%, rgba(20, 27, 18, 0.72) 65%, rgba(20, 27, 18, 0) 100%);
          padding: 30px 24px 20px;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .hero-showcase-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(45, 48, 41, 0.9);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 2px;
          z-index: 2;
        }

        .hero-showcase-nav-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: rgba(30, 40, 26, 0.65);
          backdrop-filter: blur(6px);
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .hero-showcase-nav-btn:hover {
          background: rgba(30, 40, 26, 0.9);
        }

        .hero-showcase-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hero-showcase-dot {
          height: 6px;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
      `}</style>

      <div className="hero-showcase-card">
        {/* Badge */}
        <span className="hero-showcase-badge">
          {currentProduct.label || 'Latest Harvest'}
        </span>

        {/* Product Media */}
        <div
          className="hero-showcase-image-wrap"
          onClick={() => onViewProduct(currentProduct)}
          title={`View ${currentProduct.name}`}
        >
          {hasCustomImage ? (
            <img
              src={hasCustomImage}
              alt={currentProduct.name}
              className="hero-showcase-img"
            />
          ) : (
            <div
              className={`product-art art-${currentProduct.accent || 'clay'} product-art-large`}
              style={{ width: '100%', height: '100%' }}
            >
              <div className="art-orb" />
              <div className="art-bottle">
                <span>KAAR</span>
                <small>AYURVEDA</small>
              </div>
              <div className="art-leaf leaf-one"><Leaf size={74} /></div>
              <div className="art-leaf leaf-two"><Leaf size={45} /></div>
            </div>
          )}

          {/* Details & Price Overlay */}
          <div className="hero-showcase-overlay" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c3cfb8' }}>
                  {currentProduct.category}
                </span>
                <h3
                  onClick={() => onViewProduct(currentProduct)}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '22px',
                    margin: '3px 0',
                    cursor: 'pointer',
                    fontWeight: 500,
                    lineHeight: '1.2',
                    color: '#fff',
                  }}
                >
                  {currentProduct.name}
                </h3>
                <div style={{ fontSize: '11px', color: '#d8decb', fontStyle: 'italic' }}>
                  {currentProduct.note}
                </div>
              </div>

              {/* Price and Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                    {money(currentProduct.price)}
                  </div>
                  {currentProduct.compareAt && (
                    <del style={{ fontSize: '11px', color: '#a0a897' }}>{money(currentProduct.compareAt)}</del>
                  )}
                </div>

                <button
                  className="button button-light"
                  onClick={() => onAddToCart(currentProduct)}
                  style={{
                    minHeight: '34px',
                    padding: '0 14px',
                    fontSize: '11px',
                    borderRadius: '2px',
                  }}
                >
                  Add <Plus size={13} style={{ marginLeft: '4px' }} />
                </button>
              </div>
            </div>

            {/* Slider Controls Inside Card */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <div className="hero-showcase-dots">
                {latestFive.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className="hero-showcase-dot"
                    style={{
                      width: idx === currentIndex ? '22px' : '6px',
                      background: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="hero-showcase-nav-btn"
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + latestFive.length) % latestFive.length)}
                  aria-label="Previous product"
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '11px', color: '#d8decb', minWidth: '36px', textAlign: 'center' }}>
                  0{currentIndex + 1} / 0{latestFive.length}
                </span>
                <button
                  className="hero-showcase-nav-btn"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % latestFive.length)}
                  aria-label="Next product"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-caption" style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <span>0{currentIndex + 1} / 0{latestFive.length}</span>
        <button
          onClick={() => onViewProduct(currentProduct)}
          style={{ background: 'none', border: 'none', color: '#74766b', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          View ritual details <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
export default HeroProductShowcase;
