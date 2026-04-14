import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Trash2, CreditCard, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const directOrder = location.state?.directOrder || null;
  const isDirectOrder = !!directOrder;

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(!isDirectOrder);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_mobile: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!isDirectOrder) {
      fetchCart();
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        user_name: user.name || '',
        user_email: user.email || '',
      }));
    }
  }, [user, isDirectOrder]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(`${API}/cart`, { withCredentials: true });
      setCartItems(data);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`${API}/cart/${itemId}`, { withCredentials: true });
      setCartItems(cartItems.filter(item => item.cart_item_id !== itemId));
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const displayItems = isDirectOrder ? [directOrder] : cartItems;
  const total = isDirectOrder
    ? directOrder.price
    : cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (!formData.user_name || !formData.user_email || !formData.user_mobile) {
      toast.error('Please fill in your name, email, and mobile number');
      return;
    }
    if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in complete delivery address');
      return;
    }
    if (formData.user_mobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (formData.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/orders`,
        {
          items: displayItems,
          total_amount: total,
          user_name: formData.user_name,
          user_email: formData.user_email,
          user_mobile: formData.user_mobile,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          is_direct_order: isDirectOrder,
        },
        { withCredentials: true }
      );
      toast.success('Order placed successfully! Pay on delivery.');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {isDirectOrder && (
          <div className="mb-6 flex items-center gap-2 bg-[#D0B8A8]/15 border border-[#D0B8A8]/30 text-[#5C4A3D] dark:text-[#D0B8A8] px-4 py-3 rounded-lg text-sm" data-testid="direct-order-banner">
            <Zap className="h-4 w-4 text-[#D0B8A8]" />
            Quick order — complete your details below to place this order directly.
          </div>
        )}

        <h1
          className="text-4xl mb-8 text-[#2C1E16] dark:text-[#FAFAF7]"
          style={{ fontFamily: "'Playfair Display', serif" }}
          data-testid="cart-heading"
        >
          {isDirectOrder ? 'Quick Checkout' : 'Shopping Cart'}
        </h1>

        {loading ? (
          <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0B8A8] mx-auto"></div></div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-12" data-testid="empty-cart-message">
            <p className="text-xl text-[#5C4A3D] dark:text-[#D0B8A8] mb-6">Your cart is empty</p>
            <Button onClick={() => navigate('/')} className="bg-[#D0B8A8] hover:bg-[#B89B88]">Continue Shopping</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-semibold text-[#2C1E16] dark:text-[#FAFAF7] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                {isDirectOrder ? 'Order Item' : `Cart Items (${cartItems.length})`}
              </h2>
              {displayItems.map((item, idx) => (
                <motion.div
                  key={item.cart_item_id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-4 flex gap-4"
                  data-testid={`cart-item-${item.cart_item_id || idx}`}
                >
                  <img src={item.cake_image} alt={item.cake_name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">{item.cake_name}</h3>
                    <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Weight: {item.weight}</p>
                    <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Flavor: {item.flavor}</p>
                    {item.message && <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Message: "{item.message}"</p>}
                    <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Delivery: {item.delivery_date}</p>
                    {item.quantity > 1 && <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Qty: {item.quantity}</p>}
                    <p className="text-lg font-bold text-[#D0B8A8] mt-2">₹{item.price}</p>
                  </div>
                  {!isDirectOrder && (
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.cart_item_id)} className="hover:bg-[#E07A5F]/20" data-testid={`remove-item-${item.cart_item_id}`}>
                      <Trash2 className="h-5 w-5 text-[#E07A5F]" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6">
                <h2 className="text-2xl mb-4 text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Delivery Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user_name" className="text-[#2C1E16] dark:text-[#FAFAF7]">Full Name *</Label>
                    <Input id="user_name" name="user_name" value={formData.user_name} onChange={handleInputChange} placeholder="Enter your full name" className="border-[rgba(44,30,22,0.15)]" data-testid="name-input" required />
                  </div>
                  <div>
                    <Label htmlFor="user_email" className="text-[#2C1E16] dark:text-[#FAFAF7]">Email *</Label>
                    <Input id="user_email" name="user_email" type="email" value={formData.user_email} onChange={handleInputChange} placeholder="your@email.com" className="border-[rgba(44,30,22,0.15)]" data-testid="email-input" required />
                  </div>
                  <div>
                    <Label htmlFor="user_mobile" className="text-[#2C1E16] dark:text-[#FAFAF7]">Mobile Number * (10 digits)</Label>
                    <Input id="user_mobile" name="user_mobile" type="tel" value={formData.user_mobile} onChange={handleInputChange} placeholder="10-digit mobile number" maxLength={10} className="border-[rgba(44,30,22,0.15)]" data-testid="mobile-input" required />
                  </div>

                  <div className="border-t border-[rgba(44,30,22,0.15)] pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-[#2C1E16] dark:text-[#FAFAF7] mb-3">Delivery Address</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="street" className="text-[#2C1E16] dark:text-[#FAFAF7]">Street Address *</Label>
                        <Input id="street" name="street" value={formData.street} onChange={handleInputChange} placeholder="House no., street name" className="border-[rgba(44,30,22,0.15)]" data-testid="street-input" required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="city" className="text-[#2C1E16] dark:text-[#FAFAF7]">City *</Label>
                          <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="border-[rgba(44,30,22,0.15)]" data-testid="city-input" required />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-[#2C1E16] dark:text-[#FAFAF7]">State *</Label>
                          <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="border-[rgba(44,30,22,0.15)]" data-testid="state-input" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="pincode" className="text-[#2C1E16] dark:text-[#FAFAF7]">Pincode * (6 digits)</Label>
                        <Input id="pincode" name="pincode" type="text" value={formData.pincode} onChange={handleInputChange} placeholder="6-digit pincode" maxLength={6} className="border-[rgba(44,30,22,0.15)]" data-testid="pincode-input" required />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6">
                <h2 className="text-2xl mb-4 text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Order Summary
                </h2>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[#5C4A3D] dark:text-[#D0B8A8]">
                    <span>Subtotal:</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between text-[#5C4A3D] dark:text-[#D0B8A8]">
                    <span>Delivery:</span>
                    <span className="text-[#81B29A]">FREE</span>
                  </div>
                </div>

                <div className="border-t border-[rgba(44,30,22,0.15)] pt-4 mb-6">
                  <div className="flex justify-between text-2xl font-bold text-[#D0B8A8]">
                    <span>Total:</span>
                    <span data-testid="cart-total">₹{total}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-[#FAFAF7] dark:bg-[#2C1E16] border border-[rgba(44,30,22,0.15)] rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-[#D0B8A8]" />
                    <div>
                      <p className="font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Cash on Delivery (COD)</p>
                      <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Pay when you receive your order</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={placeOrder}
                  disabled={submitting}
                  className="w-full bg-[#D0B8A8] hover:bg-[#B89B88] text-white py-6 text-sm uppercase tracking-wide"
                  data-testid="place-order-button"
                >
                  {submitting ? 'Placing Order...' : isDirectOrder ? 'Place Order Now (COD)' : 'Place Order (COD)'}
                </Button>

                <p className="text-xs text-center text-[#5C4A3D] dark:text-[#D0B8A8] mt-3">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
