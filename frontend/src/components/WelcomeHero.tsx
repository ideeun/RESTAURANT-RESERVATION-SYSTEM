"use client";

import Image from "next/image";
import Link from "next/link";

export default function WelcomeHero() {
  return (
    <div className="space-y-0">
      <div className="relative -mx-4 h-56 overflow-hidden sm:h-64">
        <Image src="/images/hero-food.jpg" alt="" fill className="object-cover" priority sizes="(max-width: 512px) 100vw, 512px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-transparent to-transparent" />
      </div>

      <div className="card -mt-6 relative">
        <p className="text-xs font-medium uppercase tracking-widest text-[#8a847a]">French Touch</p>
        <h1 className="mt-2 text-2xl font-semibold leading-snug">
          Забронируйте стол
          <br />
          в пару кликов
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#8a847a]">
          Выберите филиал, зал и свободный столик на интерактивной схеме.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/book" className="btn-primary">Забронировать стол</Link>
          <Link href="/restaurant" className="btn-secondary w-full text-center">О ресторане</Link>
        </div>
      </div>
    </div>
  );
}
