"use client";

import { useEffect, useState } from 'react';
import { Protected } from '@/auth/Protected';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FaBox, FaCopy } from 'react-icons/fa';
import axios from '@/utils/axiosInstance';
import { toast } from 'sonner';
import Nav from '@/app/components/Nav';
import Footer from '@/app/components/Footer';

interface Order {
  id: string;
  userId: string;
  username: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  stocks: { id: string; stock: string }[];
  total: number;
  timestamp: string;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/order/history');
      if (response.data.success) {
        setOrders(response.data.history);
      } else {
        setError(response.data.message || 'ไม่พบประวัติการสั่งซื้อ');
      }
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการดึงประวัติการสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('th-TH');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('คัดลอกข้อมูลสต็อกแล้ว');
  };

  return (
    <>
      <Protected>
      <Nav />
      <div className="min-h-screen py-8">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-800 mb-2">ประวัติการสั่งซื้อ</h1>
            <p className="text-zinc-600">ดูรายการสินค้าที่คุณเคยซื้อ</p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FaBox className="text-6xl text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-600 mb-2">{error}</h3>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="text-6xl text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-zinc-600 mb-2">ยังไม่มีประวัติการสั่งซื้อ</h3>
              <p className="text-zinc-500">เมื่อคุณซื้อสินค้าข้อมูลจะปรากฏที่นี่</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-lg">{order.productName}</div>
                    <div className="text-blue-600 font-bold">฿ {order.productPrice.toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-zinc-600 mb-2">
                    วันที่ซื้อ: {formatDate(order.timestamp)}
                  </div>
                  <div className="text-sm text-zinc-600 mb-2">
                    จำนวน: {order.quantity} รายการ | รวม: ฿ {order.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-zinc-600 mb-2">
                    <span className="font-medium">Stock ที่ได้รับ:</span>
                    <div className="mt-1 space-y-1">
                      {order.stocks.map((s, i) => (
                        <div key={s.id || i} className="flex items-center gap-2">
                          <span className="break-all bg-zinc-50 border rounded px-2 py-1 text-xs">{s.stock}</span>
                          <Button size="icon" variant="ghost" onClick={() => handleCopy(s.stock)}>
                            <FaCopy />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      </Protected>
    </>
  );
} 