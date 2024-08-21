"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Category } from "@/lib/data/categories"
import Image from "next/image"

type Props = {
  categories: Category[]
}

export function CategoriesList(props: Props) {
  return (
    // <Card>
    //   <CardHeader>
    //     <CardTitle>Vote for Grants</CardTitle>
    //     <CardDescription>
    //       View and manage the grants awarded by the Nouns DAO community.
    //     </CardDescription>
    //   </CardHeader>
    //   <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2}>Name</TableHead>
          <TableHead className="text-center"># Grants</TableHead>
          <TableHead className="text-center">Budget</TableHead>
          <TableHead className="text-center">Total Votes</TableHead>
          <TableHead className="text-center">Your Vote</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.categories.map((category) => (
          <TableRow key={category.title}>
            <TableCell width={80}>
              <Image
                src={category.imageUrl}
                alt={category.title}
                width={64}
                height={64}
                className="aspect-square rounded-md object-cover"
              />
            </TableCell>
            <TableCell>
              <div className="text-lg font-medium duration-100 ease-out hover:text-primary">
                {category.title}
              </div>
              <p className="text-muted-foreground">{category.tagline}</p>
            </TableCell>
            <TableCell className="text-center">2</TableCell>
            <TableCell className="text-center">
              ${category.budget.toLocaleString("en-EN")}
            </TableCell>
            <TableCell className="text-center">{category.votes}</TableCell>
            <TableCell className="text-center">{category.votes / 2}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    //   </CardContent>
    // </Card>
  )
}
