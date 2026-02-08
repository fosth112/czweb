"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FaBox } from "react-icons/fa";
import axios from '@/utils/axiosInstance';

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  status: number;
  timestamp: string;
  stock: number;
}

function getRandomItems<T>(arr: T[], n: number): T[] {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function ProductR() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product');
      if (response.data.success) {
        const products: Product[] = response.data.products;
        const randomProducts = getRandomItems(products, 10);
        setProducts(randomProducts);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
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

  return (
    <section className="flex justify-center px-3 pt-5">
      <div className="w-full max-w-screen-lg">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">สินค้าแนะนำ</h2>
          <div>
            <Button variant={'outline'}>
                <Link href={'/store'}>
                    เพิ่มเติม
                </Link>
            </Button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-2 rounded-md border shadow animate-pulse h-64 bg-gray-100" />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
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
                    <p className={`${getStockColor(product.stock)}`}>{getStockText(product.stock)}</p>
                    <p>฿ {product.price.toLocaleString()}</p>
                  </div>
                  <div className="mt-2">
                    <Button variant={'outline'} className="w-full">
                      <Link href={`/store/${product.id}`}>
                        รายละเอียด
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5">
              <div className="text-center py-12">
                <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  ยังไม่มีสินค้าในระบบ
                </h3>
                <p className="text-gray-500">
                  เพิ่มสินค้าแรกของคุณเพื่อเริ่มต้น
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProductR