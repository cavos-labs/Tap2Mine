"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/context/locale-context";

export function CavosSiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-[#EAE5DC] bg-[#F7F5F2]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/40 text-center">
          {t("footer.collaboration")}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <Link
            href="https://www.ticoblockchain.cr/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 transition-opacity hover:opacity-100 mix-blend-multiply"
          >
            <div className="h-10 sm:h-12 flex items-center justify-center">
              <Image
                src="/partners/ticoblockchain.png"
                alt="Tico Blockchain"
                width={140}
                height={44}
                className="w-auto h-full object-contain grayscale transition duration-300 hover:grayscale-0"
                style={{ width: "auto", height: "100%" }}
                priority={false}
              />
            </div>
          </Link>
          <Link
            href="https://cavos.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 transition-opacity hover:opacity-100 mix-blend-multiply"
          >
            <div className="h-9 sm:h-11 flex items-center justify-center">
              <Image
                src="/cavos-black.png"
                alt="Cavos"
                width={112}
                height={44}
                className="w-auto h-full object-contain"
                style={{ width: "auto", height: "100%" }}
                priority={false}
              />
            </div>
          </Link>
          <Link
            href="https://app.cofiblocks.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 transition-opacity hover:opacity-100 mix-blend-multiply"
          >
            <div className="h-10 sm:h-12 flex items-center justify-center">
              <Image
                src="/partners/cofiblocks-v2.png"
                alt="CofiBlocks"
                width={112}
                height={44}
                className="w-auto h-full object-contain"
                style={{ width: "auto", height: "100%" }}
                priority={false}
              />
            </div>
          </Link>
          <Link
            href="https://www.starknet.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 transition-opacity hover:opacity-100 mix-blend-multiply"
          >
            <div className="h-10 sm:h-12 flex items-center justify-center">
              <Image
                src="/partners/starknet.png"
                alt="Starknet"
                width={112}
                height={44}
                className="w-auto h-full object-contain"
                style={{ width: "auto", height: "100%" }}
                priority={false}
              />
            </div>
          </Link>
        </div>
      </div>
    </footer>
  );
}
