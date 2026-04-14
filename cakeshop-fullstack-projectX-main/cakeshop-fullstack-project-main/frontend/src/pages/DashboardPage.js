import { Link } from 'react-router-dom';
import { Package, Heart, Clock, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl mb-8 text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }} data-testid="dashboard-heading">Dashboard</h1>
        <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6 mb-8">
          <h2 className="text-2xl mb-2 text-[#2C1E16] dark:text-[#FAFAF7]">Profile</h2>
          <p className="text-[#5C4A3D] dark:text-[#D0B8A8]">Name: {user?.name}</p>
          <p className="text-[#5C4A3D] dark:text-[#D0B8A8]">Email: {user?.email}</p>
          <p className="text-[#5C4A3D] dark:text-[#D0B8A8]">Role: {user?.role}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/orders" data-testid="orders-card"><div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6 hover:shadow-lg transition-shadow"><Package className="h-8 w-8 text-[#D0B8A8] mb-3" /><h3 className="text-xl font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">My Orders</h3><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">View order history</p></div></Link>
          <Link to="/favorites" data-testid="favorites-card"><div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6 hover:shadow-lg transition-shadow"><Heart className="h-8 w-8 text-[#D0B8A8] mb-3" /><h3 className="text-xl font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Favorites</h3><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Your favorite cakes</p></div></Link>
          <Link to="/waitlist" data-testid="waitlist-card"><div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6 hover:shadow-lg transition-shadow"><Clock className="h-8 w-8 text-[#D0B8A8] mb-3" /><h3 className="text-xl font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Waitlist</h3><p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">Out of stock items</p></div></Link>
        </div>
      </div>
    </div>
  );
}
