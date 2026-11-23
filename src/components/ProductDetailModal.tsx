import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  MessageSquare,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '../types';
import { submitProductReview } from '../services/reviewService';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  initialTab?: 'details' | 'review';
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  initialTab = 'details',
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'review'>(initialTab);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Review Form States
  const [userName, setUserName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const money = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const allImages: string[] = product.images && product.images.length > 0
    ? product.images
    : product.thumbnail
      ? [product.thumbnail]
      : [];

  const hasImages = allImages.length > 0;
  const currentImage = hasImages ? allImages[selectedImageIndex] || allImages[0] : null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !reviewText.trim()) {
      setReviewError('Please provide your name and review text.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      await submitProductReview({
        userName: userName.trim(),
        review: reviewText.trim(),
        productId: product.id,
        productName: product.name,
        rating,
      });
      setReviewSubmitted(true);
      setUserName('');
      setReviewText('');
    } catch {
      setReviewError('Unable to submit your review at this moment. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="overlay checkout-overlay" onClick={onClose}>
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
          borderRadius: '4px',
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
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {hasImages && allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: '54px',
                    height: '54px',
                    border: idx === selectedImageIndex ? '2px solid #354332' : '1px solid #dfdcd3',
                    padding: '2px',
                    background: '#fff',
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

        {/* Narrative & Review Column */}
        <div style={{ padding: '36px 40px', overflowY: 'auto', maxHeight: '88vh' }}>
          {/* Top Quick Navigation Tabs (Product Details vs Write a Review) */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              borderBottom: '1px solid #e7e5dc',
              paddingBottom: '12px',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                fontWeight: activeTab === 'details' ? 600 : 400,
                color: activeTab === 'details' ? '#354332' : '#77786e',
                borderBottom: activeTab === 'details' ? '2px solid #354332' : '2px solid transparent',
                paddingBottom: '6px',
                cursor: 'pointer',
              }}
            >
              Overview & Ritual
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                fontWeight: activeTab === 'review' ? 600 : 400,
                color: activeTab === 'review' ? '#354332' : '#77786e',
                borderBottom: activeTab === 'review' ? '2px solid #354332' : '2px solid transparent',
                paddingBottom: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MessageSquare size={14} /> Write a Review
            </button>
          </div>

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
              fontSize: '28px',
              fontWeight: 500,
              margin: '8px 0 6px',
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
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              style={{
                marginLeft: 'auto',
                background: '#f6f5ee',
                border: '1px solid #e0ddd0',
                padding: '4px 10px',
                borderRadius: '3px',
                fontSize: '11px',
                color: '#354332',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
              }}
            >
              <Star size={12} fill="#c49a45" color="#c49a45" /> Write Review
            </button>
          </div>

          {activeTab === 'details' ? (
            <>
              <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#44463e', marginBottom: '20px' }}>
                {product.description}
              </p>

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7a7b70', marginBottom: '10px' }}>
                    Conscious Formulation
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
                <div style={{ marginBottom: '22px', background: '#faf9f5', padding: '12px 16px', border: '1px solid #ece9df' }}>
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
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '20px' }}>
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
            </>
          ) : null}

          {/* User Review Submission Section */}
          <div
            style={{
              marginTop: activeTab === 'review' ? '4px' : '28px',
              paddingTop: activeTab === 'review' ? '0' : '24px',
              borderTop: activeTab === 'review' ? 'none' : '1px solid #e7e4dc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MessageSquare size={17} color="#354332" />
              <h4
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '19px',
                  fontWeight: 600,
                  color: '#2e3328',
                  margin: 0,
                }}
              >
                Customer Review for {product.name}
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: '#74776c', margin: '0 0 16px', lineHeight: 1.5 }}>
              Share your genuine feedback with our community. Your review will be submitted directly to our curation team and published to the community wall upon approval.
            </p>

            {reviewSubmitted ? (
              <div
                style={{
                  background: '#f1f6ec',
                  border: '1px solid #cfe0c5',
                  padding: '18px 20px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '12px',
                }}
              >
                <CheckCircle2 size={26} color="#486d34" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#344e26' }}>
                    Thank you, {userName || 'fellow ritualist'}!
                  </div>
                  <div style={{ fontSize: '12px', color: '#576a4e', marginTop: '2px' }}>
                    Your review has been submitted to the admin for verification. It will appear on the community wall as soon as it is approved.
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewSubmitted(false)}
                    style={{
                      marginTop: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#344e26',
                      textDecoration: 'underline',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Submit another review
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'grid', gap: '14px' }}>
                {reviewError && (
                  <div style={{ color: '#b91c1c', fontSize: '12px', background: '#fef2f2', padding: '8px 12px', borderRadius: '3px' }}>
                    {reviewError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#686b60', marginBottom: '6px', fontWeight: 600 }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KAAR "
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #dedbd0',
                      background: '#faf9f5',
                      fontSize: '13px',
                      borderRadius: '3px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#686b60', marginBottom: '6px', fontWeight: 600 }}>
                    Ritual Experience Rating
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '3px',
                          color: star <= rating ? '#c49a45' : '#d2d0c7',
                        }}
                      >
                        <Star size={22} fill={star <= rating ? '#c49a45' : 'none'} />
                      </button>
                    ))}
                    <span style={{ fontSize: '12px', color: '#77786e', marginLeft: '6px' }}>
                      {rating} out of 5 stars
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#686b60', marginBottom: '6px', fontWeight: 600 }}>
                    Your Detailed Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your genuine experience with this product: aroma, texture, how it made you feel, and results..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      border: '1px solid #dedbd0',
                      background: '#faf9f5',
                      fontSize: '13px',
                      borderRadius: '3px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="button button-dark"
                    style={{
                      height: '42px',
                      padding: '0 24px',
                      fontSize: '11px',
                      opacity: submittingReview ? 0.6 : 1,
                    }}
                  >
                    {submittingReview ? 'Submitting Review...' : 'Submit Review'} <Send size={13} style={{ marginLeft: '6px' }} />
                  </button>

                  {activeTab === 'review' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="text-button"
                      style={{ fontSize: '12px', color: '#77786e' }}
                    >
                      Back to details
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetailModal;
