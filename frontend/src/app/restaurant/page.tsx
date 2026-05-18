"use client";

import Image from "next/image";
import Link from "next/link";

export default function RestaurantPage() {
  return (
    <div className="space-y-5 pb-4">
      <div className="relative h-48 overflow-hidden rounded-2xl">
        <Image src="/images/hero-luxury.jpg" alt="" fill className="object-cover" sizes="100vw" />
      </div>
      <div className="card">
        <h1 className="text-2xl font-semibold">French Touch</h1>
        <p className="mt-2 text-sm text-[#8a847a]">Изысканная кухня · уютная атмосфера</p>
        <p className="mt-1 text-sm text-[#8a847a]">Ежедневно 12:00 – 22:00</p>
        <Link href="/book" className="btn-primary mt-6 block text-center">Забронировать стол</Link>
      </div>
    </div>
  );
}
