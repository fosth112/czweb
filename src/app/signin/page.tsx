'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Nav from "../components/Nav"
import Footer from "../components/Footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ReverseProtected } from "@/auth/ReverseProtected"
import axiosInstance from "@/utils/axiosInstance"

function page() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', {
        username,
        password
      }, { withCredentials: true });

      const data = response.data;

      if (data.success) {
        toast.success(data.message);
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ReverseProtected>
      <div>
        <Nav />
        <main className="min-h-screen flex justify-center items-center">
          <div className="w-full max-w-xs">
            <div className="mb-5">
              <h1 className="text-lg font-semibold text-center">เข้าสู่ระบบ</h1>
              <p className="text-xs -mt-1 text-center">sign in</p>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input 
                placeholder="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input 
                placeholder="รหัสผ่าน"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button 
                variant={'outline'} 
                className="w-full" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>
            <div className="mt-5">
              <p className="text-sm">ยังไม่มีบัญชี <Link href={'/signup'} className="text-blue-500">สมัครสมาชิก</Link></p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ReverseProtected>
  )
}

export default page