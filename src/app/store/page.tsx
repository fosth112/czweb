'use client';

import Nav from '../components/Nav';
import Footer from '../components/Footer';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from '@/utils/axiosInstance';
import { FaBox, FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  status: number;
  timestamp: string;
  stock: number; // Count of active stock entries
}

export default function StorePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'available' && product.status === 0) ||
      (statusFilter === 'unavailable' && product.status === 1);

    return matchesSearch && matchesStatus;
  });

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    if (product.status === 1) {
      toast.error('สินค้านี้ไม่พร้อมจำหน่าย');
      return;
    }

    if (product.stock <= 0) {
      toast.error('สินค้าหมด');
      return;
    }

    // TODO: Implement cart functionality
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  };

  const getStatusText = (status: number) => {
    return status === 0 ? 'พร้อมจำหน่าย' : 'ไม่พร้อมจำหน่าย';
  };

  const getStatusColor = (status: number) => {
    return status === 0 ? 'text-green-600' : 'text-red-600';
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockText = (stock: number) => {
    if (stock === 0) return 'หมด';
    if (stock <= 3) return `เหลือ ${stock} รายการ`;
    return `${stock} รายการ`;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-zinc-600">กำลังโหลดสินค้า...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Nav />
      <div className="min-h-screen py-8">
        <div className="w-full max-w-screen-lg mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-zinc-800 mb-2">ร้านค้า</h1>
            <p className="text-zinc-600">เลือกซื้อสินค้าที่คุณต้องการ</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="bg-white">
              <div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      ค้นหาสินค้า
                    </label>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                      <Input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      กรองตามสถานะ
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2 border border-zinc-300 rounded-md"
                    >
                      <option value="all">ทั้งหมด</option>
                      <option value="available">พร้อมจำหน่าย</option>
                      <option value="unavailable">ไม่พร้อมจำหน่าย</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border p-2 shadow rounded-md">
                <div className="relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs border border-green-300 ${getStatusColor(product.status)} bg-white`}>
                      {getStatusText(product.status)}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="font-semibold line-clamp-1">
                    {product.name}
                  </h4>
                  <div className='flex justify-between text-xs items-center'>
                    <p className={`${getStockColor(product.stock)}`}>
                      {getStockText(product.stock)}
                    </p>
                    <p>
                      ฿ {product.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={product.status === 1 || product.stock <= 0}
                      onClick={() => router.push(`/store/${product.id}`)}
                    >
                      รายละเอียด
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div>
              <CardContent className="text-center py-12">
                <FaBox className="text-6xl text-zinc-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-600 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'ไม่พบสินค้าที่ค้นหา' : 'ยังไม่มีสินค้าในร้าน'}
                </h3>
                <p className="text-zinc-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'
                    : 'สินค้าจะปรากฏที่นี่เมื่อมีการเพิ่มสินค้าใหม่'
                  }
                </p>
              </CardContent>
            </div>
          )}

          {/* Product Count */}
          {filteredProducts.length > 0 && (
            <div className="mt-8 text-sm text-center text-zinc-600">
              แสดงสินค้า {filteredProducts.length} รายการจากทั้งหมด {products.length} รายการ
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
} 