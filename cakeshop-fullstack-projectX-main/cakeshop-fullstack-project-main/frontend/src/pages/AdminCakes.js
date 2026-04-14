import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Search, TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import EditCakeModal from '../components/EditCakeModal';
import AddCakeModal from '../components/AddCakeModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminCakes() {
  const [cakes, setCakes] = useState([]);
  const [filteredCakes, setFilteredCakes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCake, setEditingCake] = useState(null);
  const [deletingCake, setDeletingCake] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchCakes();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredCakes(
        cakes.filter(
          (cake) =>
            cake.name.toLowerCase().includes(search.toLowerCase()) ||
            cake.category.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredCakes(cakes);
    }
  }, [search, cakes]);

  const fetchCakes = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/cakes`);
      setCakes(data);
      setFilteredCakes(data);
    } catch (error) {
      toast.error('Failed to load cakes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cake) => {
    setEditingCake(cake);
  };

  const handleUpdate = (updatedCake) => {
    setCakes(cakes.map((c) => (c.cake_id === updatedCake.cake_id ? updatedCake : c)));
    setEditingCake(null);
  };

  const handleAdd = (newCake) => {
    setCakes([newCake, ...cakes]);
    setIsAddModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deletingCake) return;

    try {
      await axios.delete(`${API}/cakes/${deletingCake.cake_id}`, {
        withCredentials: true,
      });
      setCakes(cakes.filter((c) => c.cake_id !== deletingCake.cake_id));
      toast.success('Cake deleted successfully');
      setDeletingCake(null);
    } catch (error) {
      toast.error('Failed to delete cake');
    }
  };

  const toggleStock = async (cake) => {
    try {
      const { data } = await axios.put(
        `${API}/cakes/${cake.cake_id}`,
        { in_stock: !cake.in_stock },
        { withCredentials: true }
      );
      setCakes(cakes.map((c) => (c.cake_id === cake.cake_id ? data : c)));
      toast.success(`Cake marked as ${!cake.in_stock ? 'in stock' : 'out of stock'}`);
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const stats = {
    totalCakes: cakes.length,
    inStock: cakes.filter((c) => c.in_stock).length,
    outOfStock: cakes.filter((c) => !c.in_stock).length,
    avgPrice: cakes.length > 0 ? Math.round(cakes.reduce((sum, c) => sum + c.base_price, 0) / cakes.length) : 0,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#2C1E16]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl sm:text-5xl mb-2 text-[#2C1E16] dark:text-[#FAFAF7]"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="admin-cakes-heading"
          >
            Manage Cakes
          </h1>
          <p className="text-[#5C4A3D] dark:text-[#D0B8A8]">
            Manage your cake inventory, pricing, and availability
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8] uppercase tracking-wide">
                Total Cakes
              </p>
              <Package className="h-5 w-5 text-[#D0B8A8]" />
            </div>
            <p className="text-3xl font-bold text-[#2C1E16] dark:text-[#FAFAF7]" data-testid="total-cakes-stat">
              {stats.totalCakes}
            </p>
          </div>

          <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8] uppercase tracking-wide">
                In Stock
              </p>
              <TrendingUp className="h-5 w-5 text-[#81B29A]" />
            </div>
            <p className="text-3xl font-bold text-[#81B29A]" data-testid="in-stock-stat">
              {stats.inStock}
            </p>
          </div>

          <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8] uppercase tracking-wide">
                Out of Stock
              </p>
              <TrendingDown className="h-5 w-5 text-[#E07A5F]" />
            </div>
            <p className="text-3xl font-bold text-[#E07A5F]" data-testid="out-of-stock-stat">
              {stats.outOfStock}
            </p>
          </div>

          <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8] uppercase tracking-wide">
                Avg Price
              </p>
              <DollarSign className="h-5 w-5 text-[#D0B8A8]" />
            </div>
            <p className="text-3xl font-bold text-[#2C1E16] dark:text-[#FAFAF7]" data-testid="avg-price-stat">
              ₹{stats.avgPrice}
            </p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5C4A3D] h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                data-testid="search-cakes-input"
              />
            </div>
            <Button
              className="bg-[#D0B8A8] hover:bg-[#B89B88] text-white whitespace-nowrap"
              onClick={() => setIsAddModalOpen(true)}
              data-testid="add-cake-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Cake
            </Button>
          </div>
        </div>

        {/* Cakes Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D0B8A8] mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#3C2E26] border border-[rgba(44,30,22,0.15)] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#D0B8A8]/10 border-b border-[rgba(44,30,22,0.15)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7] uppercase tracking-wide">
                      Cake
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7] uppercase tracking-wide">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7] uppercase tracking-wide">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7] uppercase tracking-wide">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7] uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-[#2C1E16] dark:text-[#FAFAF7] uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(44,30,22,0.15)]">
                  {filteredCakes.map((cake) => (
                    <tr
                      key={cake.cake_id}
                      className="hover:bg-[#FAFAF7] dark:hover:bg-[#2C1E16]/50 transition-colors"
                      data-testid={`cake-row-${cake.cake_id}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={cake.image_url}
                            alt={cake.name}
                            className="w-16 h-16 object-cover rounded-lg border border-[rgba(44,30,22,0.15)]"
                          />
                          <div>
                            <p className="font-semibold text-[#2C1E16] dark:text-[#FAFAF7]">
                              {cake.name}
                            </p>
                            <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8] truncate max-w-xs">
                              {cake.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D0B8A8]/20 text-[#2C1E16] dark:text-[#FAFAF7]">
                          {cake.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#D0B8A8]">₹{cake.base_price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#2C1E16] dark:text-[#FAFAF7]">{cake.stock}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStock(cake)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                            cake.in_stock
                              ? 'bg-[#81B29A]/20 text-[#81B29A] hover:bg-[#81B29A]/30'
                              : 'bg-[#E07A5F]/20 text-[#E07A5F] hover:bg-[#E07A5F]/30'
                          }`}
                          data-testid={`status-badge-${cake.cake_id}`}
                        >
                          {cake.in_stock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cake)}
                            className="hover:bg-[#D0B8A8]/20 text-[#D0B8A8]"
                            data-testid={`edit-cake-${cake.cake_id}`}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCake(cake)}
                            className="hover:bg-[#E07A5F]/20 text-[#E07A5F]"
                            data-testid={`delete-cake-${cake.cake_id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCakes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#5C4A3D] dark:text-[#D0B8A8]">
                  {search ? 'No cakes found matching your search' : 'No cakes available'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditCakeModal
        isOpen={!!editingCake}
        onClose={() => setEditingCake(null)}
        cake={editingCake}
        onUpdate={handleUpdate}
      />

      {/* Add Modal */}
      <AddCakeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAdd}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCake} onOpenChange={() => setDeletingCake(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingCake?.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#E07A5F] hover:bg-[#C96850]"
              data-testid="confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
