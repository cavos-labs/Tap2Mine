"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

const COFFEE_RAIN_BEANS = [
  { left: "3%", delay: "0s", duration: "19s", drift: "-24px", scale: 0.86, opacity: 0.36 },
  { left: "8%", delay: "-7s", duration: "22s", drift: "18px", scale: 1.16, opacity: 0.28 },
  { left: "13%", delay: "-12s", duration: "25s", drift: "-14px", scale: 0.74, opacity: 0.22 },
  { left: "18%", delay: "-3s", duration: "24s", drift: "-20px", scale: 1, opacity: 0.3 },
  { left: "24%", delay: "-11s", duration: "27s", drift: "22px", scale: 0.92, opacity: 0.22 },
  { left: "30%", delay: "-5s", duration: "23s", drift: "-16px", scale: 1.12, opacity: 0.32 },
  { left: "36%", delay: "-15s", duration: "29s", drift: "24px", scale: 0.8, opacity: 0.24 },
  { left: "42%", delay: "-9s", duration: "21s", drift: "-22px", scale: 1.2, opacity: 0.31 },
  { left: "49%", delay: "-17s", duration: "26s", drift: "12px", scale: 0.72, opacity: 0.2 },
  { left: "55%", delay: "-18s", duration: "28s", drift: "18px", scale: 0.92, opacity: 0.23 },
  { left: "61%", delay: "-6s", duration: "22s", drift: "-26px", scale: 1.12, opacity: 0.3 },
  { left: "67%", delay: "-13s", duration: "26s", drift: "20px", scale: 0.86, opacity: 0.22 },
  { left: "73%", delay: "-4s", duration: "23s", drift: "-18px", scale: 1, opacity: 0.32 },
  { left: "79%", delay: "-16s", duration: "30s", drift: "26px", scale: 1.14, opacity: 0.22 },
  { left: "85%", delay: "-10s", duration: "24s", drift: "-14px", scale: 0.84, opacity: 0.27 },
  { left: "91%", delay: "-20s", duration: "31s", drift: "16px", scale: 0.76, opacity: 0.2 },
  { left: "96%", delay: "-24s", duration: "27s", drift: "-12px", scale: 0.7, opacity: 0.18 },
];

const COFFEE_RAIN_PASSES = [
  { key: "near-a", className: "coffee-rain-layer", leftShift: -1, delayShift: 0, durationShift: 0, opacityDelta: 0.08, scaleOffset: 0.02, size: "36px" },
  { key: "near-b", className: "coffee-rain-layer", leftShift: 1.5, delayShift: -8, durationShift: -4, opacityDelta: 0.04, scaleOffset: -0.03, size: "34px" },
  { key: "far", className: "coffee-rain-layer coffee-rain-layer--far", leftShift: 2.5, delayShift: -5, durationShift: 3, opacityDelta: -0.02, scaleOffset: -0.12, size: "28px" },
] as const;

function shiftPercent(left: string, shift: number) {
  const value = Number.parseFloat(left);
  if (Number.isNaN(value)) return left;
  const next = Math.min(98, Math.max(2, value + shift));
  return `${next}%`;
}

function shiftTime(raw: string, deltaSeconds: number) {
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return raw;
  return `${value + deltaSeconds}s`;
}

export function CoffeeRainBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="home-ambient-orb home-ambient-orb--top" />
      <div className="home-ambient-orb home-ambient-orb--side" />
      <div className="home-grid-mask" />
      {COFFEE_RAIN_PASSES.map((pass, passIndex) => (
        <div key={pass.key} className={pass.className}>
          {COFFEE_RAIN_BEANS.map((bean, index) => {
            const isFar = pass.className.includes("--far");

            return (
              <span
                key={`${pass.key}-${bean.left}-${index}`}
                className={`coffee-rain-bean ${isFar ? "coffee-rain-bean--far" : ""}`}
                style={
                  {
                    left: shiftPercent(bean.left, pass.leftShift),
                    animationDelay: shiftTime(bean.delay, pass.delayShift),
                    animationDuration: shiftTime(bean.duration, pass.durationShift),
                    opacity: Math.min(0.52, Math.max(0.16, bean.opacity + pass.opacityDelta)),
                    "--bean-drift": bean.drift,
                    "--bean-scale": Math.max(0.56, bean.scale + pass.scaleOffset),
                  } as CSSProperties
                }
              >
                <Image
                  src="/partners/cafe.png"
                  alt=""
                  width={277}
                  height={356}
                  className="coffee-rain-image"
                  sizes={pass.size}
                  priority={passIndex === 0 && index < 4}
                />
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
