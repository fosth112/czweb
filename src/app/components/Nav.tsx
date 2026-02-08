'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

            <div className="w-full max-w-screen-lg flex justify-between items-center">

                <div className="flex items-center gap-6">
                    <Link href={'/'} className="font-bold ou text-white flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 border border-white/10 text-cyan-400">X</span>
                        PROLEAK
                    </Link>
                    <div className="hidden md:flex items-center gap-4 text-sm text-slate-300">
                        <Link href="/" className="hover:text-white">หน้าแรก</Link>
                        <Link href="/store" className="hover:text-white">ร้านค้า</Link>
                        <Link href="/topup" className="hover:text-white">เติมเงิน</Link>
                        <Link href="/history/order" className="hover:text-white">บิลเกม</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                    <div className="hidden md:block">
                        <Input
                            placeholder="ค้นหาสินค้า..."
                            className="h-9 w-56 rounded-full border-white/10 bg-white/5 text-white placeholder:text-slate-400"
                        />
                    </div>
                    {isAuthenticated ? (
                        <>

                                    {(user?.points || 0).toLocaleString()} บาท
                                </span>
                            </div>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <img
                                        src="https://server.cdn.proleakinnovation.com/storage/4522714ebb27e1407d6f10d3b4241b20.jpg"

                                        alt="User avatar"
                                    />
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

                                <Link href={'/signup'}>
                                    สมัครสมาชิก
                                </Link>
                            </Button>

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
