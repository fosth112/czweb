import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

function ImageSlider() {
  return (
    <div className="flex justify-center px-3 pt-5">
        <div className="w-full max-w-screen-lg">
            <Carousel>
                <CarouselContent>
                    <CarouselItem>
                        <div className="w-full h-[260px] border border-white/10 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950"></div>
                    </CarouselItem>
                    <CarouselItem>
                        <div className="w-full h-[260px] border border-white/10 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950"></div>
                    </CarouselItem>
                    <CarouselItem>
                        <div className="w-full h-[260px] border border-white/10 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950"></div>
                    </CarouselItem>
                </CarouselContent>
                <div className="hidden xl:flex">
                    <CarouselPrevious />
                    <CarouselNext />
                </div>
            </Carousel>
        </div>
    </div>
  )
}

export default ImageSlider
