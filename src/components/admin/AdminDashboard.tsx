import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  ShoppingBag,
  LogOut,
  RefreshCw,
  Eye,
  AlertTriangle,
  Leaf,
  MessageSquare,
  CheckCircle,
  XCircle,
  Star,
} from 'lucide-react';
import { Product, Order, Review } from '../../types';
import { deleteProduct } from '../../services/productService';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { getAllReviews, approveReview, rejectOrDeleteReview } from '../../services/reviewService';
import { logoutAdmin } from '../../services/authService';
import ProductFormModal from './ProductFormModal';

interface AdminDashboardProps {
  products: Product[];
  categories: string[];
  onClose: () => void;
  onRefreshProducts: () => void;
  onViewProductLive: (product: Product) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  onClose,
  onRefreshProducts,
  onViewProductLive,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'reviews'>('products');

  // Product filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Product Form Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete confirmation
  const [deletingProductId, setDeletingProductId] = useState<string | number | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const all = await getAllOrders();
      setOrders(all);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const all = await getAllReviews();
      setReviews(all);
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchReviews();
  }, []);

  const handleApproveReview = async (reviewId: string) => {
    await approveReview(reviewId);
    await fetchReviews();
  };

  const handleRejectReview = async (reviewId: string) => {
    // Immediate deletion upon rejection as specified by user
    await rejectOrDeleteReview(reviewId);
    await fetchReviews();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProductId) return;
    await deleteProduct(deletingProductId);
    setDeletingProductId(null);
    onRefreshProducts();
  };

  const handleOrderStatusChange = async (orderId: string, status: Order['orderStatus']) => {
    await updateOrderStatus(orderId, { orderStatus: status });
    fetchOrders();
  };

  const handleLogout = async () => {
    await logoutAdmin();
    onClose();
  };

  const money = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = `${p.name} ${p.category} ${p.description} ${p.sku || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'published' && (p.status === 'published' || !p.status)) ||
      p.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Filter orders
  const filteredOrders = orders.filter((o) =>
    `${o.id} ${o.customerName} ${o.contact} ${o.address}`
      .toLowerCase()
      .includes(orderSearchQuery.toLowerCase())
  );

  // Statistics
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const totalPaidOrders = orders.filter(o => o.paymentStatus === 'paid').length;

  return (
    <div className="admin-dashboard-container">
      <style>{`
        .admin-dashboard-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #f8f7f2;
          z-index: 140;
          overflow-y: auto;
          color: #2d3029;
          font-family: inherit;
        }

        .admin-header {
          background: #354332;
          color: #fff;
          padding: 12px 24px;
          display: flex;
          justifyContent: space-between;
          align-items: center;
          gap: 12px;
        }

        .admin-title-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-title-text {
          font-weight: 700;
          letter-spacing: 0.08em;
          font-size: 15px;
          color: #fff;
          white-space: nowrap;
        }

        .admin-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }

        .admin-nav-bar {
          background: #fff;
          border-bottom: 1px solid #e7e5dc;
          padding: 0 24px;
          display: flex;
          justifyContent: space-between;
          align-items: center;
          gap: 16px;
        }

        .admin-nav-tabs {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .admin-nav-tab {
          padding: 14px 0;
          border: none;
          background: transparent;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .admin-add-product-btn {
          margin-left: auto;
          height: 34px;
          padding: 0 16px;
          font-size: 12px;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        @media (max-width: 640px) {
          .admin-header {
            padding: 10px 16px;
          }

          .admin-nav-bar {
            padding: 0 14px;
            gap: 10px;
          }

          .admin-nav-tabs {
            gap: 12px;
          }

          .admin-nav-tab {
            padding: 12px 0;
            font-size: 12px;
          }

          .admin-add-product-btn {
            height: 30px;
            padding: 0 10px;
            font-size: 11px;
            margin-left: auto;
          }
        }

        .admin-main-body {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .admin-kpi-card {
          background: #fff;
          border: 1px solid #e7e5dc;
          padding: 14px 16px;
          border-radius: 4px;
        }

        .admin-filter-bar {
          background: #fff;
          padding: 14px 16px;
          border: 1px solid #e7e5dc;
          display: flex;
          justifyContent: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          border-radius: 4px;
        }

        .admin-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 180px;
        }

        .admin-filter-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          width: 100%;
        }

        @media (min-width: 640px) {
          .admin-filter-actions {
            width: auto;
          }
        }

        /* Responsive Product Views */
        .admin-table-view {
          display: none;
        }

        .admin-card-grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        @media (min-width: 768px) {
          .admin-card-grid-view {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 16px;
          }
        }

        /* Large desktop can show traditional table if preferred, or keep cards */
        @media (min-width: 1024px) {
          .admin-table-view {
            display: block;
            background: #fff;
            border: 1px solid #e7e5dc;
            overflow-x: auto;
          }
          .admin-card-grid-view {
            display: none;
          }
        }

        /* Compact Product Card Style for Mobile */
        .admin-compact-card {
          background: #fff;
          border: 1px solid #e7e5dc;
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .admin-card-media {
          position: relative;
          width: 100%;
          height: 125px;
          background: #faf8f2;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-card-body {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .admin-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          font-weight: 600;
          color: #2d3029;
          line-height: 1.25;
          margin: 0 0 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .admin-card-cat {
          font-size: 10px;
          color: #77786e;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }

        .admin-card-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }

        .admin-card-price {
          font-size: 14px;
          font-weight: 600;
          color: #2d3029;
        }

        .admin-card-compare {
          font-size: 11px;
          color: #99998f;
          text-decoration: line-through;
        }

        .admin-card-actions {
          margin-top: auto;
          display: flex;
          gap: 6px;
          padding-top: 8px;
          border-top: 1px solid #f2f0e9;
        }

        .admin-card-btn {
          flex: 1;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 11px;
          border-radius: 3px;
          cursor: pointer;
          border: 1px solid #deddd4;
          background: #faf9f5;
          color: #3b4233;
        }

        .admin-card-btn.delete {
          flex: 0 0 34px;
          border-color: #fecaca;
          color: #dc2626;
          background: #fff;
        }

        .admin-card-btn.live {
          flex: 0 0 34px;
          color: #55584f;
        }
      `}</style>

      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-title-area">
          <div className="admin-title-text">
            KAAR ADMIN PANEL
          </div>

        </div>

        <div className="admin-header-actions">
          <button
            onClick={onClose}
            className="button button-outline"
            style={{
              borderColor: 'rgba(255,255,255,0.4)',
              color: '#fff',
              height: '32px',
              padding: '0 12px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Eye size={13} style={{ marginRight: '4px' }} /> View Live
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e2dac9',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Admin Navigation Bar */}
      <div className="admin-nav-bar">
        <div className="admin-nav-tabs">
          <button
            className="admin-nav-tab"
            onClick={() => setActiveTab('products')}
            style={{
              fontWeight: activeTab === 'products' ? 600 : 400,
              color: activeTab === 'products' ? '#354332' : '#77786e',
              borderBottom: activeTab === 'products' ? '2px solid #354332' : '2px solid transparent',
            }}
          >
            <Package size={15} /> Products ({products.length})
          </button>
          <button
            className="admin-nav-tab"
            onClick={() => setActiveTab('orders')}
            style={{
              fontWeight: activeTab === 'orders' ? 600 : 400,
              color: activeTab === 'orders' ? '#354332' : '#77786e',
              borderBottom: activeTab === 'orders' ? '2px solid #354332' : '2px solid transparent',
            }}
          >
            <ShoppingBag size={15} /> Orders ({orders.length})
          </button>
          <button
            className="admin-nav-tab"
            onClick={() => setActiveTab('reviews')}
            style={{
              fontWeight: activeTab === 'reviews' ? 600 : 400,
              color: activeTab === 'reviews' ? '#354332' : '#77786e',
              borderBottom: activeTab === 'reviews' ? '2px solid #354332' : '2px solid transparent',
              position: 'relative',
            }}
          >
            <MessageSquare size={15} /> Reviews ({reviews.length})
            {reviews.filter((r) => r.status === 'pending').length > 0 && (
              <span
                style={{
                  background: '#b45309',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px',
                }}
              >
                {reviews.filter((r) => r.status === 'pending').length} new
              </span>
            )}
          </button>
        </div>

        {activeTab === 'products' && (
          <button
            className="button button-dark admin-add-product-btn"
            onClick={handleOpenAdd}
          >
            <Plus size={13} /> Add Product
          </button>
        )}
      </div>

      {/* Main Content Body */}
      <div className="admin-main-body">
        {/* KPI Summary Cards */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <span style={{ fontSize: '10px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catalog</span>
            <h3 style={{ fontSize: '18px', margin: '2px 0 0', fontWeight: 600 }}>{products.length} Products</h3>
          </div>
          <div className="admin-kpi-card">
            <span style={{ fontSize: '10px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</span>
            <h3 style={{ fontSize: '18px', margin: '2px 0 0', fontWeight: 600 }}>{orders.length}</h3>
          </div>
          <div className="admin-kpi-card">
            <span style={{ fontSize: '10px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid Orders</span>
            <h3 style={{ fontSize: '18px', margin: '2px 0 0', fontWeight: 600, color: '#2e7d32' }}>{totalPaidOrders}</h3>
          </div>
          <div className="admin-kpi-card">
            <span style={{ fontSize: '10px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</span>
            <h3 style={{ fontSize: '18px', margin: '2px 0 0', fontWeight: 600 }}>{money(totalRevenue)}</h3>
          </div>
        </div>

        {/* ===================== PRODUCTS TAB ===================== */}
        {activeTab === 'products' && (
          <div>
            {/* Control Bar: Search & Filters */}
            <div className="admin-filter-bar">
              <div className="admin-search-box">
                <Search size={15} color="#77786e" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '12px',
                    width: '100%',
                    background: 'transparent',
                  }}
                />
              </div>

              <div className="admin-filter-actions">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    border: '1px solid #deddd4',
                    background: '#fff',
                    borderRadius: '2px',
                    flex: '1',
                  }}
                >
                  <option value="all">All Categories</option>
                  {Array.from(new Set(categories.length > 0 ? categories : [
                    'Ritual Oils', 'Daily Rituals', 'Aromatherapy', 'Herbal Blends', 'Skin Rituals', 'Home Rituals'
                  ])).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    border: '1px solid #deddd4',
                    background: '#fff',
                    borderRadius: '2px',
                    flex: '1',
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <button
                  type="button"
                  onClick={onRefreshProducts}
                  title="Synchronize from Database"
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #deddd4',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    borderRadius: '2px',
                  }}
                >
                  <RefreshCw size={12} /> Sync
                </button>
              </div>
            </div>

            {/* MOBILE / TABLET VIEW: COMPACT PRODUCT CARDS */}
            <div className="admin-card-grid-view">
              {filteredProducts.length === 0 ? (
                <div style={{ gridColumn: '1/-1', background: '#fff', padding: '30px', textAlign: 'center', color: '#77786e', borderRadius: '4px' }}>
                  No products found.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const hasImage = p.thumbnail || (p.images && p.images[0]);
                  return (
                    <div className="admin-compact-card" key={p.id}>
                      <div className="admin-card-media">
                        {hasImage ? (
                          <img
                            src={hasImage}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className={`product-art art-${p.accent || 'sage'}`}
                            style={{ width: '100%', height: '100%', padding: '6px' }}
                          >
                            <div className="art-orb" />
                            <div className="art-bottle" style={{ transform: 'scale(0.55)' }}>
                              <span>KAAR</span>
                              <small>AYURVEDA</small>
                            </div>
                            <div className="art-leaf leaf-one"><Leaf size={24} /></div>
                            <div className="art-leaf leaf-two"><Leaf size={18} /></div>
                          </div>
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            fontSize: '9px',
                            padding: '2px 5px',
                            borderRadius: '2px',
                            background: p.status === 'draft' ? '#fef3c7' : '#dcfce7',
                            color: p.status === 'draft' ? '#92400e' : '#166534',
                            fontWeight: 600,
                          }}
                        >
                          {p.status || 'published'}
                        </span>
                      </div>

                      <div className="admin-card-body">
                        <span className="admin-card-cat">{p.category}</span>
                        <h4 className="admin-card-name" title={p.name}>{p.name}</h4>

                        <div className="admin-card-price-row">
                          <span className="admin-card-price">{money(p.price)}</span>
                          {p.compareAt && (
                            <span className="admin-card-compare">{money(p.compareAt)}</span>
                          )}
                        </div>

                        <div style={{ fontSize: '10px', color: '#77786e', marginBottom: '8px' }}>
                          Stock: <strong>{p.stockQuantity ?? 50}</strong>
                        </div>

                        {/* Action buttons right inside the card */}
                        <div className="admin-card-actions">
                          <button
                            className="admin-card-btn"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            className="admin-card-btn live"
                            onClick={() => onViewProductLive(p)}
                            title="View on store"
                          >
                            <ExternalLink size={12} />
                          </button>
                          <button
                            className="admin-card-btn delete"
                            onClick={() => setDeletingProductId(p.id)}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* DESKTOP TABLE VIEW (1024px and above) */}
            <div className="admin-table-view">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#faf9f5', borderBottom: '1px solid #e7e5dc', color: '#686a60' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 500 }}>Product</th>
                    <th style={{ padding: '14px 16px', fontWeight: 500 }}>Category</th>
                    <th style={{ padding: '14px 16px', fontWeight: 500 }}>Price</th>
                    <th style={{ padding: '14px 16px', fontWeight: 500 }}>Stock</th>
                    <th style={{ padding: '14px 16px', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '14px 16px', fontWeight: 500 }}>Badges</th>
                    <th style={{ padding: '14px 20px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#77786e' }}>
                        No products match your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const hasImage = p.thumbnail || (p.images && p.images[0]);
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f2f0e9' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              {hasImage ? (
                                <img
                                  src={hasImage}
                                  alt={p.name}
                                  style={{
                                    width: '46px',
                                    height: '46px',
                                    objectFit: 'cover',
                                    borderRadius: '3px',
                                    background: '#faf9f5',
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: '46px',
                                    height: '46px',
                                    background: '#ebe8dd',
                                    borderRadius: '3px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontSize: '10px',
                                    color: '#55584f',
                                    fontWeight: 600,
                                  }}
                                >
                                  KAAR
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 500, color: '#2d3029' }}>{p.name}</div>
                                <div style={{ fontSize: '11px', color: '#77786e', marginTop: '2px' }}>
                                  SKU: {p.sku || `KAAR-${p.id}`}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px', color: '#55584f' }}>
                            <div>{p.category}</div>
                            {p.subcategory && (
                              <div style={{ fontSize: '11px', color: '#888980' }}>{p.subcategory}</div>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600 }}>{money(p.price)}</div>
                            {p.compareAt && (
                              <del style={{ fontSize: '11px', color: '#99998f' }}>{money(p.compareAt)}</del>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                fontSize: '11px',
                                borderRadius: '3px',
                                background: p.stockStatus === 'out_of_stock' ? '#fdf2f2' : '#f0fdf4',
                                color: p.stockStatus === 'out_of_stock' ? '#991b1b' : '#166534',
                              }}
                            >
                              {p.stockQuantity !== undefined ? `${p.stockQuantity} units` : 'In stock'}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                textTransform: 'capitalize',
                                fontSize: '12px',
                                color: p.status === 'draft' ? '#b45309' : '#15803d',
                              }}
                            >
                              ● {p.status || 'published'}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {p.bestseller && (
                                <span style={{ background: '#eef2ff', color: '#3730a3', fontSize: '10px', padding: '2px 6px', borderRadius: '2px' }}>
                                  Bestseller
                                </span>
                              )}
                              {p.newArrival && (
                                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px', padding: '2px 6px', borderRadius: '2px' }}>
                                  New
                                </span>
                              )}
                              {p.isFeatured && (
                                <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: '10px', padding: '2px 6px', borderRadius: '2px' }}>
                                  Slider
                                </span>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => onViewProductLive(p)}
                                title="View on Live Store"
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #deddd4',
                                  padding: '6px 8px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  color: '#55584f',
                                }}
                              >
                                <ExternalLink size={14} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                title="Edit Product"
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #deddd4',
                                  padding: '6px 8px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  color: '#3b4233',
                                }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingProductId(p.id)}
                                title="Delete Product"
                                style={{
                                  background: 'transparent',
                                  border: '1px solid #fee2e2',
                                  padding: '6px 8px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  color: '#dc2626',
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== ORDERS & PAYMENTS TAB ===================== */}
        {activeTab === 'orders' && (
          <div>
            <div
              style={{
                background: '#fff',
                padding: '14px 16px',
                border: '1px solid #e7e5dc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
                <Search size={15} color="#77786e" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100%' }}
                />
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                disabled={loadingOrders}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #deddd4',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  borderRadius: '2px',
                }}
              >
                <RefreshCw size={12} /> {loadingOrders ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ background: '#fff', padding: '30px', textAlign: 'center', color: '#77786e', border: '1px solid #e7e5dc', borderRadius: '4px' }}>
                  No customer orders logged yet.
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e7e5dc',
                      padding: '16px',
                      borderRadius: '4px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        borderBottom: '1px solid #f2f0e9',
                        paddingBottom: '10px',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <span className="eyebrow" style={{ color: '#4d5d48', fontSize: '9px' }}>ORDER REFERENCE</span>
                        <h3 style={{ fontSize: '15px', margin: '2px 0 0', fontWeight: 600 }}>{ord.id}</h3>
                        <div style={{ fontSize: '11px', color: '#77786e', marginTop: '2px' }}>
                          Placed: {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#77786e' }}>Status:</span>
                        <select
                          value={ord.orderStatus || 'received'}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value as Order['orderStatus'])}
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #deddd4',
                            background: '#faf9f5',
                            fontSize: '11px',
                            fontWeight: 500,
                            borderRadius: '2px',
                          }}
                        >
                          <option value="received">Received</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      {/* Customer info */}
                      <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#44463e', background: '#faf9f5', padding: '12px', borderRadius: '3px' }}>
                        <div><strong>Customer:</strong> {ord.customerName}</div>
                        <div><strong>Contact:</strong> {ord.contact}</div>
                        <div><strong>Address:</strong> {ord.address}</div>
                        <div><strong>Payment:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 600, color: ord.paymentStatus === 'paid' ? '#166534' : '#991b1b' }}>{ord.paymentStatus}</span></div>
                      </div>

                      {/* Items */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: '#40433a' }}>
                          Items ({ord.items.length})
                        </div>
                        <div style={{ display: 'grid', gap: '6px' }}>
                          {ord.items.map((item, i) => {
                            const itemName = 'product' in item ? item.product.name : item.name;
                            const itemPrice = 'product' in item ? item.product.price : item.price;
                            const itemQty = item.quantity;
                            return (
                              <div
                                key={i}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '11px',
                                  paddingBottom: '4px',
                                  borderBottom: '1px solid #f6f5f0',
                                }}
                              >
                                <span>{itemQty} × {itemName}</span>
                                <strong>{money(itemPrice * itemQty)}</strong>
                              </div>
                            );
                          })}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '10px',
                            paddingTop: '6px',
                            borderTop: '1px solid #e7e5dc',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                        >
                          <span>Total:</span>
                          <span>{money(ord.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===================== REVIEWS & TESTIMONIALS TAB ===================== */}
        {activeTab === 'reviews' && (
          <div>
            <div className="admin-filter-bar">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '2px',
                    border: '1px solid',
                    borderColor: reviewFilter === 'all' ? '#354332' : '#deddd4',
                    background: reviewFilter === 'all' ? '#354332' : '#fff',
                    color: reviewFilter === 'all' ? '#fff' : '#444',
                    cursor: 'pointer',
                  }}
                >
                  All ({reviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('pending')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '2px',
                    border: '1px solid',
                    borderColor: reviewFilter === 'pending' ? '#b45309' : '#deddd4',
                    background: reviewFilter === 'pending' ? '#b45309' : '#fff',
                    color: reviewFilter === 'pending' ? '#fff' : '#444',
                    cursor: 'pointer',
                  }}
                >
                  Pending ({reviews.filter((r) => r.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('approved')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '2px',
                    border: '1px solid',
                    borderColor: reviewFilter === 'approved' ? '#15803d' : '#deddd4',
                    background: reviewFilter === 'approved' ? '#15803d' : '#fff',
                    color: reviewFilter === 'approved' ? '#fff' : '#444',
                    cursor: 'pointer',
                  }}
                >
                  Approved ({reviews.filter((r) => r.status === 'approved').length})
                </button>
              </div>

              <div style={{ marginLeft: 'auto' }}>
                <button
                  onClick={fetchReviews}
                  disabled={loadingReviews}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '6px 12px',
                    border: '1px solid #deddd4',
                    background: '#fff',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                >
                  <RefreshCw size={13} className={loadingReviews ? 'spin' : ''} /> Refresh
                </button>
              </div>
            </div>

            {loadingReviews ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#77786e' }}>
                Loading customer reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', background: '#fff', border: '1px solid #e7e5dc' }}>
                <MessageSquare size={36} color="#bbb" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>No reviews found</h4>
                <p style={{ color: '#77786e', fontSize: '12px', margin: 0 }}>
                  Customer reviews submitted on product pages will appear here for your moderation.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '14px' }}>
                {reviews
                  .filter((r) => {
                    if (reviewFilter === 'pending') return r.status === 'pending';
                    if (reviewFilter === 'approved') return r.status === 'approved';
                    return true;
                  })
                  .map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e7e5dc',
                        borderRadius: '4px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        borderLeft:
                          rev.status === 'approved'
                            ? '4px solid #16a34a'
                            : '4px solid #d97706',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '14px', color: '#2d3029' }}>{rev.userName}</strong>
                            <span
                              style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '3px',
                                fontWeight: 600,
                                background: rev.status === 'approved' ? '#dcfce7' : '#fef3c7',
                                color: rev.status === 'approved' ? '#166534' : '#92400e',
                              }}
                            >
                              {rev.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '11px', color: '#77786e', marginTop: '4px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span>Product: <strong style={{ color: '#354332' }}>{rev.productName || 'General'}</strong></span>
                            <span>Date: {new Date(rev.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div style={{ display: 'flex', gap: '2px', color: '#c49a45' }}>
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} size={14} fill="#c49a45" />
                          ))}
                        </div>
                      </div>

                      {/* Review text */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          lineHeight: '1.6',
                          color: '#3d4036',
                          background: '#faf9f5',
                          padding: '12px 14px',
                          borderRadius: '3px',
                          border: '1px solid #f0ede4',
                        }}
                      >
                        “{rev.review}”
                      </p>

                      {/* Admin Decision Actions */}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '4px' }}>
                        {rev.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleApproveReview(rev.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#15803d',
                              color: '#fff',
                              border: 'none',
                              padding: '7px 14px',
                              borderRadius: '3px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <CheckCircle size={14} /> Approve Review
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRejectReview(rev.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            padding: '7px 14px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Reject and immediately delete this review"
                        >
                          <XCircle size={14} /> Reject & Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal (Add / Edit) */}
      {showProductModal && (
        <ProductFormModal
          initialProduct={editingProduct}
          categories={categories}
          onClose={() => setShowProductModal(false)}
          onSaved={() => {
            onRefreshProducts();
            setShowProductModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProductId && (
        <div className="overlay checkout-overlay" style={{ zIndex: 160 }}>
          <div
            style={{
              background: '#fff',
              padding: '24px',
              maxWidth: '440px',
              width: '90%',
              margin: 'auto',
              borderRadius: '4px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', marginBottom: '12px' }}>
              <AlertTriangle size={20} />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Confirm Product Deletion</h3>
            </div>
            <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#55584f' }}>
              Are you sure you want to permanently remove this product from the store? Past orders referencing this item will continue to be safely preserved.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="text-button"
                onClick={() => setDeletingProductId(null)}
                style={{ fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-dark"
                onClick={handleConfirmDelete}
                style={{ background: '#b91c1c', borderColor: '#b91c1c', height: '36px', fontSize: '12px' }}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
