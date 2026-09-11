import Image from "next/image";

type ProductDetailImageProps = {
  src: string;
  alt: string;
};

export function ProductDetailImage({ src, alt }: ProductDetailImageProps) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-elevated)] md:aspect-[16/9]">
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" priority />
    </div>
  );
}
