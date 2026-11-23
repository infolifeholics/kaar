import React, { useRef, useState, useEffect } from 'react';
import {
  Star,
  MessageSquareQuote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  PlusCircle,
  X,
  Send,
} from 'lucide-react';
import { Review, Product } from '../../types';
import { submitProductReview } from '../../services/reviewService';

interface TestimonialTickerProps {
  reviews: Review[];
  products: Product[];
  onOpenProduct?: (product: Product) => void;
}

export const TestimonialTicker: React.FC<TestimonialTickerProps> = ({
  reviews,
  products,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Modal for Adding Review / Feedback from Testimonials Section
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackProduct, setFeedbackProduct] = useState<string>('General Experience');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter approved reviews only
  const approvedList = reviews.filter((r) => r.status === 'approved' || !r.status);
  const displayList = approvedList.length > 0 ? approvedList : [];

  // Double list for infinite smooth marquee effect
  const marqueeItems = [...displayList, ...displayList];

  // Auto-scroll loop
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || displayList.length === 0) return;

    let animationFrameId: number;
    const speed = 0.65; // Pixels per frame

    const step = () => {
      if (!isPaused && el) {
        el.scrollLeft += speed;
        // When first set of items is completely scrolled past, loop back seamlessly
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, displayList.length]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackText.trim()) {
      setErrorMessage('Please fill in your name and review details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await submitProductReview({
        userName: feedbackName.trim(),
        review: feedbackText.trim(),
        productName: feedbackProduct,
        rating: feedbackRating,
      });
      setSubmittedSuccess(true);
      setFeedbackName('');
      setFeedbackText('');
    } catch {
      setErrorMessage('Could not submit feedback at this time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="testimonials-section-wrapper" id="testimonials">
      <style>{`
        .testimonials-section-wrapper {
          padding: 68px 0 76px;
          background: #fbf9f4;
          border-top: 1px solid rgba(52, 69, 43, 0.08);
          border-bottom: 1px solid rgba(52, 69, 43, 0.08);
          position: relative;
          overflow: hidden;
        }

        .testimonials-header-container {
          max-width: 1240px;
          margin: 0 auto 32px;
          padding: 0 5%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
        }

        .testimonials-header-left {
          max-width: 620px;
        }

        .testimonials-eyebrow {
          font-size: 10px;
          letter-spacing: 0.22em;
          font-weight: 600;
          color: #a18b64;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .testimonials-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 500;
          color: #34452b;
          line-height: 1.15;
          margin: 0;
        }

        .testimonials-title em {
          color: #79a64f;
          font-style: italic;
        }

        .testimonials-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .testimonials-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 16px;
          background: #34452b;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .testimonials-add-btn:hover {
          background: #24311e;
          transform: translateY(-1px);
        }

        .testimonial-nav-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #dcd7ca;
          background: #fff;
          color: #34452b;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .testimonial-nav-btn:hover {
          background: #34452b;
          color: #fff;
          border-color: #34452b;
        }

        .testimonial-scroll-viewport {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 10px 5% 24px;
          cursor: grab;
        }

        .testimonial-scroll-viewport::-webkit-scrollbar {
          display: none;
        }

        .testimonial-scroll-viewport:active {
          cursor: grabbing;
        }

        /* Review Card */
        .testimonial-card-item {
          flex: 0 0 290px;
          background: #ffffff;
          border: 1px solid #ece7dc;
          border-radius: 4px;
          padding: 24px 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 18px rgba(41, 42, 36, 0.03);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        @media (min-width: 640px) {
          .testimonial-card-item {
            flex: 0 0 340px;
            padding: 26px 24px;
          }
        }

        @media (min-width: 1024px) {
          .testimonial-card-item {
            flex: 0 0 370px;
            padding: 28px 26px;
          }
        }

        .testimonial-card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(52, 69, 43, 0.08);
          border-color: #79a64f;
        }

        .testimonial-rating-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .testimonial-stars {
          display: flex;
          gap: 3px;
          color: #c49a45;
        }

        .testimonial-product-pill {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #f4f1e8;
          color: #606859;
          padding: 3px 8px;
          border-radius: 2px;
          max-width: 170px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .testimonial-review-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: #3b3f36;
          margin: 0 0 18px 0;
          font-style: normal;
          min-height: 68px;
        }

        .testimonial-author-block {
          display: flex;
          align-items: center;
          gap: 12px;
          border-top: 1px solid #f0ece3;
          padding-top: 14px;
        }

        .testimonial-author-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e9ece4;
          color: #34452b;
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-size: 14px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .testimonial-author-info {
          display: flex;
          flex-direction: column;
        }

        .testimonial-author-name {
          font-size: 13px;
          font-weight: 600;
          color: #262922;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .testimonial-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          color: #658448;
          font-weight: 400;
        }
      `}</style>

      {/* Section Header */}
      <div className="testimonials-header-container">
        <div className="testimonials-header-left">
          <div className="testimonials-eyebrow">
            <MessageSquareQuote size={13} /> Community Voices · Real Experiences
          </div>
          <h2 className="testimonials-title">
            Words from those who walk this <em>natural rhythm.</em>
          </h2>
        </div>

        <div className="testimonials-actions">
          <button
            className="testimonials-add-btn"
            onClick={() => {
              setIsFeedbackModalOpen(true);
              setSubmittedSuccess(false);
            }}
          >
            <PlusCircle size={15} /> Add Review / Feedback
          </button>
        </div>
      </div>

      {/* Continuous Slowly Scrolling Cards */}
      <div
        className="testimonial-scroll-viewport"
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {marqueeItems.map((item, index) => {
          const initials = item.userName
            ? item.userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
            : 'KR';

          return (
            <div key={`${item.id}-${index}`} className="testimonial-card-item">
              <div>
                <div className="testimonial-rating-row">
                  <div className="testimonial-stars">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="#c49a45" color="#c49a45" />
                    ))}
                  </div>
                  {item.productName && (
                    <span className="testimonial-product-pill" title={item.productName}>
                      {item.productName}
                    </span>
                  )}
                </div>

                <p className="testimonial-review-body">
                  “{item.review}”
                </p>
              </div>

              <div className="testimonial-author-block">
                <div className="testimonial-author-avatar">{initials}</div>
                <div className="testimonial-author-info">
                  <span className="testimonial-author-name">
                    {item.userName}
                    <CheckCircle2 size={13} color="#658448" />
                  </span>
                  <span className="testimonial-verified-badge">
                    Verified Ritualist
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Review / Feedback Modal */}
      {isFeedbackModalOpen && (
        <div
          className="overlay checkout-overlay"
          onClick={() => setIsFeedbackModalOpen(false)}
          style={{ zIndex: 140 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              maxWidth: '520px',
              width: '92%',
              margin: 'auto',
              borderRadius: '4px',
              padding: '28px 28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsFeedbackModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#555',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <MessageSquareQuote size={20} color="#34452b" />
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#2a3224',
                  margin: 0,
                }}
              >
                Share Your Ritual Experience
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#74776c', margin: '0 0 20px', lineHeight: 1.5 }}>
              Your words inspire our community. Share your authentic experience below, and our admin team will publish it to the community wall.
            </p>

            {submittedSuccess ? (
              <div
                style={{
                  background: '#f1f6ec',
                  border: '1px solid #cfe0c5',
                  padding: '20px',
                  borderRadius: '4px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={32} color="#486d34" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: '#2f4c20' }}>
                  Thank you for your feedback!
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#576a4e', lineHeight: 1.6 }}>
                  Your review has been submitted to the admin panel. Once approved, it will be added to the live testimonials carousel.
                </p>
                <button
                  className="button button-dark"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  style={{ height: '38px', padding: '0 20px', fontSize: '11px' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} style={{ display: 'grid', gap: '14px' }}>
                {errorMessage && (
                  <div style={{ color: '#b91c1c', fontSize: '12px', background: '#fef2f2', padding: '8px 12px', borderRadius: '3px' }}>
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#686b60', marginBottom: '6px', fontWeight: 600 }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Megha ..."
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
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
                    Rating
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '3px',
                          color: star <= feedbackRating ? '#c49a45' : '#d2d0c7',
                        }}
                      >
                        <Star size={22} fill={star <= feedbackRating ? '#c49a45' : 'none'} />
                      </button>
                    ))}
                    <span style={{ fontSize: '12px', color: '#77786e', marginLeft: '6px' }}>
                      {feedbackRating} / 5 stars
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#686b60', marginBottom: '6px', fontWeight: 600 }}>
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How did this botanical ritual impact your routine, energy, and feeling?"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button button-dark"
                  style={{
                    height: '42px',
                    fontSize: '11px',
                    opacity: isSubmitting ? 0.6 : 1,
                    marginTop: '4px',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'} <Send size={13} style={{ marginLeft: '6px' }} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default TestimonialTicker;
