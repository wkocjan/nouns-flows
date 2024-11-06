import { Button, ButtonProps } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"

export const LoginButton = ({
  variant = "outline",
  size = "default",
}: {
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}) => {
  const { login } = usePrivy()

  return (
    <Button variant={variant} size={size} onClick={login}>
      Log in
    </Button>
  )
}
