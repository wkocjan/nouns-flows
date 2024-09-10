import "server-only"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NOUNS_FLOW_PROXY } from "@/lib/config"
import { getCategory } from "@/lib/data/categories"
import { getGrantsForCategory } from "@/lib/data/grants"
import { PropsWithChildren } from "react"
import { base } from "viem/chains"
import { CategoryHeader } from "./components/category-header"
import { CategorySubmenu } from "./components/category-submenu"
import { VotingProvider } from "./components/voting-context"

interface Props {
  params: {
    categoryId: string
  }
}
export default async function CategoryLayout(props: PropsWithChildren<Props>) {
  const { children } = props
  const { categoryId } = props.params

  const category = await getCategory(categoryId)

  const grants = getGrantsForCategory(categoryId)

  return (
    <VotingProvider
      chainId={base.id}
      userVotes={[]}
      contract={NOUNS_FLOW_PROXY}
    >
      <div className="container mt-2.5 pb-24 md:mt-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Categories</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{category.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <CategoryHeader category={category} grants={grants} />

        <CategorySubmenu
          categoryId={categoryId}
          awaitingCount={grants.filter((g) => !g.isApproved).length}
        />

        {children}
      </div>
    </VotingProvider>
  )
}
