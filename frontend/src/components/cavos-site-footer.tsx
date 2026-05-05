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
    <footer className="mobile-safe-bottom mt-auto px-3 pb-4 sm:px-6 sm:pb-8">
      <div className="mx-auto max-w-6xl border-t border-[var(--cavos-border)] px-3 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col items-center gap-4 sm:gap-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--cavos-subtle)]">
            {t("footer.collaboration")}
          </p>

          <ul className="m-0 grid w-full list-none grid-cols-2 gap-x-1 gap-y-2.5 p-0 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-3">
            {FOOTER_PARTNERS.map((partner) => (
              <li key={partner.href} className="w-full sm:w-[9.5rem]">
                <Link
                  href={partner.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-12 w-full items-center justify-center px-2 transition-transform duration-300 hover:-translate-y-0.5 sm:h-16 sm:px-3"
                >
                  <Image
                    src={partner.src}
                    alt={t(partner.altKey)}
                    width={partner.width}
                    height={partner.height}
                    className={`h-auto w-auto max-w-[5.5rem] object-contain opacity-82 saturate-[0.94] transition-all duration-300 group-hover:opacity-100 group-hover:saturate-100 sm:max-w-[7rem] ${partner.imageClassName ?? ""}`}
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
