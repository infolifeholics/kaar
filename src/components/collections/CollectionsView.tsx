import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { Product } from '../../types';

interface CollectionsViewProps {
  products: Product[];
  categories: string[];
  initialCategory?: string;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBackToHome: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  products,
  initialCategory = 'all',
  onViewProduct,
  onAddToCart,
  onBackToHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('newest');

  const money = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  // Filter products by category, search query, and publish status
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.status !== 'draft' && p.status !== 'archived')
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesQuery = `${p.name} ${p.category} ${p.subcategory || ''} ${p.description}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') {
          const dA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dB - dA;
        }
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Distinct category list
  const allCategoryTabs = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  return (
    <div style={{ background: '#faf9f5', minHeight: '100vh', paddingTop: '20px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        {/* Breadcrumb Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#77786e',
            marginBottom: '20px',
          }}
        >
          <button
            onClick={onBackToHome}
            style={{ background: 'none', border: 'none', color: '#55584f', cursor: 'pointer', padding: 0 }}
          >
            Home
          </button>
          <ChevronRight size={13} />
          <span style={{ color: '#2d3029', fontWeight: 500 }}>Collections</span>
          {selectedCategory !== 'all' && (
            <>
              <ChevronRight size={13} />
              <span style={{ color: '#354332', fontWeight: 600 }}>{selectedCategory}</span>
            </>
          )}
        </div>

        {/* Blinkit-Inspired Category Discovery Carousel */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
            <div>
              <span className="eyebrow" style={{ color: '#56664d' }}>EXPLORE BY INTENTION</span>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', margin: '4px 0 0', fontWeight: 500 }}>
                Ayurvedic & Sacred Collections
              </h1>
            </div>
            <span style={{ fontSize: '13px', color: '#77786e' }}>
              Showing {filteredProducts.length} rituals
            </span>
          </div>

          {/* Category Chips Bar */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
            }}
          >
            {allCategoryTabs.map((cat) => {
              const count =
                cat === 'all'
                  ? products.filter((p) => p.status !== 'draft').length
                  : products.filter((p) => p.category.toLowerCase() === cat.toLowerCase() && p.status !== 'draft').length;

              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '24px',
                    border: isSelected ? '1px solid #354332' : '1px solid #dcdad0',
                    background: isSelected ? '#354332' : '#fff',
                    color: isSelected ? '#fff' : '#4d5048',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{cat === 'all' ? 'All Collections' : cat}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      opacity: 0.8,
                      background: isSelected ? 'rgba(255,255,255,0.2)' : '#f0eee5',
                      padding: '1px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e7e5dc',
            padding: '14px 20px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
            <Search size={16} color="#77786e" />
            <input
              type="text"
              placeholder="Search botanical remedies, oils, chai, mists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '13px',
                background: 'transparent',
              }}
            />
          </div>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SlidersHorizontal size={14} color="#77786e" />
            <span style={{ fontSize: '12px', color: '#77786e' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'newest')}
              style={{
                padding: '6px 12px',
                border: '1px solid #deddd4',
                fontSize: '12px',
                background: '#faf9f5',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Latest Harvested</option>
              <option value="featured">Bestsellers & Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Blinkit-Style Responsive Product Grid */}
        {filteredProducts.length === 0 ? (
          <div
            style={{
              background: '#fff',
              border: '1px solid #e7e5dc',
              padding: '60px 20px',
              textAlign: 'center',
              borderRadius: '4px',
            }}
          >
            <ShoppingBag size={40} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#33362d', margin: '0 0 6px' }}>
              No rituals found in this collection
            </h3>
            <p style={{ fontSize: '13px', color: '#77786e', margin: '0 0 16px' }}>
              Try selecting another category or clearing your search term.
            </p>
            <button
              className="button button-outline"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              View All Collections
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredProducts.map((product) => {
              const hasImage = product.thumbnail || (product.images && product.images[0]);
              const discount = product.compareAt
                ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e7e5dc',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                >
                  {/* Visual Image Header */}
                  <div
                    onClick={() => onViewProduct(product)}
                    style={{
                      position: 'relative',
                      height: '240px',
                      background: '#faf8f2',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {hasImage ? (
                      <img
                        src={hasImage}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    ) : (
                      <div
                        className={`product-art art-${product.accent || 'sage'}`}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <div className="art-orb" />
                        <div className="art-bottle">
                          <span>KAAR</span>
                          <small>AYURVEDA</small>
                        </div>
                        <div className="art-leaf leaf-one"><Leaf size={36} /></div>
                        <div className="art-leaf leaf-two"><Leaf size={26} /></div>
                      </div>
                    )}

                    {/* Badges */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                      {product.label && (
                        <span
                          style={{
                            background: '#2d3029',
                            color: '#fff',
                            fontSize: '9px',
                            letterSpacing: '0.06em',
                            padding: '3px 8px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {product.label}
                        </span>
                      )}
                      {discount > 0 && (
                        <span
                          style={{
                            background: '#2e7d32',
                            color: '#fff',
                            fontSize: '9px',
                            fontWeight: 600,
                            padding: '3px 6px',
                            borderRadius: '2px',
                          }}
                        >
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '11px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {product.category}
                    </div>

                    <h3
                      onClick={() => onViewProduct(product)}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '17px',
                        fontWeight: 500,
                        margin: '6px 0 4px',
                        cursor: 'pointer',
                        lineHeight: '1.3',
                      }}
                    >
                      {product.name}
                    </h3>

                    <p style={{ fontSize: '11px', color: '#686a60', margin: '0 0 14px', fontStyle: 'italic' }}>
                      {product.note}
                    </p>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#2d3029' }}>
                          {money(product.price)}
                        </div>
                        {product.compareAt && (
                          <del style={{ fontSize: '11px', color: '#99998f' }}>
                            {money(product.compareAt)}
                          </del>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => onViewProduct(product)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '11px',
                            color: '#55694b',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          Review
                        </button>
                        <button
                          className="button button-dark"
                          onClick={() => onAddToCart(product)}
                          style={{ height: '34px', padding: '0 14px', fontSize: '12px' }}
                        >
                          Add <Plus size={14} style={{ marginLeft: '4px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default CollectionsView;
