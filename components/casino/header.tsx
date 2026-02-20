"use client"

import Image from "next/image"

export function CasinoHeader() {
  return (
    <header className="flex items-center justify-center gap-4 py-8 md:py-12">
      <div className="flex items-center gap-4">
        <div className="relative size-14 md:size-16 rounded-full overflow-hidden border-2 border-primary/40 shrink-0">
          <Image
            src="/images/chief-logo.png"
            alt="Chief Casino logo"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-balance">
            Taryahan ni Chief
          </h1>
          <p className="text-sm text-muted-foreground">
            Wala kang patawad ya
          </p>
        </div>
      </div>
    </header>
  )
}
