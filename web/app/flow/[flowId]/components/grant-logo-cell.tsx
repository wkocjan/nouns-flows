import { TableCell } from "@/components/ui/table"
import Image from "next/image"

export const GrantLogoCell = ({ image, title }: { image: string; title: string }) => {
  return (
    <TableCell className="w-[50px]">
      <div className="h-[50px] w-[50px]">
        <Image
          src={image}
          alt={title}
          width={50}
          height={50}
          className="size-[50px] rounded-md object-cover"
        />
      </div>
    </TableCell>
  )
}
