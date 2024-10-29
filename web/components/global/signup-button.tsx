import { Button, ButtonProps } from "@/components/ui/button"
import { useCallback } from "react"
import { useConnect } from "wagmi"

export const SignupButton = ({
  variant = "ghost",
  size = "default",
}: {
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}) => {
  const { connectors, connect } = useConnect()

  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK",
    )
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector })
    }
  }, [connectors, connect])

  return (
    <Button variant={variant} size={size} onClick={createWallet}>
      Sign up
    </Button>
  )
}
