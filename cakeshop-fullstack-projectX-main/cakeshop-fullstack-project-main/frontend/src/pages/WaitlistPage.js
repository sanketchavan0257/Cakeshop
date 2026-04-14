import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const { data } = await axios.get(`${API}/waitlist`, { withCredentials: true });
      setWaitlist(data);
    } catch (error) {
      toast.error('Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl mb-8 text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }} data-testid="waitlist-heading">My Waitlist</h1>
        {loading ? (
          <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0B8A8] mx-auto"></div></div>
        ) : waitlist.length === 0 ? (
          <div className="text-center py-12" data-testid="no-waitlist-message"><p className="text-xl text-[#5C4A3D] dark:text-[#D0B8A8]">No items in waitlist</p></div>
        ) : (
          <div className="space-y-4">
            {waitlist.map((item) => (
              <div key={item.waitlist_id} className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6" data-testid={`waitlist-item-${item.waitlist_id}`}>
                <h3 className="text-lg font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">{item.cake_name}</h3>
                <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Status: {item.status}</p>
                <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Added: {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
