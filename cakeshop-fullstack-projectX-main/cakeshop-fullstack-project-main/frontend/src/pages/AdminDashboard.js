import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Package, Users, ShoppingBag, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/stats`, { withCredentials: true });
      setStats(data);
    } catch (error) {
      toast.error('Failed to load stats');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl mb-8 text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }} data-testid="admin-dashboard-heading">Admin Dashboard</h1>
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6"><Users className="h-8 w-8 text-[#D0B8A8] mb-3" /><p className="text-2xl font-bold text-[#2C1E16] dark:text-[#FAFAF7]" data-testid="total-users">{stats.total_users}</p><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Total Users</p></div>
            <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6"><Package className="h-8 w-8 text-[#D0B8A8] mb-3" /><p className="text-2xl font-bold text-[#2C1E16] dark:text-[#FAFAF7]" data-testid="total-orders">{stats.total_orders}</p><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Total Orders</p></div>
            <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6"><ShoppingBag className="h-8 w-8 text-[#D0B8A8] mb-3" /><p className="text-2xl font-bold text-[#2C1E16] dark:text-[#FAFAF7]" data-testid="total-cakes">{stats.total_cakes}</p><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Total Cakes</p></div>
            <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6"><DollarSign className="h-8 w-8 text-[#D0B8A8] mb-3" /><p className="text-2xl font-bold text-[#2C1E16] dark:text-[#FAFAF7]" data-testid="total-revenue">₹{stats.total_revenue}</p><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Total Revenue</p></div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link to="/admin/cakes" data-testid="manage-cakes-link"><div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6 hover:shadow-lg transition-shadow"><h3 className="text-xl font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Manage Cakes</h3></div></Link>
          <Link to="/admin/orders" data-testid="manage-orders-link"><div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6 hover:shadow-lg transition-shadow"><h3 className="text-xl font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Manage Orders</h3></div></Link>
          <Link to="/admin/users" data-testid="manage-users-link"><div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6 hover:shadow-lg transition-shadow"><h3 className="text-xl font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Manage Users</h3></div></Link>
        </div>
      </div>
    </div>
  );
}
