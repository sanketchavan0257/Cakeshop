import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await axios.get(`${API}/favorites`, { withCredentials: true });
      setFavorites(data);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (cakeId) => {
    try {
      await axios.delete(`${API}/favorites/${cakeId}`, { withCredentials: true });
      setFavorites(favorites.filter(fav => fav.cake_id !== cakeId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl mb-8 text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }} data-testid="favorites-heading">My Favorites</h1>
        {loading ? (
          <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0B8A8] mx-auto"></div></div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12" data-testid="no-favorites-message"><p className="text-xl text-[#5C4A3D] dark:text-[#D0B8A8]">No favorites yet</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <div key={fav.cake_id} className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg overflow-hidden" data-testid={`favorite-${fav.cake_id}`}>
                <Link to={`/cake/${fav.cake_id}`}><img src={fav.cake_image} alt={fav.cake_name} className="w-full h-48 object-cover" /></Link>
                <div className="p-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">{fav.cake_name}</h3>
                  <Button variant="ghost" size="icon" onClick={() => removeFavorite(fav.cake_id)} data-testid={`remove-favorite-${fav.cake_id}`}><Trash2 className="h-5 w-5 text-[#E07A5F]" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
