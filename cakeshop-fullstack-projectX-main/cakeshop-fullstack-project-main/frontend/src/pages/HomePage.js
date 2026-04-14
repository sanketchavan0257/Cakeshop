import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Search, Heart, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const [cakes, setCakes] = useState([]);
  const [filteredCakes, setFilteredCakes] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCakes();
  }, []);

  useEffect(() => {
    filterCakes();
  }, [search, category, cakes]);

  const fetchCakes = async () => {
    try {
      const { data } = await axios.get(`${API}/cakes`);
      setCakes(data);
      setFilteredCakes(data);
    } catch (error) {
      toast.error('Failed to load cakes');
    } finally {
      setLoading(false);
    }
  };

  const filterCakes = () => {
    let filtered = [...cakes];
    
    if (search) {
      filtered = filtered.filter(cake =>
        cake.name.toLowerCase().includes(search.toLowerCase()) ||
        cake.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(cake => cake.category === category);
    }
    
    setFilteredCakes(filtered);
  };

  const addToFavorites = async (cakeId, e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }
    try {
      await axios.post(`${API}/favorites/${cakeId}`, {}, { withCredentials: true });
      toast.success('Added to favorites!');
    } catch (error) {
      if (error.response?.data?.detail === 'Already in favorites') {
        toast.info('Already in favorites');
      } else {
        toast.error('Failed to add to favorites');
      }
    }
  };

  const categories = ['all', 'Chocolate', 'Fruit', 'Classic', 'Cheesecake', 'Special'];

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[70vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(208, 184, 168, 0.3), rgba(243, 208, 215, 0.3)), url('https://images.unsplash.com/photo-1726981897420-0778c14deedf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwzfHxiYWtlcnklMjBpbnRlcmlvcnxlbnwwfHx8fDE3NzU3NDM5OTR8MA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center z-10 px-4">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-6xl tracking-tight leading-none text-[#2C1E16] dark:text-[#FAFAF7] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="hero-heading"
          >
            Handcrafted Cakes
            <br />
            Made with Love
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-base leading-relaxed text-[#5C4A3D] dark:text-[#D0B8A8] mb-8 max-w-2xl mx-auto"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Premium cakes for every celebration. Customize your perfect cake with
            our selection of flavors, sizes, and designs.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button
              onClick={() => document.getElementById('cakes-section').scrollIntoView({ behavior: 'smooth' })}
              className="text-sm uppercase tracking-wide bg-[#D0B8A8] hover:bg-[#B89B88] text-white px-8 py-6 hover:-translate-y-1 transition-transform"
              data-testid="explore-cakes-button"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Explore Cakes
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Search & Filter Section */}
      <section id="cakes-section" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5C4A3D] h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search cakes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16] rounded-md"
                  data-testid="search-input"
                />
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? 'default' : 'outline'}
                    onClick={() => setCategory(cat)}
                    className={`text-sm uppercase tracking-wide ${
                      category === cat
                        ? 'bg-[#D0B8A8] hover:bg-[#B89B88] text-white'
                        : 'border-[rgba(44,30,22,0.15)] hover:bg-[#D0B8A8]/10'
                    }`}
                    data-testid={`category-${cat}-button`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Cakes Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredCakes.map((cake, index) => (
                <motion.div
                  key={cake.cake_id}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to={`/cake/${cake.cake_id}`} data-testid={`cake-card-${cake.cake_id}`}>
                    <div className="group border border-[rgba(44,30,22,0.15)] rounded-lg overflow-hidden bg-white dark:bg-[#3C2E26] hover:shadow-lg transition-shadow">
                      <div className="overflow-hidden">
                        <img
                          src={cake.image_url}
                          alt={cake.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3
                            className="text-xl sm:text-2xl text-[#2C1E16] dark:text-[#FAFAF7]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {cake.name}
                          </h3>
                          <button
                            onClick={(e) => addToFavorites(cake.cake_id, e)}
                            className="hover:text-[#E07A5F] transition-colors"
                            data-testid={`add-favorite-${cake.cake_id}`}
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8] mb-3">
                          {cake.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-[#D0B8A8]">
                            ₹{cake.base_price}
                          </span>
                          {!cake.in_stock && (
                            <span className="text-xs uppercase tracking-wide text-[#E07A5F] bg-[#E07A5F]/10 px-3 py-1 rounded-full">
                              Out of Stock
                            </span>
                          )}
                          {cake.in_stock && (
                            <span className="text-xs uppercase tracking-wide text-[#81B29A] bg-[#81B29A]/10 px-3 py-1 rounded-full">
                              In Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {filteredCakes.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-xl text-[#5C4A3D] dark:text-[#D0B8A8]">
                No cakes found. Try a different search or filter.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
