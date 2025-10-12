import type { ComponentChildren, HTMLAttributes } from "preact"
import {} from "preact"

import L from "./layout.module.scss"
import clsx from "clsx"

export function Option({
  children,
  className,
}: HTMLAttributes & {
  children: ComponentChildren
}) {
  return <div class={clsx(L.option, className)}>{children}</div>
}
