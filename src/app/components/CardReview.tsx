import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "ไม่คิดว่าจะเจอเว็บขายแอปพรีเมี่ยมที่ใช้ง่ายและราคาดีแบบนี้ บริการดีมากครับ แนะนำเลย!",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "โหลดเร็ว ใช้งานง่าย มีแอปให้เลือกเยอะมาก แถมราคาถูกกว่าที่อื่น ประทับใจสุดๆ",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "ระบบปลอดภัย จ่ายเงินแล้วได้โค้ดทันทีเลยครับ บริการหลังการขายก็ดีมากๆ",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "ซื้อแอปไปใช้แล้วไม่มีปัญหาเลย ใช้ได้จริง 100% คุ้มค่ามากค่ะ",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "แอดมินตอบเร็วมากค่ะ เว็บดูน่าเชื่อถือ แอปใช้งานได้จริง รู้สึกอุ่นใจในการซื้อ",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "บริการไว แอปคุณภาพดีมาก เหมือนได้ใช้ของแท้เลยครับ แนะนำให้เพื่อนทุกคนเลย",
    img: "https://avatar.vercel.sh/james",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-lg border p-4",
        // light styles
        "border-neutral-200 bg-white hover:bg-neutral-50",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt={`${name} avatar`} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-neutral-900 dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-neutral-500 dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-xs text-neutral-600">{body}</blockquote>
    </figure>
  );
};

export function CardReview() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
