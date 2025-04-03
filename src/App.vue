<template>
<div class="app-wrapper">
    <RouterView class="page-layout" />
    <section id="overlay-layer"></section>
</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

import { RouterView } from "vue-router"

import { themeColors, themeColorsRgb, toKebabCase } from "@/utils"


onMounted(() => {
    const colorCssVars = Object.keys(themeColors).
        reduce((accumulator: Record<string, string>, colorName: string) => {
            accumulator[`--theme-${toKebabCase(colorName)}`] = themeColors[colorName as keyof typeof themeColors]
            return accumulator
        }, {})
    Object.keys(colorCssVars).forEach((varName: string) => {
        document.documentElement.style.setProperty(varName, colorCssVars[varName])
    })
    const rgbColorCssVars = Object.keys(themeColorsRgb).
        reduce((accumulator: Record<string, string>, colorName: string) => {
            accumulator[`--theme-rgb-${toKebabCase(colorName)}`] = themeColorsRgb[colorName as keyof typeof themeColorsRgb]
            return accumulator
        }, {})
    Object.keys(rgbColorCssVars).forEach((varName: string) => {
        document.documentElement.style.setProperty(varName, rgbColorCssVars[varName])
    })
})
</script>

<style module lang="scss">
@import "./assets/styles/variables.scss";
@import "./assets/styles/global.scss";

.main-loader {
    position: absolute;
    transform: unset !important;
}
</style>

<style lang="scss">
#overlay-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
</style>