"use client"

import { Button } from "@/components/ui/button"

import { FlowWithGrants } from "@/lib/database/queries/flow"
import { useIsFlowOwner } from "../hooks/useIsFlowOwner"
import { getEthAddress } from "@/lib/utils"
import { useUpgradeTo } from "../hooks/useUpgradeTo"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useUpdateVerifier } from "../hooks/useUpdateVerifier"
import { base } from "@/addresses"
import { useImplementation } from "../hooks/useImplementation"
import { useSetFlowImpl } from "../hooks/useSetFlowImpl"
import { useVerifier } from "../hooks/useVerifier"

interface Props {
  flow: FlowWithGrants
}

interface AddressFormProps {
  title: string
  functionName: string
  placeholder: string
  prefill?: string
  buttonText: string
  onSubmit: (address: `0x${string}`) => Promise<void>
}

export const ManageFlow = ({ flow }: Props) => {
  const contract = getEthAddress(flow.recipient)
  const isFlowOwner = useIsFlowOwner(contract)
  const implementation = useImplementation(contract)
  const verifier = useVerifier(contract)
  const { upgrade } = useUpgradeTo(contract)
  const { setFlowImpl } = useSetFlowImpl(contract)
  const { update } = useUpdateVerifier(contract)

  if (!isFlowOwner) return null

  return (
    <div className="border-t pt-2">
      <p className="mb-2 text-sm font-medium">Manage Flow</p>

      <div className="space-y-4">
        {/* Contract Upgrades */}
        <AddressForm
          title="Upgrading"
          prefill={base.NounsFlowImpl}
          functionName="upgradeTo"
          placeholder="New implementation address (0x...)"
          buttonText="Upgrade To"
          onSubmit={upgrade}
        />
        {implementation !== base.NounsFlowImpl && (
          <AddressForm
            title="Deployed implementation"
            prefill={base.NounsFlowImpl}
            functionName="setFlowImpl"
            placeholder="New implementation address (0x...)"
            buttonText="Set Flow Impl"
            onSubmit={setFlowImpl}
          />
        )}

        {/* Update Verifier */}
        {verifier !== base.TokenVerifier && (
          <AddressForm
            title="Updating"
            functionName="updateVerifier"
            placeholder="New verifier address (0x...)"
            buttonText="Update Flow Verifier"
            onSubmit={update}
            prefill={base.TokenVerifier}
          />
        )}

        {/* Future sections for other contract interactions can be added here */}
      </div>
    </div>
  )
}

const AddressForm = ({
  title,
  functionName,
  placeholder,
  buttonText,
  onSubmit,
  prefill,
}: AddressFormProps) => {
  const [address, setAddress] = useState<string>(prefill || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        <code>{functionName}</code>
      </p>
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault()
          setIsSubmitting(true)
          try {
            await onSubmit(address as `0x${string}`)
          } catch (error) {
            console.error(error)
          }
          setIsSubmitting(false)
        }}
      >
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={placeholder}
          className="text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          type="submit"
          disabled={!address || isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? `${title}...` : buttonText}
        </Button>
      </form>
    </div>
  )
}
