<template>
<div ref="wrapperElement" :data-label="label" class="text-input" :class="{
         [$style.wrapper]: true,
         [htmlClass as HTMLAttributes['class']]: true,
     }" :style="style as HTMLAttributes['style']" :aria-disabled="attrs.disabled as boolean ?? false"
     @click="focusInput" @mousedown="onMouseDown" @mouseup="onMouseUp" @mouseover="onMouseOver"
     @mouseout="onMouseOut">
    <label ref="labelElement" :for="id" :class="[ extractCssClass({
        'label': true,
        'label--float': focused || !!value,
    }, $style), {
        'text-input__label': true,
        'text-input__label--float': focused || !!value,
    } ]">
        {{ label }}
    </label>
    <div class="text-input__input-wrapper" :class="extractCssClass('text-input-wrapper', $style)">
        <div ref="prefixElement" class="text-input__prefix" :class="extractCssClass('prefix', $style)">
            <slot name="prefix"></slot>
        </div>
        <input ref="inputElement" v-bind="attrs" :id="id" v-model="value" :type="type" class="text-input__input"
               :class="extractCssClass('text-input', $style)" @focusin="onFocusIn" @focusout="onFocusOut" />
        <div ref="suffixElement" class="text-input__suffix"
             :class="extractCssClass({ 'suffix': true, 'suffix--error': errors.length > 0 }, $style)">
            <slot name="suffix"></slot>
        </div>
    </div>
    <div v-if="errorMessage" v-show="errorVisible" :class="extractCssClass('error', $style)" @click="hideError">
        {{ errorMessage }}
    </div>
</div>
</template>

<script lang="ts">
export type ValidatorObject = {
    errors: Array<string>
    errorMessage: string | undefined
    dirty: boolean
    valid: boolean
}

export type AppTextInputProps<T extends string | number> = {
    type: "text" | "email" | "password" | "tel" | "number"
    variant?: "default" | "outlined"
    label?: string // eslint-disable-line vue/require-default-prop
    height?: "small" | "medium" | "large" | number
    width?: string // eslint-disable-line vue/require-default-prop
    borderColor?: string
    borderRadius?: 5 | 10 | number
    hoverBorderColor?: string
    focusedBorderColor?: string
    focusedBackgroundColor?: string // eslint-disable-line vue/require-default-prop
    inputTextColor?: string
    labelColor?: string // eslint-disable-line vue/require-default-prop
    backgroundColor?: string // eslint-disable-line vue/require-default-prop
    hoverLabelColor?: string // eslint-disable-line vue/require-default-prop
    focusedLabelColor?: string, // eslint-disable-line vue/require-default-prop
    rules?: RuleExpression<T> // eslint-disable-line vue/require-default-prop
}
</script>

<script setup lang="ts" generic="T extends string | number">
import { computed } from "vue"
import { ref } from "vue"
import { useAttrs } from "vue"
import { useTemplateRef } from "vue"
import { watch } from "vue"

import { useField } from "vee-validate"

import type { HTMLAttributes } from "vue"
import type { RuleExpression } from "vee-validate"

import { extractCssClass, getParentBackgroundColor, themeColors } from "@/utils"

defineOptions({
    inheritAttrs: false,
})
const props = withDefaults(defineProps<AppTextInputProps<T>>(), {
    variant: "default",
    height: "medium",
    borderColor: themeColors.grayDark1,
    borderRadius: 5,
    hoverBorderColor: themeColors.white,
    focusedBorderColor: themeColors.white,
    inputTextColor: themeColors.white,
    maxLength: 10,
})
const { class: htmlClass, style, ...attrs } = useAttrs()

const model = defineModel<T>()
const validator = defineModel<ValidatorObject>("validator")
const { value, errorMessage, errors, meta } = useField<T | undefined>("value", computed(() => props.rules as RuleExpression<T | undefined> ?? undefined), { syncVModel: true })
watch([ errors, errorMessage, meta ], ([ errors, errorMessage, meta ]) => {
    validator.value = {
        errors,
        errorMessage,
        dirty: meta.dirty,
        valid: meta.valid,
    }
})

const id: string = `${Math.random()}`
const wrapperElement = ref<HTMLDivElement>()
const inputElement = ref<HTMLInputElement>()
const labelElement = ref<HTMLLabelElement>()
const prefixElement = useTemplateRef("prefixElement")
const suffixElement = useTemplateRef("suffixElement")

const errorVisible = ref(true)
watch(errorMessage, () => {
    errorVisible.value = true
})
const hideError = () => {
    errorVisible.value = false
}

