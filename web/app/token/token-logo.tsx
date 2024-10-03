import Image from "next/image"

export const TokenLogo = ({
  src,
  alt,
  className = "",
}: {
  src: string
  alt: string
  className?: string
}) => <Image src={src} alt={alt} className={`rounded-full ${className}`} width={22} height={22} />
