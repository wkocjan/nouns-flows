import { TableCell } from "@/components/ui/table"
import Image from "next/image"

export const GrantLogoCell = ({ image, title }: { image: string; title: string }) => {
  return (
    <TableCell className="w-[64px]">
      <div className="h-16 w-16">
        <Image
          src={image}
          alt={title}
          width={64}
          height={64}
          className="size-16 rounded-md object-cover"
        />
      </div>
    </TableCell>
  )
}
