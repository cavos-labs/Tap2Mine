import Image from "next/image";
import Link from "next/link";

export function CavosSiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#EAE5DC] bg-[#F7F5F2]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 px-4 py-10 sm:flex-row sm:gap-6 sm:px-6 sm:py-12">
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/35">
          Powered by
        </span>
        <Link
          href="https://cavos.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 transition-opacity hover:opacity-100"
        >
          <Image
            src="/cavos-black.png"
            alt="Cavos"
            width={112}
            height={44}
            className="h-8 w-auto sm:h-9"
            priority={false}
          />
        </Link>
      </div>
    </footer>
  );
}
