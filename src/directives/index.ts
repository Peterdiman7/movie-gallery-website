import type { App } from "vue"
import Ripple from "./ripple"

export const registerDirectives = (app: App) =>
    new Promise<void>((resolve: () => void, reject: (reason?: any) => void) => {
        app.directive("ripple", Ripple)
        resolve()
    })
