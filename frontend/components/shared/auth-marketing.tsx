"use client"

import { ShoppingBag, Store, MapPin, Quote } from "lucide-react"

interface Props {
  variant?: "login" | "signup"
}

export function AuthMarketing({ variant = "login" }: Props) {
  const headline =
    variant === "signup"
      ? "Start something local."
      : "Welcome back to your marketplace."

  const sub =
    variant === "signup"
      ? "Join thousands of Lebanese shoppers and sellers on Soukly."
      : "Pick up where you left off — your cart, orders, and saved stores are waiting."

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
          {headline}
        </h1>
        <p className="text-base xl:text-lg text-primary-foreground/85 mt-4 max-w-md">
          {sub}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-md">
        {[
          { icon: Store,        value: "500+",  label: "Stores" },
          { icon: ShoppingBag,  value: "10k+",  label: "Products" },
          { icon: MapPin,       value: "All",   label: "Lebanon" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-4"
            >
              <Icon className="w-4 h-4 mb-2 text-primary-foreground/90" />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-primary-foreground/70">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <figure className="max-w-md">
        <Quote className="w-5 h-5 text-primary-foreground/50 mb-3" />
        <blockquote className="text-sm xl:text-base leading-relaxed">
          "Setup took 5 minutes and I got my first order within a week. The marketplace
          traffic brought me customers I'd never have reached on my own."
        </blockquote>
        <figcaption className="text-xs text-primary-foreground/70 mt-3">
          — Lina, Lina's Boutique · Beirut
        </figcaption>
      </figure>
    </div>
  )
}
