'use client';

import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { Protected } from '@/auth/Protected';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from '@/utils/axiosInstance';
import { FaCoins, FaHistory, FaCheckCircle } from 'react-icons/fa';

interface TopupHistory {
  id: string;
  code: string;
  amount: number;
  timestamp: string;
}

export default function TopupPage() {
  const { refreshUserData } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<TopupHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchPoints();
    fetchHistory();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await axios.get('/topup/points');
      if (response.data.success) {
        setPoints(response.data.points);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/topup/history');
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleRedeemCode = async () => {
    if (!code.trim()) {
      toast.error('กรุณากรอกโค้ดเติมเงิน');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/topup/redeem', { code });

      if (response.data.success) {
        toast.success(response.data.message);
        setCode('');
        fetchPoints();
        fetchHistory();
        refreshUserData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในระบบ');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  return (
    <>
      <Protected>
      <Nav />
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">เติมเงิน</h1>
            <p className="text-gray-600">ใช้โค้ดเติมเงินเพื่อเพิ่มคะแนนในบัญชีของคุณ</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Points Card */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <FaCoins className="text-4xl text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">คะแนนปัจจุบัน</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {points.toLocaleString()} บาท
                </div>
                <p className="text-gray-600">คะแนนที่สามารถใช้ได้</p>
              </CardContent>
            </Card>

            {/* Redeem Code Card */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  ใช้โค้ดเติมเงิน
                </CardTitle>
                <CardDescription>
                  กรอกโค้ดเติมเงินเพื่อเพิ่มคะแนนในบัญชี
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="กรอกโค้ดเติมเงิน (เช่น: ABC12345)"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono"
                    maxLength={8}
                  />
                </div>
                <Button
                  onClick={handleRedeemCode}
                  disabled={loading || !code.trim()}
                  className="w-full"
                >
                  {loading ? 'กำลังประมวลผล...' : 'ใช้โค้ด'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* History Section */}
          <div className="mt-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FaHistory className="text-blue-500" />
                    ประวัติการเติมเงิน
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                  >
                    {showHistory ? 'ซ่อน' : 'แสดง'}
                  </Button>
                </div>
              </CardHeader>
              {showHistory && (
                <CardContent>
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      ยังไม่มีประวัติการเติมเงิน
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FaCoins className="text-yellow-500" />
                            <div>
                              <div className="font-semibold">โค้ด: {item.code}</div>
                              <div className="text-sm text-gray-500">
                                {formatDate(item.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              +{item.amount.toLocaleString()} บาท
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Instructions */}
          <div className="mt-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>วิธีการเติมเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>รับโค้ดเติมเงินจากผู้ดูแลระบบ</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>กรอกโค้ดในช่องด้านบน</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>กดปุ่ม "ใช้โค้ด" เพื่อเติมเงิน</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <div>คะแนนจะถูกเพิ่มในบัญชีของคุณทันที</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      </Protected>
    </>
  );
} 