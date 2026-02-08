'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaStore, FaCoins, FaHeadset } from "react-icons/fa";
import { RiHandCoinFill } from "react-icons/ri";
import { TbReorder } from "react-icons/tb";

function Nav() {
    const { isAuthenticated, logout, user } = useAuth();
    return (
        <nav className="flex justify-center px-3 py-2 bg-white/50 backdrop-blur-2xl sticky top-0 border-b z-50">
            <div className="w-full max-w-screen-lg flex justify-between items-center">

                <div>
                    <Link href={'/'} className="font-bold ou">
                        PROLEAK
                    </Link>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 text-xs font-light border border-y-amber-300 rounded-full">
                                <FaCoins className="text-yellow-600 text-sm" />
                                <span className="font-semibold text-yellow-800">
                                    {(user?.points || 0).toLocaleString()} บาท
                                </span>
                            </div>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <img src="https://server.cdn.proleakinnovation.com/storage/4522714ebb27e1407d6f10d3b4241b20.jpg" className="w-[30px] h-[30px]" alt="" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel className="text-center uppercase">
                                        {user?.username}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Link href="/history/order" className="flex items-center gap-2 w-full">
                                            <TbReorder /> ประวัติการสั่งซื้อ
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="/history/topup" className="flex items-center gap-2 w-full">
                                            <RiHandCoinFill /> ประวัติการเติมเงิน
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Link href="/store" className="flex items-center gap-2 w-full">
                                            <FaStore /> ร้านค้า
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="/topup" className="flex items-center gap-2 w-full">
                                            <FaCoins /> เติมเงิน
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Link href="https://discord.gg/kUpfn9Ujpm" className="flex items-center gap-2 w-full">
                                            <FaHeadset /> ติดต่อ
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <button
                                            className="w-full cursor-pointer"
                                            onClick={logout}
                                        >
                                            ออกจากระบบ
                                        </button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="secondary">
                                <Link href={'/signup'}>
                                    สมัครสมาชิก
                                </Link>
                            </Button>
                            <Button variant="default">
                                <Link href={'/signin'}>
                                    เข้าสู่ระบบ
                                </Link>
                            </Button>
                        </>
                    )}
                </div>

            </div>
        </nav>
    )
}

export default Nav