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
  FileSpreadsheet,
  Mail,
} from 'lucide-react';
import { Product, Order, GoogleSheetsOrderPayload } from '../../types';
import { deleteProduct } from '../../services/productService';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { logoutAdmin } from '../../services/authService';
import { ADMIN_EMAIL, EmailLog } from '../../services/emailService';
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
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'sheets' | 'emails'>('products');

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

  // Email logs state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [sheetsSyncLogs, setSheetsSyncLogs] = useState<GoogleSheetsOrderPayload[]>([]);

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

  useEffect(() => {
    fetchOrders();
    try {
      const eLogs = JSON.parse(localStorage.getItem('kaar-email-logs') || '[]');
      setEmailLogs(eLogs);
      const sLogs = JSON.parse(localStorage.getItem('kaar-sheets-orders-sync') || '[]');
      setSheetsSyncLogs(sLogs);
    } catch {
      // ignore
    }
  }, []);

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#f8f7f2',
        zIndex: 140,
        overflowY: 'auto',
        color: '#2d3029',
      }}
    >
      {/* Admin Header */}
      <header
        style={{
          background: '#354332',
          color: '#fff',
          padding: '16px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontWeight: 600, letterSpacing: '0.08em', fontSize: '16px' }}>
            LIFEHOLICS · KAAR AYURVEDA ADMIN
          </div>
          <span
            style={{
              background: '#4a5b46',
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '12px',
              color: '#d6dfd2',
            }}
          >
            {ADMIN_EMAIL}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            className="button button-outline"
            style={{
              borderColor: 'rgba(255,255,255,0.4)',
              color: '#fff',
              height: '38px',
              padding: '0 16px',
              fontSize: '12px',
            }}
          >
            <Eye size={14} style={{ marginRight: '6px' }} /> View Live Website
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
              gap: '6px',
              fontSize: '12px',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      {/* Admin Navigation Bar */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e7e5dc',
          padding: '0 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '32px' }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '18px 0',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: activeTab === 'products' ? 600 : 400,
              color: activeTab === 'products' ? '#354332' : '#77786e',
              borderBottom: activeTab === 'products' ? '2px solid #354332' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Package size={17} /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '18px 0',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: activeTab === 'orders' ? 600 : 400,
              color: activeTab === 'orders' ? '#354332' : '#77786e',
              borderBottom: activeTab === 'orders' ? '2px solid #354332' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShoppingBag size={17} /> Orders & Payments ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            style={{
              padding: '18px 0',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: activeTab === 'sheets' ? 600 : 400,
              color: activeTab === 'sheets' ? '#354332' : '#77786e',
              borderBottom: activeTab === 'sheets' ? '2px solid #354332' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileSpreadsheet size={17} /> Google Sheets CRM
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            style={{
              padding: '18px 0',
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontWeight: activeTab === 'emails' ? 600 : 400,
              color: activeTab === 'emails' ? '#354332' : '#77786e',
              borderBottom: activeTab === 'emails' ? '2px solid #354332' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Mail size={17} /> Email Automations ({emailLogs.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <button
            className="button button-dark"
            onClick={handleOpenAdd}
            style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
          >
            <Plus size={15} style={{ marginRight: '6px' }} /> Add New Product
          </button>
        )}
      </div>

      {/* Main Content Body */}
      <div style={{ padding: '32px 36px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* KPI Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#fff', border: '1px solid #e7e5dc', padding: '18px 22px', borderRadius: '4px' }}>
            <span style={{ fontSize: '11px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Catalog</span>
            <h3 style={{ fontSize: '24px', margin: '4px 0 0', fontWeight: 600 }}>{products.length} Products</h3>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e7e5dc', padding: '18px 22px', borderRadius: '4px' }}>
            <span style={{ fontSize: '11px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Orders</span>
            <h3 style={{ fontSize: '24px', margin: '4px 0 0', fontWeight: 600 }}>{orders.length}</h3>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e7e5dc', padding: '18px 22px', borderRadius: '4px' }}>
            <span style={{ fontSize: '11px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Verified Paid Orders</span>
            <h3 style={{ fontSize: '24px', margin: '4px 0 0', fontWeight: 600, color: '#2e7d32' }}>{totalPaidOrders}</h3>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e7e5dc', padding: '18px 22px', borderRadius: '4px' }}>
            <span style={{ fontSize: '11px', color: '#77786e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paid Revenue</span>
            <h3 style={{ fontSize: '24px', margin: '4px 0 0', fontWeight: 600 }}>{money(totalRevenue)}</h3>
          </div>
        </div>

        {/* ===================== PRODUCTS TAB ===================== */}
        {activeTab === 'products' && (
          <div>
            {/* Control Bar: Search & Filters */}
            <div
              style={{
                background: '#fff',
                padding: '18px 24px',
                border: '1px solid #e7e5dc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
                <Search size={16} color="#77786e" />
                <input
                  type="text"
                  placeholder="Search products by title, category, sku..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    width: '100%',
                    background: 'transparent',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    border: '1px solid #deddd4',
                    background: '#fff',
                    borderRadius: '2px',
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Ritual Oils">Ritual Oils</option>
                  <option value="Daily Rituals">Daily Rituals</option>
                  <option value="Aromatherapy">Aromatherapy</option>
                  <option value="Herbal Blends">Herbal Blends</option>
                  <option value="Skin Rituals">Skin Rituals</option>
                  <option value="Home Rituals">Home Rituals</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    border: '1px solid #deddd4',
                    background: '#fff',
                    borderRadius: '2px',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <button
                  type="button"
                  onClick={onRefreshProducts}
                  title="Synchronize from Database"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #deddd4',
                    background: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                  }}
                >
                  <RefreshCw size={13} /> Sync
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div style={{ background: '#fff', border: '1px solid #e7e5dc', overflowX: 'auto' }}>
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
                padding: '18px 24px',
                border: '1px solid #e7e5dc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <Search size={16} color="#77786e" />
                <input
                  type="text"
                  placeholder="Search orders by Order ID, customer, phone, or delivery address..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
                />
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                disabled={loadingOrders}
                style={{
                  padding: '8px 14px',
                  border: '1px solid #deddd4',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                }}
              >
                <RefreshCw size={13} /> {loadingOrders ? 'Loading...' : 'Refresh Orders'}
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ background: '#fff', padding: '40px', textAlign: 'center', color: '#77786e', border: '1px solid #e7e5dc' }}>
                  No customer orders logged yet.
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e7e5dc',
                      padding: '24px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        borderBottom: '1px solid #f2f0e9',
                        paddingBottom: '14px',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <span className="eyebrow" style={{ color: '#4d5d48' }}>ORDER REFERENCE</span>
                        <h3 style={{ fontSize: '18px', margin: '4px 0 0', fontWeight: 600 }}>{ord.id}</h3>
                        <div style={{ fontSize: '12px', color: '#77786e', marginTop: '4px' }}>
                          Placed on: {new Date(ord.createdAt).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#77786e' }}>Logistics Status:</span>
                        <select
                          value={ord.orderStatus || 'received'}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value as Order['orderStatus'])}
                          style={{
                            padding: '6px 10px',
                            border: '1px solid #deddd4',
                            background: '#faf9f5',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          <option value="received">Order Received</option>
                          <option value="processing">In Preparation</option>
                          <option value="shipped">Dispatched / Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
                      {/* Customer info */}
                      <div style={{ fontSize: '12px', lineHeight: '1.7', color: '#44463e', background: '#faf9f5', padding: '16px' }}>
                        <div><strong>Customer:</strong> {ord.customerName}</div>
                        <div><strong>Contact:</strong> {ord.contact}</div>
                        <div><strong>Shipping Address:</strong> {ord.address}</div>
                        <div><strong>Payment Method:</strong> {ord.paymentMethod || 'Razorpay Prepaid'}</div>
                        <div>
                          <strong>Payment Status:</strong>{' '}
                          <span
                            style={{
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              color: ord.paymentStatus === 'paid' ? '#166534' : '#991b1b',
                            }}
                          >
                            {ord.paymentStatus}
                          </span>
                        </div>
                        {ord.razorpayPaymentId && (
                          <div style={{ marginTop: '4px', fontSize: '11px', color: '#2b502d' }}>
                            <strong>Razorpay Payment ID:</strong> {ord.razorpayPaymentId}
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px', color: '#40433a' }}>
                          Purchased Items ({ord.items.length})
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
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
                                  fontSize: '12px',
                                  paddingBottom: '6px',
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
                            marginTop: '14px',
                            paddingTop: '10px',
                            borderTop: '1px solid #e7e5dc',
                            fontSize: '14px',
                            fontWeight: 600,
                          }}
                        >
                          <span>Total Amount:</span>
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

        {/* ===================== GOOGLE SHEETS TAB ===================== */}
        {activeTab === 'sheets' && (
          <div style={{ background: '#fff', border: '1px solid #e7e5dc', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span className="eyebrow" style={{ color: '#2e7d32' }}>CONNECTED SPREADSHEET</span>
                <h3 style={{ fontSize: '20px', margin: '4px 0 0', fontWeight: 500 }}>
                  Life Holics Traffic Data (Spreadsheet ID: 1couKMsGuunmNDY89HJfCXgRljxytHOqMgqDF0rGYh8k)
                </h3>
              </div>
              <a
                href="https://docs.google.com/spreadsheets/d/1couKMsGuunmNDY89HJfCXgRljxytHOqMgqDF0rGYh8k"
                target="_blank"
                rel="noreferrer"
                className="button button-outline"
                style={{ fontSize: '12px', height: '36px' }}
              >
                <ExternalLink size={13} style={{ marginRight: '6px' }} /> Open Google Spreadsheet
              </a>
            </div>

            <p style={{ fontSize: '13px', color: '#55584f', lineHeight: '1.6', marginBottom: '24px' }}>
              Whenever customers add rituals to their cart or finalize Razorpay orders, payloads are synchronized into your connected Google Sheet tabs (<strong>Cart</strong> and <strong>Orders</strong>).
            </p>

            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              Recent Orders Synchronized to "Orders" Tab ({sheetsSyncLogs.length})
            </h4>

            <div style={{ overflowX: 'auto', border: '1px solid #f0eee5' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#faf9f5', borderBottom: '1px solid #e7e5dc' }}>
                    <th style={{ padding: '10px 14px' }}>Order ID</th>
                    <th style={{ padding: '10px 14px' }}>Customer</th>
                    <th style={{ padding: '10px 14px' }}>Contact</th>
                    <th style={{ padding: '10px 14px' }}>Items</th>
                    <th style={{ padding: '10px 14px' }}>Amount</th>
                    <th style={{ padding: '10px 14px' }}>Payment Status</th>
                    <th style={{ padding: '10px 14px' }}>Synced At</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetsSyncLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#77786e' }}>
                        No orders recorded in synchronization buffer yet. Place a test checkout to see entries appear.
                      </td>
                    </tr>
                  ) : (
                    sheetsSyncLogs.map((log: GoogleSheetsOrderPayload, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f4f3ed' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 500 }}>{log.orderId}</td>
                        <td style={{ padding: '10px 14px' }}>{log.customerName}</td>
                        <td style={{ padding: '10px 14px' }}>{log.email || log.phone}</td>
                        <td style={{ padding: '10px 14px' }}>{log.productNames}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600 }}>{money(log.total)}</td>
                        <td style={{ padding: '10px 14px', color: '#2e7d32' }}>{log.paymentStatus}</td>
                        <td style={{ padding: '10px 14px', color: '#77786e' }}>{log.orderDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== EMAILS TAB ===================== */}
        {activeTab === 'emails' && (
          <div style={{ background: '#fff', border: '1px solid #e7e5dc', padding: '28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span className="eyebrow" style={{ color: '#56664d' }}>EMAIL AUTOMATIONS DISPATCH LOG</span>
              <h3 style={{ fontSize: '20px', margin: '4px 0 0', fontWeight: 500 }}>
                Customer & Administrator Notifications
              </h3>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {emailLogs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#77786e' }}>
                  No automated emails logged yet. Emails trigger upon Razorpay order completion and status updates.
                </div>
              ) : (
                emailLogs.map((log: EmailLog) => (
                  <div
                    key={log.id}
                    style={{
                      border: '1px solid #f0eee5',
                      padding: '16px 20px',
                      background: '#faf9f5',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{log.subject}</span>
                      <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 500 }}>● {log.status.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#55584f' }}>
                      <strong>Recipient:</strong> {log.to} &nbsp;|&nbsp; <strong>Time:</strong> {new Date(log.sentAt).toLocaleString('en-IN')}
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#686a60' }}>
                      {log.bodySummary}
                    </p>
                  </div>
                ))
              )}
            </div>
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
              padding: '30px',
              maxWidth: '480px',
              width: '100%',
              margin: 'auto',
              borderRadius: '2px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', marginBottom: '14px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Confirm Product Deletion</h3>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#55584f' }}>
              Are you sure you want to permanently remove this product from the store? Past orders referencing this item will continue to be safely preserved.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="text-button"
                onClick={() => setDeletingProductId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-dark"
                onClick={handleConfirmDelete}
                style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
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
