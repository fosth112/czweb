import Nav from "./components/Nav";
import ImageSlider from "./components/ImageSlider";
import { CardReview } from "./components/CardReview";
import ProductR from "./components/ProductR";
import Footer from "./components/Footer";

import Link from "next/link";
import { FaDiscord } from "react-icons/fa";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="min-h-screen pb-5">
        <ImageSlider />
        <section className="flex justify-center px-3 pt-6">
          <div className="w-full max-w-screen-lg grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "สมาชิกทั้งหมด", value: "1,203", tone: "text-cyan-300" },
              { label: "ยอดเข้าชมเว็บไซต์", value: "14,644", tone: "text-emerald-300" },
              { label: "พร้อมจำหน่าย", value: "32", tone: "text-violet-300" },
              { label: "ยอดขายสินค้า", value: "79", tone: "text-amber-300" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className={`text-xl font-semibold ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="flex justify-center px-3 pt-6">
          <div className="w-full max-w-screen-lg grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "เติมเงิน", tone: "from-cyan-500/70 to-cyan-400/20" },
              { label: "บิลเกม", tone: "from-violet-500/70 to-violet-400/20" },
              { label: "สินค้าทั้งหมด", tone: "from-emerald-500/70 to-emerald-400/20" },
              { label: "ติดต่อเรา", tone: "from-pink-500/70 to-pink-400/20" },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${item.tone} px-4 py-4 text-center text-sm font-semibold text-white`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </section>
        <section className="flex justify-center px-3 pt-5">
          <div className="w-full max-w-screen-lg">
            <CardReview />
          </div>
        </section>
        <ProductR />
        <section className="flex relative justify-center px-3 py-16 overflow-hidden mt-8">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.05}
            duration={4}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-30%] h-[200%] skew-y-6",
            )}
          />
          <div className="w-full max-w-screen-lg">

            <h2 className="font-semibold text-center text-3xl text-white">ซื้อหรือสั่งทำเว็บไซต์</h2>
            <p className="text-base text-center text-slate-300">ติดต่อผ่าน Discord ได้เลย!</p>
            <div className="mt-5 flex justify-center">
              <Link
                href={'https://discord.gg/kUpfn9Ujpm'}
                className="ou text-sm bg-cyan-500 px-5 py-2 text-slate-950 rounded-full flex items-center gap-2"
              >
                <FaDiscord /> Discord
              </Link>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
