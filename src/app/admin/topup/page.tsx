'use client';

import Nav from '@/app/components/Nav';
import Footer from '@/app/components/Footer';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from '@/utils/axiosInstance';
import { FaCoins, FaCopy, FaDownload } from 'react-icons/fa';
import AdminProtected from '@/auth/AdminProtected';

interface TopupCode {
  id: string;
  code: string;
  amount: number;
  status: number;
  timestamp: string;
  usedBy?: string;
  usedAt?: string;
}

function AdminTopupPageContent() {
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<TopupCode[]>([]);
  const [generatedCodes, setGeneratedCodes] = useState<{ code: string; amount: number }[]>([]);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await axios.get('/topup/codes');
      if (response.data.success) {
        setCodes(response.data.codes);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    }
  };

  const handleGenerateCodes = async () => {
    if (!amount || !quantity) {
      toast.error('กรุณากรอกจำนวนเงินและจำนวนโค้ด');
      return;
    }

    const amountNum = parseInt(amount);
    const quantityNum = parseInt(quantity);

    if (amountNum <= 0) {
      toast.error('จำนวนเงินต้องมากกว่า 0');
      return;
    }

    if (quantityNum <= 0 || quantityNum > 100) {
      toast.error('จำนวนโค้ดต้องอยู่ระหว่าง 1-100');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/topup/generate', {
        amount: amountNum,
        quantity: quantityNum
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setGeneratedCodes(response.data.codes);
        setAmount('');
        setQuantity('1');
        fetchCodes();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในระบบ');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('คัดลอกโค้ดแล้ว');
  };

  const downloadCodes = () => {
    if (generatedCodes.length === 0) {
      toast.error('ไม่มีโค้ดที่สร้างใหม่');
      return;
    }

    const csvContent = [
      'Code,Amount',
      ...generatedCodes.map(code => `${code.code},${code.amount}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topup_codes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  const getStatusText = (status: number) => {
    return status === 0 ? 'ยังไม่ได้ใช้' : 'ใช้แล้ว';
  };

  const getStatusColor = (status: number) => {
    return status === 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">จัดการโค้ดเติมเงิน</h1>
          <p className="text-gray-600">สร้างและจัดการโค้ดเติมเงินสำหรับระบบ</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Generate Codes Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaCoins className="text-yellow-500" />
                สร้างโค้ดเติมเงิน
              </CardTitle>
              <CardDescription>
                สร้างโค้ดเติมเงินใหม่สำหรับผู้ใช้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนเงิน (บาท)
                </label>
                <Input
                  type="number"
                  placeholder="เช่น: 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนโค้ด
                </label>
                <Input
                  type="number"
                  placeholder="เช่น: 10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
              <Button 
                onClick={handleGenerateCodes} 
                disabled={loading || !amount || !quantity}
                className="w-full"
              >
                {loading ? 'กำลังสร้างโค้ด...' : 'สร้างโค้ด'}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Codes Card */}
          {generatedCodes.length > 0 && (
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>โค้ดที่สร้างใหม่</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadCodes}
                    className="flex items-center gap-2"
                  >
                    <FaDownload />
                    ดาวน์โหลด CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {generatedCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="font-mono text-sm">{code.code}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{code.amount} บาท</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <FaCopy className="text-xs" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* All Codes Table */}
        <div className="mt-8">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>โค้ดทั้งหมด</CardTitle>
              <CardDescription>
                รายการโค้ดเติมเงินทั้งหมดในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">โค้ด</th>
                      <th className="text-left p-2">จำนวนเงิน</th>
                      <th className="text-left p-2">สถานะ</th>
                      <th className="text-left p-2">วันที่สร้าง</th>
                      <th className="text-left p-2">วันที่ใช้</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr key={code.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono">{code.code}</td>
                        <td className="p-2">{code.amount.toLocaleString()} บาท</td>
                        <td className={`p-2 font-medium ${getStatusColor(code.status)}`}>
                          {getStatusText(code.status)}
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {formatDate(code.timestamp)}
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {code.usedAt ? formatDate(code.usedAt) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {codes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    ยังไม่มีโค้ดเติมเงินในระบบ
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminTopupPage() {
  return (
    <AdminProtected>
      <Nav />
      <AdminTopupPageContent />
      <Footer />
    </AdminProtected>
  );
} 