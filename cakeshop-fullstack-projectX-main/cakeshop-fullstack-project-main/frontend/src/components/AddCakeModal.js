import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AddCakeModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    category: 'Chocolate',
    image_url: '',
    stock: 10,
    in_stock: true,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image_url: url }));
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.base_price || !formData.image_url) {
      toast.error('Name, price, and image are required');
      return;
    }

    const priceNum = parseFloat(formData.base_price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const cakeData = {
        name: formData.name,
        description: formData.description,
        base_price: priceNum,
        category: formData.category,
        image_url: formData.image_url,
        stock: parseInt(formData.stock) || 10,
        in_stock: formData.in_stock,
        flavors: getDefaultFlavors(formData.category),
      };

      const { data } = await axios.post(
        `${API}/cakes`,
        cakeData,
        { withCredentials: true }
      );

      toast.success('Cake added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        base_price: '',
        category: 'Chocolate',
        image_url: '',
        stock: 10,
        in_stock: true,
      });
      setImagePreview('');
      
      onAdd(data);
      onClose();
    } catch (error) {
      console.error('Add error:', error);
      toast.error(error.response?.data?.detail || 'Failed to add cake');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultFlavors = (category) => {
    const flavorMap = {
      'Chocolate': ['Chocolate', 'Dark Chocolate', 'White Chocolate'],
      'Fruit': ['Strawberry', 'Blueberry', 'Mixed Berry'],
      'Classic': ['Vanilla', 'Butterscotch', 'Caramel'],
      'Cheesecake': ['Classic', 'Blueberry', 'Strawberry'],
      'Special': ['Red Velvet', 'Black Forest', 'Pineapple'],
    };
    return flavorMap[category] || ['Vanilla', 'Chocolate'];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#2C1E16] dark:text-[#FAFAF7]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Add New Cake
          </DialogTitle>
          <DialogDescription className="text-[#5C4A3D] dark:text-[#D0B8A8]">
            Create a new cake product for your shop
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="add-cake-form">
          {/* Image Preview */}
          {imagePreview && (
            <div className="flex justify-center">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-md h-48 object-cover rounded-lg border border-[rgba(44,30,22,0.15)]"
                onError={() => setImagePreview('')}
              />
            </div>
          )}

          {/* Image URL */}
          <div>
            <Label htmlFor="image_url" className="text-[#2C1E16] dark:text-[#FAFAF7]">
              Image URL *
            </Label>
            <div className="flex gap-2">
              <Input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/cake-image.jpg"
                required
                className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                data-testid="image-url-input"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setImagePreview(formData.image_url)}
                className="shrink-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-[#5C4A3D] dark:text-[#D0B8A8] mt-1">
              Enter image URL and click upload icon to preview
            </p>
          </div>

          {/* Cake Name */}
          <div>
            <Label htmlFor="name" className="text-[#2C1E16] dark:text-[#FAFAF7]">
              Cake Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Chocolate Truffle Cake"
              required
              className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
              data-testid="cake-name-input"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-[#2C1E16] dark:text-[#FAFAF7]">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your delicious cake..."
              rows={3}
              className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16] resize-none"
              data-testid="description-input"
            />
          </div>

          {/* Price and Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base_price" className="text-[#2C1E16] dark:text-[#FAFAF7]">
                Base Price (₹) *
              </Label>
              <Input
                id="base_price"
                name="base_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.base_price}
                onChange={handleInputChange}
                placeholder="e.g., 850"
                required
                className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                data-testid="price-input"
              />
            </div>

            <div>
              <Label htmlFor="stock" className="text-[#2C1E16] dark:text-[#FAFAF7]">
                Stock Quantity
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="10"
                className="border-[rgba(44,30,22,0.15)] focus:ring-1 focus:ring-[#2C1E16]"
                data-testid="stock-input"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="text-[#2C1E16] dark:text-[#FAFAF7]">
              Category
            </Label>
            <Select value={formData.category} onValueChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}>
              <SelectTrigger data-testid="category-select">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chocolate">Chocolate</SelectItem>
                <SelectItem value="Fruit">Fruit</SelectItem>
                <SelectItem value="Classic">Classic</SelectItem>
                <SelectItem value="Cheesecake">Cheesecake</SelectItem>
                <SelectItem value="Special">Special</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#FAFAF7] dark:bg-[#3C2E26] rounded-lg border border-[rgba(44,30,22,0.15)]">
            <div>
              <Label htmlFor="in_stock" className="text-[#2C1E16] dark:text-[#FAFAF7] font-semibold">
                Available for Sale
              </Label>
              <p className="text-sm text-[#5C4A3D] dark:text-[#D0B8A8]">
                Enable to make this cake available for purchase
              </p>
            </div>
            <Switch
              id="in_stock"
              checked={formData.in_stock}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, in_stock: checked }))}
              data-testid="in-stock-switch"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[rgba(44,30,22,0.15)]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[rgba(44,30,22,0.15)]"
              disabled={loading}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#D0B8A8] hover:bg-[#B89B88] text-white"
              data-testid="submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Cake'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
