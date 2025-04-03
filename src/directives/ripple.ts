// Styles
import style from "./ripple.module.scss"

import type { DirectiveBinding } from "vue"

const stopSymbol = Symbol("rippleStop")
type VuetifyRippleEvent = (MouseEvent | TouchEvent | KeyboardEvent) & { [stopSymbol]?: boolean }

const isObject = (obj: any): obj is Record<string, any> =>
    obj !== null && typeof obj === "object" && !Array.isArray(obj)

const DELAY_RIPPLE = 80

function transform (el: HTMLElement, value: string) {
    el.style.transform = value
    el.style.webkitTransform = value
}

interface RippleOptions {
    class?: string
    center?: boolean
    circle?: boolean
}

export interface RippleDirectiveBinding extends Omit<DirectiveBinding, 'modifiers' | 'value'> {
    value?: boolean | { class: string }
    modifiers: {
        center?: boolean
        circle?: boolean
        stop?: boolean
    }
}
type HtmlRippleElement = HTMLElement & { _ripple?: InternalRipple }

const isTouchEvent = (e: VuetifyRippleEvent): e is TouchEvent => e.constructor.name === "TouchEvent"
const isKeyboardEvent = (e: VuetifyRippleEvent): e is KeyboardEvent => e.constructor.name === "KeyboardEvent"

const calculate = (
    e: VuetifyRippleEvent,
    el: HtmlRippleElement,
    value: RippleOptions = {}
) => {
    let localX = 0
    let localY = 0

    if (!isKeyboardEvent(e)) {
        const offset = el.getBoundingClientRect()
        const target = isTouchEvent(e) ? e.touches[e.touches.length - 1] : e

        localX = target.clientX - offset.left
        localY = target.clientY - offset.top
    }

    let radius = 0
    let scale = 0.3
    if (el._ripple?.circle) {
        scale = 0.15
        radius = el.clientWidth / 2
        radius = value.center ? radius : radius + Math.sqrt((localX - radius) ** 2 + (localY - radius) ** 2) / 4
    } else {
        radius = Math.sqrt(el.clientWidth ** 2 + el.clientHeight ** 2) / 2
    }

    const centerX = `${(el.clientWidth - (radius * 2)) / 2}px`
    const centerY = `${(el.clientHeight - (radius * 2)) / 2}px`

    const x = value.center ? centerX : `${localX - radius}px`
    const y = value.center ? centerY : `${localY - radius}px`

    return { radius, scale, x, y, centerX, centerY }
}

const ripples = {
    show (
        e: VuetifyRippleEvent,
        el: HtmlRippleElement,
        value: RippleOptions = {}
    ) {
        if (!el?._ripple?.enabled)
            return

        const container = document.createElement("span")
        const animation = document.createElement("span")

        container.appendChild(animation)
        container.className = style['v-ripple__container']

        if (value.class)
            container.className += ` ${value.class}`

        const { radius, scale, x, y, centerX, centerY } = calculate(e, el, value)

        const size = `${radius * 2}px`
        animation.className = style['v-ripple__animation']
        animation.style.width = size
        animation.style.height = size

        el.appendChild(container)

        const computed = window.getComputedStyle(el)
        if (computed && computed.position === "static") {
            el.style.position = "relative"
            el.dataset.previousPosition = "static"
        }

        animation.classList.add(style['v-ripple__animation--enter'])
        animation.classList.add(style['v-ripple__animation--visible'])
        transform(animation, `translate(${x}, ${y}) scale3d(${scale},${scale},${scale})`)
        animation.dataset.activated = String(performance.now())

        setTimeout(() => {
            animation.classList.remove(style['v-ripple__animation--enter'])
            animation.classList.add(style['v-ripple__animation--in'])
            transform(animation, `translate(${centerX}, ${centerY}) scale3d(1,1,1)`)
        }, 0)
    },

    hide (el: HtmlRippleElement | null) {
        if (!el?._ripple?.enabled) return

        const ripples = el.getElementsByClassName(style['v-ripple__animation']) as HTMLCollectionOf<HTMLElement>

        if (ripples.length === 0) return
        const animation = ripples[ripples.length - 1]

        if (animation.dataset.isHiding) return
        else animation.dataset.isHiding = "true"

        const diff = performance.now() - Number(animation.dataset.activated)
        const delay = Math.max(250 - diff, 0)

        setTimeout(() => {
            animation.classList.remove(style['v-ripple__animation--in'])
            animation.classList.add(style['v-ripple__animation--out'])

            setTimeout(() => {
                const ripples = el.getElementsByClassName(style['v-ripple__animation'])
                if (ripples.length === 1 && el.dataset.previousPosition) {
                    el.style.position = el.dataset.previousPosition
                    delete el.dataset.previousPosition
                }

                if (animation.parentNode?.parentNode === el) el.removeChild(animation.parentNode)
            }, 300)
        }, delay)
    },
}

