import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/orders`, { withCredentials: true });
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl mb-8 text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }} data-testid="orders-heading">My Orders</h1>

        {loading ? (
          <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0B8A8] mx-auto"></div></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12" data-testid="no-orders-message"><p className="text-xl text-[#5C4A3D] dark:text-[#D0B8A8]">No orders yet</p></div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div key={order.order_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6" data-testid={`order-${order.order_id}`}>
                <div className="flex justify-between mb-4">
                  <div><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Order ID: {order.order_id.slice(0, 8)}</p><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">{new Date(order.created_at).toLocaleDateString()}</p></div>
                  <span className={`px-4 py-1 rounded-full text-sm uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`} data-testid={`order-status-${order.order_id}`}>{order.status}</span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm"><span className="text-[#2C1E16] dark:text-[#FAFAF7]">{item.cake_name} ({item.weight})</span><span className="text-[#D0B8A8]">₹{item.price}</span></div>
                  ))}
                </div>
                <div className="border-t border-[rgba(44,30,22,0.15)] pt-4 flex justify-between"><span className="font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Total:</span><span className="text-xl font-bold text-[#D0B8A8]" data-testid={`order-total-${order.order_id}`}>₹{order.total_amount}</span></div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
