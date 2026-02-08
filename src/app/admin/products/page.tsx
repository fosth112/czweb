'use client';

import Nav from '@/app/components/Nav';
import Footer from '@/app/components/Footer';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from '@/utils/axiosInstance';
import { FaBox, FaPlus, FaEdit, FaTrash, FaWarehouse } from 'react-icons/fa';
import AdminProtected from '@/auth/AdminProtected';
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  status: number;
  timestamp: string;
  stock: number;
}

interface Stock {
  id: string;
  id_product: string;
  stock: string; // URL/string
  status: number; // 0 = active, 1 = inactive
  timespame: string;
}

function AdminProductsPageContent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStockForm, setShowStockForm] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    price: '',
    status: '0'
  });

  const [stockData, setStockData] = useState({
    stock: '',
    status: '0'
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.image_url || !formData.price) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      if (editingProduct) {
        // Update product
        const response = await axios.put(`/product/${editingProduct.id}`, formData);
        if (response.data.success) {
          toast.success('อัปเดตสินค้าสำเร็จ');
          setEditingProduct(null);
          resetForm();
          fetchProducts();
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Create product
        const response = await axios.post('/product', formData);
        if (response.data.success) {
          toast.success('สร้างสินค้าสำเร็จ');
          setShowAddForm(false);
          resetForm();
          fetchProducts();
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในระบบ');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('คุณต้องการลบสินค้านี้หรือไม่?')) return;

    try {
      const response = await axios.delete(`/product/${productId}`);
      if (response.data.success) {
        toast.success('ลบสินค้าสำเร็จ');
        fetchProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในระบบ');
    }
  };

  const handleAddStock = async (productId: string) => {
    if (!stockData.stock.trim()) {
      toast.error('กรุณากรอกข้อมูลสต็อก');
      return;
    }

    try {
      const response = await axios.post(`/product/${productId}/stock`, stockData);
      if (response.data.success) {
        toast.success('เพิ่มสต็อกสำเร็จ');
        setShowStockForm(null);
        setStockData({ stock: '', status: '0' });
        fetchProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในระบบ');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image_url: '',
      price: '',
      status: '0'
    });
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      image_url: product.image_url,
      price: product.price.toString(),
      status: product.status.toString()
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  const getStatusText = (status: number) => {
    return status === 0 ? 'พร้อมจำหน่าย' : 'ไม่พร้อมจำหน่าย';
  };

  const getStatusColor = (status: number) => {
    return status === 0 ? 'text-green-600' : 'text-red-600';
  };

  const getStockStatusText = (status: number) => {
    return status === 0 ? 'ใช้งาน' : 'ไม่ใช้งาน';
  };

  const getStockStatusColor = (status: number) => {
    return status === 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">จัดการสินค้า</h1>
          <p className="text-gray-600">สร้างและจัดการสินค้าสำหรับระบบ</p>
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingProduct(null);
              resetForm();
            }}
            className="flex items-center gap-2"
          >
            <FaPlus />
            {showAddForm ? 'ยกเลิก' : 'เพิ่มสินค้า'}
          </Button>
        </div>

        {/* Add/Edit Product Form */}
        {(showAddForm || editingProduct) && (
          <Card className="bg-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaBox className="text-blue-500" />
                {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อสินค้า
                    </label>
                    <Input
                      type="text"
                      placeholder="ชื่อสินค้า"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL รูปภาพ
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ราคา (บาท)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สถานะ
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="0">พร้อมจำหน่าย</option>
                      <option value="1">ไม่พร้อมจำหน่าย</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingProduct ? 'อัปเดต' : 'สร้างสินค้า'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id} className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/96x96?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {product.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>ราคา: {product.price.toLocaleString()} บาท</p>
                          <p>สต็อก: {product.stock} รายการ</p>
                          <p className={`font-medium ${getStatusColor(product.status)}`}>
                            สถานะ: {getStatusText(product.status)}
                          </p>
                          <p>วันที่สร้าง: {formatDate(product.timestamp)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editProduct(product)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowStockForm(showStockForm === product.id ? null : product.id)}
                        >
                          <FaWarehouse />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>

                    {/* Add Stock Form */}
                    {showStockForm === product.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">เพิ่มสต็อก</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              URL/ข้อมูลสต็อก
                            </label>
                            <Textarea
                              placeholder="https://example.com หรือ ข้อมูลสต็อก"
                              value={stockData.stock}
                              onChange={(e) => setStockData({ ...stockData, stock: e.target.value })}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              สถานะสต็อก
                            </label>
                            <select
                              value={stockData.status}
                              onChange={(e) => setStockData({ ...stockData, status: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="0">ใช้งาน</option>
                              <option value="1">ไม่ใช้งาน</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddStock(product.id)}
                            >
                              เพิ่มสต็อก
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowStockForm(null);
                                setStockData({ stock: '', status: '0' });
                              }}
                            >
                              ยกเลิก
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {products.length === 0 && (
            <Card className="bg-white shadow-lg">
              <CardContent className="text-center py-12">
                <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  ยังไม่มีสินค้าในระบบ
                </h3>
                <p className="text-gray-500">
                  เพิ่มสินค้าแรกของคุณเพื่อเริ่มต้น
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminProtected>
      <Nav />
      <AdminProductsPageContent />
      <Footer />
    </AdminProtected>
  );
} 