const rippleShow = (e: VuetifyRippleEvent) => {
    const value: RippleOptions = {}
    const element = e.currentTarget as HtmlRippleElement | undefined

    if (!element?._ripple || element._ripple.touched || e[stopSymbol]) return

    // Don't allow the event to trigger ripples on any other elements
    e[stopSymbol] = true

    if (isTouchEvent(e)) {
        element._ripple.touched = true
        element._ripple.isTouch = true
    } else {
    // It's possible for touch events to fire
    // as mouse events on Android/iOS, this
    // will skip the event call if it has
    // already been registered as touch
        if (element._ripple.isTouch) return
    }

    value.center = element._ripple.centered || isKeyboardEvent(e)
    if (element._ripple.class) {
        value.class = element._ripple.class
    }

    if (isTouchEvent(e)) {
    // already queued that shows or hides the ripple
        if (element._ripple.showTimerCommit) return

        element._ripple.showTimerCommit = () => {
            ripples.show(e, element, value)
        }
        element._ripple.showTimer = window.setTimeout(() => {
            if (element?._ripple?.showTimerCommit) {
                element._ripple.showTimerCommit()
                element._ripple.showTimerCommit = null
            }
        }, DELAY_RIPPLE)
    } else {
        ripples.show(e, element, value)
    }
}
const rippleHide = (e: Event) => {
    const element = e.currentTarget as HtmlRippleElement | null
    if (!element?._ripple) return

    window.clearTimeout(element._ripple.showTimer)

    // The touch interaction occurs before the show timer is triggered.
    // We still want to show ripple effect.
    if (e.type === "touchend" && element._ripple.showTimerCommit) {
        element._ripple.showTimerCommit()
        element._ripple.showTimerCommit = null

        // re-queue ripple hiding
        element._ripple.showTimer = window.setTimeout(() => {
            rippleHide(e)
        })
        return
    }

    window.setTimeout(() => {
        if (element._ripple) {
            element._ripple.touched = false
        }
    })
    ripples.hide(element)
}
const rippleStop = (e: VuetifyRippleEvent) => {
    e[stopSymbol] = true
}
const rippleCancelShow = (e: MouseEvent | TouchEvent) => {
    const element = e.currentTarget as HtmlRippleElement | undefined

    if (!element?._ripple) return

    if (element._ripple.showTimerCommit)
        element._ripple.showTimerCommit = null

    window.clearTimeout(element._ripple.showTimer)
}
const keyboardRiple = {
    block: false,
    show(e: KeyboardEvent) {
        if (!this.block && (e.key === "Enter" || e.key === " ")) {
            this.block = true
            rippleShow(e)
        }
    },
    hide(e: KeyboardEvent) {
        this.block = false
        rippleHide(e)
    },
    focusHide(e: FocusEvent) {
        if (this.block) {
            this.block = false
            rippleHide(e)
        }
    },
}

const removeListeners = (el: HTMLElement) => {
    el.removeEventListener("mousedown", rippleShow)
    el.removeEventListener("touchstart", rippleShow)
    el.removeEventListener("touchend", rippleHide)
    el.removeEventListener("touchmove", rippleCancelShow)
    el.removeEventListener("touchcancel", rippleHide)
    el.removeEventListener("mouseup", rippleHide)
    el.removeEventListener("mouseleave", rippleHide)
    el.removeEventListener("keydown", keyboardRiple.show)
    el.removeEventListener("keyup", keyboardRiple.hide)
    el.removeEventListener("dragstart", rippleHide)
    el.removeEventListener("blur", keyboardRiple.focusHide)
}

const isRippleEnabled = (value: any): value is true =>
    typeof value === "undefined" || !!value

type InternalRipple = {
    enabled: boolean
    centered?: boolean
    circle?: boolean
    class?: string
    touched?: boolean
    isTouch?: boolean
    showTimerCommit?: (() => void) | null
    showTimer?: number
}
const updateRipple = (el: HtmlRippleElement, binding: RippleDirectiveBinding, wasEnabled: boolean) => {
    const { value, modifiers } = binding
    const enabled = isRippleEnabled(value)
    if (!enabled)
        ripples.hide(el)

    el._ripple = el._ripple ?? {} as InternalRipple
    el._ripple = {
        enabled,
        centered: modifiers.center,
        circle: modifiers.circle,
    }
    if (isObject(value) && 'class' in value)
        el._ripple.class = value.class

    if (enabled && !wasEnabled) {
        if (modifiers.stop) {
            el.addEventListener("touchstart", rippleStop, { passive: true })
            el.addEventListener("mousedown", rippleStop)
            return
        }

        el.addEventListener("touchstart", rippleShow, { passive: true })
        el.addEventListener("touchend", rippleHide, { passive: true })
        el.addEventListener("touchmove", rippleCancelShow, { passive: true })
        el.addEventListener("touchcancel", rippleHide)

        el.addEventListener("mousedown", rippleShow)
        el.addEventListener("mouseup", rippleHide)
        el.addEventListener("mouseleave", rippleHide)

        el.addEventListener("keydown", keyboardRiple.show)
        el.addEventListener("keyup", keyboardRiple.hide)

        el.addEventListener("blur", keyboardRiple.focusHide)

        // Anchor tags can be dragged, causes other hides to fail - #1537
        el.addEventListener("dragstart", rippleHide, { passive: true })
    } else if (!enabled && wasEnabled) {
        removeListeners(el)
    }
}


export const Ripple = {
    mounted: (el: HTMLElement, binding: RippleDirectiveBinding) => {
        updateRipple(el, binding, false)
    },
    updated: (el: HTMLElement, binding: RippleDirectiveBinding) => {
        if (binding.value === binding.oldValue)
            return

        const wasEnabled = isRippleEnabled(binding.oldValue)
        updateRipple(el, binding, wasEnabled)
    },
    unmounted: (el: HtmlRippleElement) => {
        delete el._ripple
        removeListeners(el)
    },
}

export default Ripple
