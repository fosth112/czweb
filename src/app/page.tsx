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
        <section className="flex justify-center px-3 pt-5">
          <div className="w-full max-w-screen-lg">
            <CardReview />
          </div>
        </section>
        <ProductR />
        <section className="flex relative justify-center px-3 py-[100px] overflow-hidden mt-5">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.1}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
            )}
          />
          <div className="w-full max-w-screen-lg">

            <h2 className="font-bold text-center text-5xl">ซื้อหรือสั่งทำเว็บไซต์</h2>
            <p className="text-2xl text-center font-semibold">ติดต่อผ่าน Discord ได้เลย!</p>
            <div className="mt-5 flex justify-center">
              <Link href={'https://discord.gg/kUpfn9Ujpm'} className="ou text-sm bg-indigo-500 px-5 py-2 text-white rounded-full flex items-center gap-2"><FaDiscord /> Discord</Link>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}