const focused = ref(false)
const onFocusIn = () => {
    focused.value = true
}
const onFocusOut = () => {
    focused.value = false
}
const mouseOver = ref(false)
const onMouseOver = () => {
    if (!focused.value && !attrs.disabled)
        mouseOver.value = true
}
const onMouseOut = () => {
    mouseOver.value = false
}
const mouseDown = ref(false)
const onMouseDown = () => {
    mouseDown.value = true
}
const onMouseUp = () => {
    mouseDown.value = false
}
const focusInput = () => {
    if (!attrs.disabled)
        inputElement.value?.focus()
}
const elementHeight = computed(() => {
    switch (props.height) {
        case "small": return "34px"
        case "medium": return "38px"
        case "large": return "44px"
        default: return props.height
    }
})
const padding = computed(() => {
    switch (props.height) {
        case "small":
            return "0 12px 0 8px"
        case "medium":
            return "0 14px 0 10px"
        case "large":
            return "0 26px"
        default:
            return "0"
    }
})
const inputPadding = computed(() => {
    const prefixWidth = prefixElement.value ? `${prefixElement.value.getBoundingClientRect().width}px` : "0"
    const suffixWidth = suffixElement.value ? `${suffixElement.value.getBoundingClientRect().width}px` : "0"
    const paddigValues = padding.value.split(" ")
    const topPadding = paddigValues[0]
    const rightPadding = `calc(${paddigValues.length > 1 ? paddigValues[1] : paddigValues[0]} + ${suffixWidth})`
    const bottomPadding = paddigValues.length === 4 ? paddigValues[2] : paddigValues[0]
    const leftPadding = `calc(${paddigValues.length === 4 ? paddigValues[3] : paddigValues.length === 2 ? paddigValues[1] : paddigValues[0]} + ${prefixWidth})`
    return `${topPadding} ${rightPadding} ${bottomPadding} ${leftPadding}`
})
const labelLeftOffset = computed(() => {
    const prefixWidth = prefixElement.value ? `${prefixElement.value.getBoundingClientRect().width}px` : "0"
    const paddigValues = padding.value.split(" ")
    return `calc(${paddigValues.length === 4 ? paddigValues[3] : paddigValues.length === 2 ? paddigValues[1] : paddigValues[0]} + ${prefixWidth})`
})
const suffixRightOffet = computed(() => {
    const paddigValues = padding.value.split(" ")
    return paddigValues[paddigValues.length > 1 ? 1 : 0]
})

const borderSize = "1px"
const actualBorderColor = computed<string>(() => {
    if (errors.value.length > 0) {
        return themeColors.red
    }
    switch (props.variant) {
        case "outlined":
            if (focused.value)
                return props.focusedBorderColor
            else if (mouseOver.value)
                return props.hoverBorderColor
            else
                return props.borderColor
        case "default":
        default:
            if (focused.value)
                return props.focusedBorderColor
            else
                return "transparent"
    }
})
const borderStyle = computed<string>(() => `${borderSize} solid ${actualBorderColor.value}`)
const borderRadius = computed(() => `${props.borderRadius}px`)
const backgroundColor = computed<string>(() => {
    switch (props.variant) {
        case "outlined":
            if (mouseDown.value && !attrs.disabled)
                return themeColors.black
            return props.backgroundColor ?? "transparent"
        case "default":
        default:
            if (focused.value)
                return props.focusedBackgroundColor ?? themeColors.grayDark1
            if (mouseOver.value)
                return themeColors.grayDark2
            return props.backgroundColor ?? themeColors.black
    }

})
const labelColorCss = computed(() => props.labelColor ?? (focused.value || !!value.value ? actualBorderColor.value : "rgba(255, 255, 255, .4)"))
const labelOuterBackgroundColorCss = computed(() => getParentBackgroundColor(wrapperElement.value!))
const labelInnerBackgroundColorCss = computed(() => backgroundColor.value !== "transparent" ? backgroundColor.value : getParentBackgroundColor(labelElement.value!))
const backgroundOverrideColorCss = computed(() => backgroundColor.value !== "transparent" ? backgroundColor.value : labelOuterBackgroundColorCss.value)
</script>

<style module lang="scss">
@import "../assets/styles/variables.scss";
@import "../assets/styles/global.scss";

.wrapper {
    --border-radius: 8px;
    position: relative;
    width: v-bind(width);
    height: v-bind(elementHeight);
    display: flex;
    align-items: center;
    border-radius: v-bind(borderRadius);
    border: v-bind(borderStyle);
    background-color: v-bind(backgroundColor);
    cursor: text;

    &[aria-disabled="true"] {
        cursor: default;
    }

    &::before {
        content: attr(data-label);
        display: none;
        position: absolute;
        top: calc(v-bind(borderSize) * 2 * -1);
        left: var(--border-radius);
        height: 100%;
        padding: 0 1ch;
        border-top: calc(v-bind(borderSize) * 4) solid v-bind(labelOuterBackgroundColorCss);
        @extend .font-family--inter-light;
        font-size: .875rem;
        color: transparent;
        pointer-events: none;
    }

    &--floating-label {
        &::before {
            display: block;
        }
    }

    .text-input {
        width: 100%;
        height: 100%;
        padding: v-bind(inputPadding);
        @extend .font-family--inter-light;
        font-size: .875rem;
        color: var(--theme-white);

        &::placeholder {
            opacity: 1;
            text-align: left;
        }

        &:focus {
            outline: none;
        }

        &:disabled {
            color: var(--theme-gray-light1);
        }

        &-wrapper {
            display: flex;
            width: 100%;
            height: 100%;
            border-radius: v-bind(borderRadius);
            overflow: hidden;
        }

        &:-webkit-autofill {
            -webkit-box-shadow: inset 0 0 0px 9999px v-bind(backgroundOverrideColorCss);
            -webkit-text-fill-color: var(--theme-white);
        }
    }

    .label {
        position: absolute;
        left: v-bind(labelLeftOffset);
        @extend .font-family--inter-light;
        font-size: .875rem;
        color: v-bind(labelColorCss);
        pointer-events: none;

        &--float {
            display: none;
        }
    }

    .prefix,
    .suffix {
        position: absolute;
        top: 0;
        height: 100%;
        display: inline-flex;
        align-items: center;
        @extend .font-family--inter-medium;
        font-size: .875rem;
        pointer-events: none;

        &--error {
            color: var(--theme-red);
        }
    }

    .prefix {
        left: 0;
        color: v-bind(inputTextColor);
    }

    .suffix {
        right: v-bind(suffixRightOffet);
    }

    .error {
        position: absolute;
        left: 0;
        top: 100%;
        z-index: 9999;
        width: 300px;
        padding: 10px;
        border: none;
        border-radius: 10px;
        background-color: var(--theme-red);

        @extend .font-family--inter-medium;
        color: var(--theme-white);

        cursor: default;
    }

}
</style>