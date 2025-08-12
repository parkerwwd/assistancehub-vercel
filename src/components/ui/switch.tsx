import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

type BaseProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
type SwitchProps = BaseProps & { size?: 'xs' | 'sm' | 'md' }

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size = 'md', ...props }, ref) => {
  const track =
    size === 'xs'
      ? 'h-3 w-6 min-w-[24px]'
      : size === 'sm'
      ? 'h-4 w-8 min-w-[32px]'
      : 'h-5 w-9 min-w-[36px]'
  const thumb =
    size === 'xs'
      ? 'h-2.5 w-2.5 data-[state=checked]:translate-x-3.5'
      : size === 'sm'
      ? 'h-3.5 w-3.5 data-[state=checked]:translate-x-4'
      : 'h-4 w-4 data-[state=checked]:translate-x-4'
  return (
    <SwitchPrimitives.Root
      className={cn(
        `peer relative inline-flex ${track} shrink-0 cursor-pointer items-center overflow-hidden rounded-full bg-gray-300 ring-1 ring-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:ring-blue-600`,
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          `pointer-events-none rounded-full bg-white shadow transition-transform will-change-transform data-[state=unchecked]:translate-x-0 ${thumb}`
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
