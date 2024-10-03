import Image from "next/image"

export const TokenLogo = ({
  src,
  alt,
  className = "",
  height = 21,
  width = 21,
}: {
  src: string
  alt: string
  className?: string
  height?: number
  width?: number
}) => (
  <Image
    src={src}
    alt={alt}
    className={`rounded-full h-[${height}px] w-[${width}px] object-cover ${className}`}
    width={width}
    height={height}
  />
)
