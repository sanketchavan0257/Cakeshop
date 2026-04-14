import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/admin/users`, { withCredentials: true });
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl mb-8 text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }} data-testid="admin-users-heading">Manage Users</h1>
        <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#D0B8A8]/20"><tr><th className="px-6 py-3 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Name</th><th className="px-6 py-3 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Email</th><th className="px-6 py-3 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Role</th><th className="px-6 py-3 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">Joined</th></tr></thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={idx} className="border-t border-[rgba(44,30,22,0.15)]" data-testid={`user-${user.email}`}><td className="px-6 py-4 text-sm text-[#2C1E16] dark:text-[#FAFAF7]">{user.name}</td><td className="px-6 py-4 text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">{user.email}</td><td className="px-6 py-4 text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">{user.role}</td><td className="px-6 py-4 text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">{new Date(user.created_at).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
