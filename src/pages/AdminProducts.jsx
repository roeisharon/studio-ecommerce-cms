import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, ArrowLeft, Search, 
  Package, Eye, EyeOff, Star, StarOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await api.auth.isAuthenticated();
      if (isAuth) {
        const userData = await api.auth.me();
        setUser(userData);
      } else {
        api.auth.redirectToLogin(createPageUrl('AdminProducts'));
      }
    };
    checkAuth();
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.entities.Product.list('-created_date', 200)
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async () => {
    if (!deleteId) return;

    // Collect all image/video URLs for this product before deleting
    const product = products.find(p => p.id === deleteId);
    if (product) {
      const urls = [
        product.image_url,
        ...(product.gallery_items || []).map(i => i.url),
      ].filter(Boolean);

      if (urls.length) {
        try {
          const res = await fetch('/api/delete-image', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ urls }),
          });
          const data = await res.json();
          console.log('Cloudinary cleanup:', data);
        } catch (err) {
          console.warn('Cloudinary cleanup failed (non-fatal):', err);
        }
      }
    }

    await api.entities.Product.delete(deleteId);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    setDeleteId(null);
  };

  const toggleFeatured = async (product) => {
    await api.entities.Product.update(product.id, { featured: !product.featured });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  const toggleActive = async (product) => {
    await api.entities.Product.update(product.id, { is_active: !product.is_active });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  if (!user) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const categoryColors = {
    bowls: 'bg-blue-100 text-blue-800',
    vases: 'bg-purple-100 text-purple-800',
    mugs: 'bg-amber-100 text-amber-800',
    plates: 'bg-green-100 text-green-800'
  };

  return (
    <div className="pt-28 pb-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={createPageUrl('AdminDashboard')} 
            className="inline-flex items-center text-[#5A5A5A] hover:text-[#C4785A] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif text-[#2D2D2D]">Products</h1>
              <p className="text-[#5A5A5A] mt-1">{products.length} total products</p>
            </div>
            <Link to={createPageUrl('AdminProductEdit')}>
              <Button className="bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-none">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-none"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 rounded-none">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="bowls">Bowls</SelectItem>
              <SelectItem value="vases">Vases</SelectItem>
              <SelectItem value="mugs">Mugs</SelectItem>
              <SelectItem value="plates">Plates</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b"
                  >
                    <TableCell>
                      <div className="w-12 h-12 bg-[#FAF7F2] overflow-hidden">
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=100&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#2D2D2D]">{product.name}</p>
                        <p className="text-sm text-[#5A5A5A] line-clamp-1">{product.short_description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[product.category] || 'bg-gray-100 text-gray-800'}>
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">${product.price?.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.stock <= 0 ? 'text-red-500' : ''}>
                        {product.stock || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFeatured(product)}
                          className={`p-1 rounded transition-colors ${
                            product.featured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'
                          }`}
                          title={product.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          {product.featured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleActive(product)}
                          className={`p-1 rounded transition-colors ${
                            product.is_active ? 'text-green-500' : 'text-gray-300 hover:text-green-500'
                          }`}
                          title={product.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={createPageUrl(`AdminProductEdit?id=${product.id}`)}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteId(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#5A5A5A]">No products found</p>
            </div>
          )}
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}