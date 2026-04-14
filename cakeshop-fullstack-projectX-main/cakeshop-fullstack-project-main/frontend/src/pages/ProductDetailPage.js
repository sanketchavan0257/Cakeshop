import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Zap, Minus, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetailPage() {
  const { cakeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cake, setCake] = useState(null);
  const [weight, setWeight] = useState('1kg');
  const [flavor, setFlavor] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCake();
  }, [cakeId]);

  const fetchCake = async () => {
    try {
      const { data } = await axios.get(`${API}/cakes/${cakeId}`);
      setCake(data);
      if (data.flavors && data.flavors.length > 0) {
        setFlavor(data.flavors[0]);
      }
    } catch (error) {
      toast.error('Failed to load cake details');
    } finally {
      setLoading(false);
    }
  };

  const weightMultiplier = {
    '500g': 1.0,
    '1kg': 2.0,
    '1.5kg': 3.0,
    '2kg': 4.0,
  };

  const unitPrice = cake ? Math.round(cake.base_price * weightMultiplier[weight]) : 0;
  const totalPrice = unitPrice * quantity;

  const validateSelections = () => {
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }
    if (!validateSelections()) return;

    try {
      await axios.post(
        `${API}/cart`,
        {
          cake_id: cakeId,
          weight,
          flavor,
          message,
          delivery_date: deliveryDate,
          quantity,
        },
        { withCredentials: true }
      );
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleOrderNow = () => {
    if (!user) {
      toast.error('Please login to order');
      navigate('/login');
      return;
    }
    if (!validateSelections()) return;

    navigate('/cart', {
      state: {
        directOrder: {
          cake_id: cakeId,
          cake_name: cake.name,
          cake_image: cake.image_url,
          weight,
          flavor,
          message,
          delivery_date: deliveryDate,
          quantity,
          price: unitPrice * quantity,
        },
      },
    });
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast.error('Please login to join waitlist');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${API}/waitlist`,
        {
          cake_id: cakeId,
          email: user.email,
        },
        { withCredentials: true }
      );
      toast.success('Added to waitlist!');
      navigate('/waitlist');
    } catch (error) {
      const msg = error.response?.data?.detail;
      if (msg === 'Already in waitlist') {
        toast.info('Already in waitlist');
      } else {
        toast.error('Failed to join waitlist');
      }
    }
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

  if (!cake) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-xl text-[#5C4A3D]">Cake not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12"
        >
          <div>
            <img
              src={cake.image_url}
              alt={cake.name}
              className="w-full rounded-lg border border-[rgba(44,30,22,0.15)]"
              data-testid="cake-image"
            />
          </div>

          <div>
            <h1
              className="text-4xl sm:text-5xl text-[#2C1E16] dark:text-[#FAFAF7] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="cake-name"
            >
              {cake.name}
            </h1>
            <p className="text-base text-[#5C4A3D] dark:text-[#D0B8A8] mb-6" data-testid="cake-description">
              {cake.description}
            </p>

            <div className="space-y-6">
              <div>
                <Label className="text-lg mb-3 block text-[#2C1E16] dark:text-[#FAFAF7]">
                  Select Weight
                </Label>
                <RadioGroup value={weight} onValueChange={setWeight} data-testid="weight-selector">
                  <div className="grid grid-cols-2 gap-3">
                    {['500g', '1kg', '1.5kg', '2kg'].map((w) => (
                      <div key={w} className="flex items-center">
                        <RadioGroupItem value={w} id={w} data-testid={`weight-${w}`} />
                        <Label htmlFor={w} className="ml-2 cursor-pointer">
                          {w}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="flavor" className="text-lg mb-3 block text-[#2C1E16] dark:text-[#FAFAF7]">
                  Select Flavor
                </Label>
                <Select value={flavor} onValueChange={setFlavor}>
                  <SelectTrigger data-testid="flavor-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cake.flavors?.map((f) => (
                      <SelectItem key={f} value={f} data-testid={`flavor-${f}`}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message" className="text-lg mb-3 block text-[#2C1E16] dark:text-[#FAFAF7]">
                  Message on Cake (Optional)
                </Label>
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Happy Birthday!"
                  maxLength={50}
                  className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                  data-testid="message-input"
                />
              </div>

              <div>
                <Label htmlFor="deliveryDate" className="text-lg mb-3 block text-[#2C1E16] dark:text-[#FAFAF7]">
                  Delivery Date
                </Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                  data-testid="delivery-date-input"
                />
              </div>

              {/* Quantity Selector */}
              <div>
                <Label className="text-lg mb-3 block text-[#2C1E16] dark:text-[#FAFAF7]">
                  Quantity
                </Label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-[rgba(44,30,22,0.15)] bg-white dark:bg-[#3C2E26] flex items-center justify-center hover:bg-[#D0B8A8]/20 transition-colors"
                    data-testid="qty-decrease-btn"
                  >
                    <Minus className="h-4 w-4 text-[#2C1E16] dark:text-[#FAFAF7]" />
                  </button>
                  <span
                    className="w-12 text-center text-xl font-semibold text-[#2C1E16] dark:text-[#FAFAF7]"
                    data-testid="qty-value"
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-[rgba(44,30,22,0.15)] bg-white dark:bg-[#3C2E26] flex items-center justify-center hover:bg-[#D0B8A8]/20 transition-colors"
                    data-testid="qty-increase-btn"
                  >
                    <Plus className="h-4 w-4 text-[#2C1E16] dark:text-[#FAFAF7]" />
                  </button>
                </div>
              </div>

              <div className="border-t border-[rgba(44,30,22,0.15)] pt-6 mt-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <p className="text-3xl font-bold text-[#D0B8A8]" data-testid="total-price">
                    ₹{totalPrice}
                  </p>
                  {quantity > 1 && (
                    <span className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">
                      (₹{unitPrice} x {quantity})
                    </span>
                  )}
                </div>

                {cake.in_stock ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      className="flex-1 text-sm uppercase tracking-wide border-[#D0B8A8] text-[#D0B8A8] hover:bg-[#D0B8A8]/10 py-6"
                      data-testid="add-to-cart-button"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={handleOrderNow}
                      className="flex-1 text-sm uppercase tracking-wide bg-[#D0B8A8] hover:bg-[#B89B88] text-white py-6"
                      data-testid="order-now-button"
                    >
                      <Zap className="mr-2 h-5 w-5" />
                      Order Now
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleJoinWaitlist}
                    className="w-full text-sm uppercase tracking-wide bg-[#E07A5F] hover:bg-[#C96850] text-white py-6"
                    data-testid="join-waitlist-button"
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Join Waitlist
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
