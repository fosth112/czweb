'use client';

import Nav from '@/app/components/Nav';
import Footer from '@/app/components/Footer';
import { Protected } from '@/auth/Protected';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from '@/utils/axiosInstance';
import { FaCoins, FaHistory, FaDownload } from 'react-icons/fa';

interface TopupHistory {
  id: string;
  code: string;
  amount: number;
  timestamp: string;
}

export default function TopupHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<TopupHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/topup/history');
      if (response.data.success) {
        setHistory(response.data.history);
        const total = response.data.history.reduce((sum: number, item: TopupHistory) => sum + item.amount, 0);
        setTotalAmount(total);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadHistory = () => {
    if (history.length === 0) {
      return;
    }

    const csvContent = [
      'Code,Amount,Date',
      ...history.map(item => `${item.code},${item.amount},${new Date(item.timestamp).toLocaleString('th-TH')}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topup_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Protected>
      <Nav />
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">ประวัติการเติมเงิน</h1>
            <p className="text-gray-600">ดูประวัติการเติมเงินทั้งหมดของคุณ</p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <FaHistory className="text-4xl text-blue-500" />
                </div>
                <CardTitle className="text-2xl">จำนวนครั้ง</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {history.length}
                </div>
                <p className="text-gray-600">ครั้งที่เติมเงิน</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <FaCoins className="text-4xl text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">ยอดรวม</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {totalAmount.toLocaleString()} บาท
                </div>
                <p className="text-gray-600">ยอดรวมการเติมเงิน</p>
              </CardContent>
            </Card>
          </div>

          {/* History List */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FaHistory className="text-blue-500" />
                    รายการเติมเงิน
                  </CardTitle>
                  <CardDescription>
                    ประวัติการเติมเงินทั้งหมดของคุณ
                  </CardDescription>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={downloadHistory}
                    className="flex items-center gap-2"
                  >
                    <FaDownload />
                    ดาวน์โหลด CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <FaCoins className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    ยังไม่มีประวัติการเติมเงิน
                  </h3>
                  <p className="text-gray-500">
                    เมื่อคุณใช้โค้ดเติมเงิน ประวัติจะแสดงที่นี่
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                          {history.length - index}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            โค้ด: {item.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600 text-lg">
                          +{item.amount.toLocaleString()} บาท
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {history.length > 0 && (
            <div className="mt-8">
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle>สถิติการเติมเงิน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.max(...history.map(h => h.amount)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">ยอดสูงสุดต่อครั้ง</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.min(...history.map(h => h.amount)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">ยอดต่ำสุดต่อครั้ง</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.round(totalAmount / history.length).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">ยอดเฉลี่ยต่อครั้ง</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
      </Protected>
    </>
  );
} 