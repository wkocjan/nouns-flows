import { TableCell } from "@/components/ui/table"
import Link from "next/link"

export const GrantTitleCell = ({ title, href }: { title: string; href: string }) => {
  return (
    <TableCell className="max-w-[250px] overflow-hidden truncate text-ellipsis">
      <Link
        href={href}
        className="text-sm font-medium duration-100 ease-out hover:text-primary md:text-lg"
      >
        {title}
      </Link>
    </TableCell>
  )
}
