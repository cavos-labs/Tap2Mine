"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/context/locale-context";

type Partner = {
  href: string;
  src: string;
  altKey: string;
  width: number;
  height: number;
  grayscaleHover?: boolean;
};

const FOOTER_PARTNERS: Partner[] = [
  {
    href: "https://www.ticoblockchain.cr/",
    src: "/partners/ticoblockchain.png",
    altKey: "footer.altTico",
    width: 200,
    height: 72,
    grayscaleHover: true,
  },
  {
    href: "https://cavos.xyz",
    src: "/cavos-black.png",
    altKey: "footer.altCavos",
    width: 112,
    height: 44,
  },
  {
    href: "https://app.cofiblocks.com/",
    src: "/partners/cofiblocks-v2.png",
    altKey: "footer.altCofiblocks",
    width: 120,
    height: 120,
  },
  {
    href: "https://www.starknet.io/",
    src: "/partners/starknet.png",
    altKey: "footer.altStarknet",
    width: 140,
    height: 48,
  },
];

/** Every logo is capped to the same max height so the strip reads as one bar. */
const IMAGE_CAP =
  "h-auto w-auto max-h-[2.25rem] max-w-full object-contain object-center sm:max-h-10";

export function CavosSiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-[#EAE5DC] bg-[#F7F5F2]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-9">
        <p className="relative z-10 mx-auto mb-6 block max-w-md text-center text-[10px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-black/40 sm:mb-7 sm:max-w-2xl">
          {t("footer.collaboration")}
        </p>

        <ul className="m-0 mx-auto grid w-full max-w-md list-none grid-cols-2 gap-3 p-0 sm:max-w-3xl sm:grid-cols-4 sm:gap-4">
          {FOOTER_PARTNERS.map((p) => (
            <li key={p.href} className="min-w-0">
              <Link
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-18 w-full min-w-0 flex-col items-center justify-center rounded-xl bg-white/75 px-2 py-3 shadow-[0_1px_3px_rgba(10,9,8,0.05)] transition-colors hover:bg-white sm:min-h-19 sm:px-3"
              >
                <span className="flex min-h-9 w-full min-w-0 items-center justify-center sm:min-h-10">
                  <Image
                    src={p.src}
                    alt={t(p.altKey)}
                    width={p.width}
                    height={p.height}
                    className={`${IMAGE_CAP} ${
                      p.grayscaleHover
                        ? "opacity-95 grayscale-[0.15] transition-[filter,opacity] duration-300 hover:opacity-100 hover:grayscale-0"
                        : "opacity-90 hover:opacity-100"
                    }`}
                    style={{ width: "auto", height: "auto" }}
                    sizes="(max-width:640px) 42vw, 140px"
                    priority={false}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
