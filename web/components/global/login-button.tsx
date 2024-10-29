import { Button, ButtonProps } from "@/components/ui/button"
import { useModal } from "connectkit"

export const LoginButton = ({
  variant = "outline",
  size = "default",
}: {
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}) => {
  const { setOpen } = useModal()

  return (
    <Button variant={variant} size={size} onClick={() => setOpen(true)}>
      Log in
    </Button>
  )
}
