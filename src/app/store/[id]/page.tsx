'use client';

import Nav from '@/app/components/Nav';
import Footer from '@/app/components/Footer';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from '@/utils/axiosInstance';
import { useAuth } from '@/contexts/AuthContext';
import { FaBox } from 'react-icons/fa';
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

interface Product {
    id: string;
    name: string;
    image_url: string;
    price: number;
    status: number;
    timestamp: string;
    stock: number;
}

export default function ProductDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { user, isAuthenticated, refreshUserData } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [buying, setBuying] = useState(false);
    const [boughtStock, setBoughtStock] = useState<any[]>([]);

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/product/${id}`);
            if (response.data.success) {
                setProduct(response.data.product);
            } else {
                setError(response.data.message || 'ไม่พบสินค้า');
            }
        } catch {
            setError('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyProduct = async () => {
        if (!isAuthenticated) {
            toast.error('กรุณาเข้าสู่ระบบก่อน');
            return;
        }
        if (!user || !product) return;
        if (user.points === undefined || user.points < product.price) {
            toast.error('คะแนนของคุณไม่เพียงพอ');
            return;
        }
        if (product.status === 1 || product.stock <= 0) {
            toast.error('สินค้านี้ไม่พร้อมจำหน่ายหรือหมดสต็อก');
            return;
        }
        setBuying(true);
        try {
            const response = await axios.post('/order', { productId: product.id, quantity: 1 });
            if (response.data.success) {
                toast.success('ซื้อสินค้าสำเร็จ!');
                setBoughtStock(response.data.stockData || []);
                await refreshUserData();
                fetchProduct();
            } else {
                toast.error(response.data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
        } finally {
            setBuying(false);
        }
    };

    const getStatusBadge = (status: number) => (
        <Badge variant={status === 0 ? 'outline' : 'destructive'}>
            {status === 0 ? 'พร้อมจำหน่าย' : 'ไม่พร้อมจำหน่าย'}
        </Badge>
    );

    const getStockBadge = (stock: number) => {
        let color = 'default';
        if (stock === 0) color = 'destructive';
        else if (stock <= 3) color = 'secondary';

        return <Badge variant={'outline'}>{getStockText(stock)}</Badge>;
    };

    const getStockText = (stock: number) => {
        if (stock === 0) return 'หมด';
        if (stock <= 3) return `เหลือ ${stock} รายการ`;
        return `${stock} รายการ`;
    };

    return (
        <>
            <Nav />
            <main className="min-h-screen flex items-center justify-center py-8 px-4 relative">
                <FlickeringGrid
                    className="absolute inset-0 z-0 size-full"
                    squareSize={4}
                    gridGap={6}
                    color="#6B7280"
                    maxOpacity={0.5}
                    flickerChance={0.1}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-white to-transparent'></div>
                <div className='absolute inset-0 bg-gradient-to-t from-white to-transparent'></div>
                {loading ? (
                    <div className="w-full max-w-md mx-auto relative">
                        <Skeleton className="h-[400px] w-full rounded-xl" />
                    </div>
                ) : error || !product ? (
                    <div className="text-center text-zinc-500 relative">
                        <FaBox className="text-6xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">{error || 'ไม่พบสินค้า'}</h3>
                    </div>
                ) : (
                    <Card className="relative w-full max-w-md mx-auto">
                        <CardHeader className="flex flex-col items-center">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-48 h-48 object-cover rounded-md mb-4"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                }}
                            />
                            <CardTitle className="text-center">{product.name}</CardTitle>
                        </CardHeader>
                        <div className="flex justify-between items-center px-6 mb-3 mt-2">
                            <div className="text-xl font-bold ou">฿ {product.price.toLocaleString()}</div>
                            <div className='flex gap-2'>
                                {getStatusBadge(product.status)}{getStockBadge(product.stock)}
                            </div>
                        </div>
                        <CardContent className="text-center space-y-4">
                            <Button
                                className="w-full"
                                size="lg"
                                disabled={product.status === 1 || product.stock <= 0 || buying}
                                onClick={handleBuyProduct}
                            >
                                {buying ? 'กำลังซื้อ...' : product.status === 1 || product.stock <= 0 ? 'ไม่พร้อมจำหน่าย' : 'ซื้อสินค้า'}
                            </Button>

                            {boughtStock.length > 0 && (
                                <div className="bg-zinc-50 rounded p-4 mt-4 text-left text-sm">
                                    <div className="font-semibold text-center mb-2">ข้อมูลสต็อกที่ได้รับ</div>
                                    <div className="divide-y">
                                        {boughtStock.map((s, i) => (
                                            <div key={s.id || i} className="py-2">
                                                <div><span className="font-medium">Stock:</span> {s.stock}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
            <Footer />
        </>
    );
}
