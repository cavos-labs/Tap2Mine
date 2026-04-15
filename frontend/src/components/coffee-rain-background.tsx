"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

const COFFEE_RAIN_BEANS = [
  { left: "4%", delay: "0s", duration: "22s", drift: "-24px", scale: 0.78, opacity: 0.18 },
  { left: "10%", delay: "-7s", duration: "24s", drift: "18px", scale: 1.12, opacity: 0.14 },
  { left: "18%", delay: "-3s", duration: "27s", drift: "-20px", scale: 0.92, opacity: 0.16 },
  { left: "25%", delay: "-11s", duration: "29s", drift: "22px", scale: 0.88, opacity: 0.12 },
  { left: "32%", delay: "-5s", duration: "26s", drift: "-16px", scale: 1.04, opacity: 0.17 },
  { left: "40%", delay: "-15s", duration: "31s", drift: "24px", scale: 0.72, opacity: 0.13 },
  { left: "49%", delay: "-9s", duration: "23s", drift: "-22px", scale: 1.16, opacity: 0.16 },
  { left: "56%", delay: "-18s", duration: "30s", drift: "18px", scale: 0.85, opacity: 0.13 },
  { left: "63%", delay: "-6s", duration: "25s", drift: "-26px", scale: 1.08, opacity: 0.15 },
  { left: "70%", delay: "-13s", duration: "28s", drift: "20px", scale: 0.8, opacity: 0.12 },
  { left: "78%", delay: "-4s", duration: "24s", drift: "-18px", scale: 0.94, opacity: 0.17 },
  { left: "86%", delay: "-16s", duration: "32s", drift: "26px", scale: 1.1, opacity: 0.11 },
  { left: "93%", delay: "-10s", duration: "26s", drift: "-14px", scale: 0.76, opacity: 0.14 },
];

export function CoffeeRainBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="home-ambient-orb home-ambient-orb--top" />
      <div className="home-ambient-orb home-ambient-orb--side" />
      <div className="home-grid-mask" />
      <div className="coffee-rain-layer">
        {COFFEE_RAIN_BEANS.map((bean, index) => (
          <span
            key={`${bean.left}-${index}`}
            className="coffee-rain-bean"
            style={
              {
                left: bean.left,
                animationDelay: bean.delay,
                animationDuration: bean.duration,
                opacity: bean.opacity,
                "--bean-drift": bean.drift,
                "--bean-scale": bean.scale,
              } as CSSProperties
            }
          >
            <Image
              src="/partners/cafe.png"
              alt=""
              width={277}
              height={356}
              className="coffee-rain-image"
              sizes="36px"
              priority={index < 2}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
