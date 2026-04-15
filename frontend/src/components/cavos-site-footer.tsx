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
  imageClassName?: string;
};

const FOOTER_PARTNERS: Partner[] = [
  {
    href: "https://www.ticoblockchain.cr/",
    src: "/partners/ticoblockchain.png",
    altKey: "footer.altTico",
    width: 560,
    height: 435,
    imageClassName: "max-h-8 sm:max-h-9",
  },
  {
    href: "https://cavos.xyz",
    src: "/cavos-black.png",
    altKey: "footer.altCavos",
    width: 51,
    height: 63,
    imageClassName: "max-h-9 sm:max-h-10",
  },
  {
    href: "https://app.cofiblocks.com/",
    src: "/partners/cofiblocks-v2.png",
    altKey: "footer.altCofiblocks",
    width: 5001,
    height: 5000,
    imageClassName: "max-h-10 sm:max-h-11",
  },
  {
    href: "https://www.starknet.io/",
    src: "/partners/starknet.png",
    altKey: "footer.altStarknet",
    width: 493,
    height: 272,
    imageClassName: "max-h-8 sm:max-h-9",
  },
];

export function CavosSiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto px-4 pb-6 sm:px-6 sm:pb-8">
      <div className="mx-auto max-w-6xl rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(255,252,247,0.72),rgba(246,239,229,0.84))] px-4 py-5 shadow-[0_18px_60px_rgba(69,39,15,0.05)] backdrop-blur-sm sm:px-6 sm:py-6">
        <div className="flex flex-col items-center gap-4 sm:gap-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8a7a6c]">
            {t("footer.collaboration")}
          </p>

          <ul className="m-0 flex w-full list-none flex-wrap items-center justify-center gap-x-2 gap-y-3 p-0 sm:gap-x-3">
            {FOOTER_PARTNERS.map((partner) => (
              <li key={partner.href} className="w-[8.25rem] sm:w-[9.5rem]">
                <Link
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-14 w-full items-center justify-center px-3 transition-transform duration-300 hover:-translate-y-0.5 sm:h-16"
                >
                  <Image
                    src={partner.src}
                    alt={t(partner.altKey)}
                    width={partner.width}
                    height={partner.height}
                    className={`h-auto w-auto max-w-[6rem] object-contain opacity-82 saturate-[0.94] transition-all duration-300 group-hover:opacity-100 group-hover:saturate-100 sm:max-w-[7rem] ${partner.imageClassName ?? ""}`}
                    style={{ width: "auto", height: "auto" }}
                    sizes="(max-width: 640px) 96px, 112px"
                    priority={false}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
