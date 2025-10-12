import { type Payload } from "./utils"

export const context: Context = {}

type Context = {
  updateOption?: <T extends keyof Payload>(type: T, payload: Payload[T]) => void
}

export function setContext(ctx: Context) {
  context.updateOption = ctx.updateOption
}
