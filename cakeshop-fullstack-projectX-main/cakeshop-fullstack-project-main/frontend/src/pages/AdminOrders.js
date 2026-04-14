import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Package, Calendar, ChevronDown, CreditCard, User, Trash2, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // order_id or 'all'

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/admin/orders`, { withCredentials: true });
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}?status=${status}`, {}, { withCredentials: true });
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, order_status: status } : o));
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const toggleOrder = (orderId) => {
    setOpenOrderId(prev => prev === orderId ? null : orderId);
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`${API}/admin/orders/${orderId}`, { withCredentials: true });
      setOrders(orders.filter(o => o.order_id !== orderId));
      if (openOrderId === orderId) setOpenOrderId(null);
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error('Failed to delete order');
    } finally {
      setConfirmDelete(null);
    }
  };

  const deleteAllOrders = async () => {
    try {
      const { data } = await axios.delete(`${API}/admin/orders`, { withCredentials: true });
      setOrders([]);
      setOpenOrderId(null);
      toast.success(data.message || 'All orders deleted');
    } catch (error) {
      toast.error('Failed to delete orders');
    } finally {
      setConfirmDelete(null);
    }
  };

  const statusStyle = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    processing: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
  };

  const getItemSummary = (items) => {
    if (!items || items.length === 0) return 'No items';
    const totalQty = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const firstName = items[0]?.cake_name || 'Cake';
    if (items.length === 1) return `${firstName} x${totalQty}`;
    return `${firstName} +${items.length - 1} more (${totalQty} items)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0B8A8]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1
              className="text-4xl sm:text-5xl text-[#2C1E16] dark:text-[#FAFAF7] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="admin-orders-heading"
            >
              Manage Orders
            </h1>
            <p className="text-[#5C4A3D] dark:text-[#D0B8A8]">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>
          {orders.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setConfirmDelete('all')}
              className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20 self-start sm:self-auto"
              data-testid="delete-all-orders-btn"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Orders
            </Button>
          )}
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
              onClick={() => setConfirmDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-[#3C2E26] rounded-xl border border-[rgba(44,30,22,0.15)] shadow-xl max-w-sm w-full p-6"
                data-testid="delete-confirm-modal"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">
                    {confirmDelete === 'all' ? 'Delete All Orders?' : 'Delete Order?'}
                  </h3>
                </div>
                <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8] mb-6">
                  {confirmDelete === 'all'
                    ? 'This will permanently delete ALL orders. This action cannot be undone.'
                    : 'Are you sure you want to delete this order? This action cannot be undone.'}
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(null)}
                    className="border-[rgba(44,30,22,0.15)]"
                    data-testid="delete-cancel-btn"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => confirmDelete === 'all' ? deleteAllOrders() : deleteOrder(confirmDelete)}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    data-testid="delete-confirm-btn"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {confirmDelete === 'all' ? 'Delete All' : 'Delete'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-[#D0B8A8] mx-auto mb-4" />
            <p className="text-xl text-[#5C4A3D] dark:text-[#D0B8A8]">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isOpen = openOrderId === order.order_id;
              const status = order.order_status || order.status || 'pending';

              return (
                <div
                  key={order.order_id}
                  className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.12)] rounded-xl overflow-hidden transition-shadow hover:shadow-md"
                  data-testid={`admin-order-${order.order_id}`}
                >
                  {/* Collapsed Row */}
                  <button
                    onClick={() => toggleOrder(order.order_id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 cursor-pointer"
                    data-testid={`order-toggle-${order.order_id}`}
                  >
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-5 w-5 text-[#5C4A3D] dark:text-[#D0B8A8]" />
                    </motion.div>

                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 items-center min-w-0">
                      {/* Order ID */}
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-[#5C4A3D]/60 dark:text-[#D0B8A8]/60">Order</p>
                        <p className="text-sm font-mono font-semibold text-[#2C1E16] dark:text-[#FAFAF7] truncate" data-testid={`order-id-${order.order_id}`}>
                          #{order.order_id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>

                      {/* Customer */}
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-[#5C4A3D]/60 dark:text-[#D0B8A8]/60">Customer</p>
                        <p className="text-sm font-medium text-[#2C1E16] dark:text-[#FAFAF7] truncate">
                          {order.user_name || 'N/A'}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-[#5C4A3D]/60 dark:text-[#D0B8A8]/60">Total</p>
                        <p className="text-sm font-bold text-[#D0B8A8]" data-testid={`order-total-${order.order_id}`}>
                          ₹{order.total_amount}
                        </p>
                      </div>

                      {/* Status + Payment */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${statusStyle[status] || statusStyle.pending} text-[10px] uppercase tracking-wider border px-2 py-0.5`}>
                          {status}
                        </Badge>
                        <span className="text-[10px] uppercase tracking-wider text-[#5C4A3D] dark:text-[#D0B8A8] bg-[#D0B8A8]/10 px-2 py-0.5 rounded">
                          {order.payment_method || 'COD'}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                        data-testid={`order-details-${order.order_id}`}
                      >
                        <div className="border-t border-[rgba(44,30,22,0.1)] px-5 pb-5 pt-4">
                          {/* Status Changer + Delete */}
                          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[rgba(44,30,22,0.08)]">
                            <span className="text-xs uppercase tracking-wider text-[#5C4A3D] dark:text-[#D0B8A8]">Update Status:</span>
                            <Select
                              value={status}
                              onValueChange={(val) => updateStatus(order.order_id, val)}
                            >
                              <SelectTrigger className="w-44 h-9 text-sm" data-testid={`status-select-${order.order_id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-xs text-[#5C4A3D]/50 dark:text-[#D0B8A8]/50 flex items-center gap-1 ml-auto">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete(order.order_id); }}
                              className="ml-2 p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                              title="Delete this order"
                              data-testid={`delete-order-${order.order_id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            {/* LEFT: Customer & Address */}
                            <div className="space-y-4">
                              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#5C4A3D]/70 dark:text-[#D0B8A8]/70">
                                Customer Details
                              </h4>

                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#D0B8A8]/20 flex items-center justify-center shrink-0">
                                  <User className="h-4 w-4 text-[#D0B8A8]" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">{order.user_name || 'N/A'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-[#D0B8A8] shrink-0" />
                                <p className="text-sm text-[#2C1E16] dark:text-[#FAFAF7] break-all">{order.user_email || 'N/A'}</p>
                              </div>

                              {/* Mobile - highlighted */}
                              <div className="flex items-center gap-3 bg-[#D0B8A8]/10 p-3 rounded-lg border border-[#D0B8A8]/25">
                                <Phone className="h-4 w-4 text-[#D0B8A8] shrink-0" />
                                <p className="text-base font-bold text-[#2C1E16] dark:text-[#FAFAF7]" data-testid={`order-mobile-${order.order_id}`}>
                                  {order.user_mobile || 'N/A'}
                                </p>
                              </div>

                              {/* Address - highlighted */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="h-4 w-4 text-[#D0B8A8]" />
                                  <span className="text-xs uppercase tracking-widest font-semibold text-[#5C4A3D]/70 dark:text-[#D0B8A8]/70">
                                    Delivery Address
                                  </span>
                                </div>
                                <div className="bg-[#FAFAF7] dark:bg-[#2C1E16] p-3 rounded-lg border border-[rgba(44,30,22,0.1)]" data-testid={`order-address-${order.order_id}`}>
                                  {order.address ? (
                                    <div className="text-sm text-[#2C1E16] dark:text-[#FAFAF7] leading-relaxed space-y-0.5">
                                      <p>{order.address.street}</p>
                                      {order.address.taluka && <p>Taluka: {order.address.taluka}</p>}
                                      <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">No address provided</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* RIGHT: Items & Payment */}
                            <div className="space-y-4">
                              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#5C4A3D]/70 dark:text-[#D0B8A8]/70">
                                Order Items
                              </h4>

                              <div className="space-y-2">
                                {order.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start justify-between gap-3 p-3 bg-[#FAFAF7] dark:bg-[#2C1E16] rounded-lg border border-[rgba(44,30,22,0.1)]"
                                    data-testid={`order-item-${order.order_id}-${idx}`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7] truncate">
                                          {item.cake_name}
                                        </p>
                                        <span className="shrink-0 text-xs font-bold text-white bg-[#D0B8A8] px-2 py-0.5 rounded-full" data-testid={`item-qty-${order.order_id}-${idx}`}>
                                          x{item.quantity || 1}
                                        </span>
                                      </div>
                                      <div className="text-xs text-[#5C4A3D] dark:text-[#D0B8A8] mt-1 space-y-0.5">
                                        {item.weight && <span>Weight: {item.weight}</span>}
                                        {item.flavor && <span className="ml-2">Flavor: {item.flavor}</span>}
                                        {item.message && <p>Message: "{item.message}"</p>}
                                        {item.delivery_date && (
                                          <p className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Delivery: {item.delivery_date}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm font-bold text-[#D0B8A8] shrink-0">₹{item.price}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Payment Summary */}
                              <div className="border-t border-[rgba(44,30,22,0.1)] pt-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="flex items-center gap-2 text-[#5C4A3D] dark:text-[#D0B8A8]">
                                    <CreditCard className="h-4 w-4" /> Payment Method
                                  </span>
                                  <span className="font-semibold text-[#2C1E16] dark:text-[#FAFAF7] bg-[#D0B8A8]/15 px-3 py-1 rounded-md text-xs uppercase tracking-wide">
                                    {order.payment_method || 'COD'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-[#5C4A3D] dark:text-[#D0B8A8]">Payment Status</span>
                                  <span className="font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">
                                    {order.payment_status || 'Pending'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-[rgba(44,30,22,0.1)]">
                                  <span className="text-base font-bold text-[#2C1E16] dark:text-[#FAFAF7]">Total</span>
                                  <span className="text-xl font-bold text-[#D0B8A8]">₹{order.total_amount}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
