export type Nonable = "NONE"

/* CSS Helpers */
type ClassConditionalObject = Record<string, boolean>

export type ClassArray = Array<ClassValue | undefined>
export type ClassObject = ClassArray | ClassConditionalObject
type ClassValue = string | ClassObject
const isClassString = (value: ClassValue): value is string => typeof value === "string"
const isClassObject = (value: ClassValue): value is ClassObject => typeof value === "object"
const isClassArray = (value: ClassValue): value is ClassArray => typeof value === "object" && Array.isArray(value)
const isClassConditionalObject = (value: ClassValue): value is ClassConditionalObject => typeof value === "object" && !Array.isArray(value)

const mapClassNameString = (className: string, styleObject: Record<string, string>): Array<string> =>
    className.split(/\s+/).map((classname: string) => classname in styleObject ? styleObject[classname] : classname)
const mapClassNameObject = (className: ClassConditionalObject, styleObject: Record<string, string>): ClassConditionalObject =>
    Object.keys(className).reduce((accumulator: ClassConditionalObject, currentValue: string) => {
        if (currentValue in styleObject)
            accumulator[styleObject[currentValue]] = className[currentValue]
        else
            accumulator[currentValue] = className[currentValue]
        return accumulator
    }, {})
    
/**
 * Picks CSS classes that exist in `styleObject` and returns the rest as is
 * Example: pickCssClass("bg-red circle form-heading btn", $style) => "bg-red _circle_asdf3_2 _form-heading_hdtg2_5 btn"
 * @returns A VueJS class object with classes picked from `styleObject` if they exist in `styleObject` and classes as provided if they don't
 */
export const pickCssClass = (className: ClassValue, styleObject: Record<string, string>): ClassObject => {
    if (!isClassObject(className))
        return mapClassNameString(className, styleObject)

    if (isClassConditionalObject(className))
        return mapClassNameObject(className, styleObject)

    // Array<string | ClassConditionalObject | ClassObject>
    return className.reduce((accumulator: ClassArray, currentValue: ClassValue | undefined) => {
        if (currentValue === undefined)
            return accumulator
        if (isClassString(currentValue))
            accumulator = accumulator.concat(mapClassNameString(currentValue, styleObject))
        else if (isClassArray(currentValue))
            accumulator.push(pickCssClass(currentValue, styleObject))
        else
            accumulator.push(mapClassNameObject(currentValue, styleObject))

        return accumulator
    }, [] as ClassArray)
}

const extractClassNameString = (className: string, styleObject: Record<string, string>): Array<string> =>
    className.split(/\s+/).map((classname: string) => styleObject[classname])
const extractClassNameObject = (className: ClassConditionalObject, styleObject: Record<string, string>): ClassConditionalObject =>
    Object.keys(className).reduce((accumulator: ClassConditionalObject, currentValue: string) => {
        accumulator[styleObject[currentValue]] = className[currentValue]
        return accumulator
    }, {})

/**
 * Extracts CSS classes from `styleObject` so you don't have to type `$style.class1 $style.class2`. All passed classes must be in the `styleObject`
 * Example: pickCssClass("circle form-heading", $style) => "_circle_asdf3_2 _form-heading_hdtg2_5"
 * @returns A VueJS class object with classes picked from `styleObject`
 */
export const extractCssClass = (className: ClassValue, styleObject: Record<string, string>): ClassObject => {
    if (!isClassObject(className))
        return extractClassNameString(className, styleObject)

    if (isClassConditionalObject(className))
        return extractClassNameObject(className, styleObject)

    // Array<string | ClassConditionalObject | ClassObject>
    return className.reduce((accumulator: ClassArray, currentValue: ClassValue | undefined) => {
        if (currentValue === undefined)
            return accumulator
        if (isClassString(currentValue))
            accumulator = accumulator.concat(extractClassNameString(currentValue, styleObject))
        else if (isClassArray(currentValue))
            accumulator.push(extractCssClass(currentValue, styleObject))
        else
            accumulator = accumulator.concat(extractClassNameObject(currentValue, styleObject))
        return accumulator
    }, [] as ClassArray)
}

export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h
    if (d === 0) h = 0
    else if (max === r) h = ((((g - b) / d) % 6) + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else if (max === b) h = (r - g) / d + 4
    const l = (min + max) / 2
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
    if (h === undefined)
        return [ NaN, NaN, NaN ]
    return [ h * 60, s, l ]
}

const additionalThemeColors = {
    warning: "#C16E06",
}

export const themeColors = {
    background: "#141519",
    black: "#000000",
    white: "#FFFFFF",
    grayDark0: "#464850", // TODO: Rename to grayDark1 and grayDark1 to grayDark2 and grayDark2 to grayDark3
    grayDark1: "#3C3B40",
    grayDark2: "#1C1D1F",
    gray: "#868890",
    grayLight1: "#CACACC",
    red: "#E45560",
    green: "#00CC8D",
    greenLight: "#1DE5A7",
    gold: "#C59C6C",
    goldLight: "#C69C6D",
    backgroundLighter1: "",
    backgroundLighter2: "",
    backgroundDarker1: "",
    backgroundDarker2: "",
    ...additionalThemeColors,
}

export const hexToRgb = (hexColor: string): [number, number, number] => {
    const input = hexColor.startsWith("#") ? hexColor.substring(1) : hexColor
    const r = input.length === 3 || input.length === 4 ? Number.parseInt(`${input.substring(0, 1)}${input.substring(0, 1)}`, 16) : Number.parseInt(input.substring(0, 2), 16)
    const g = input.length === 3 || input.length === 4 ? Number.parseInt(`${input.substring(1, 2)}${input.substring(1, 2)}`, 16) : Number.parseInt(input.substring(2, 4), 16)
    const b = input.length === 3 || input.length === 4 ? Number.parseInt(`${input.substring(2, 3)}${input.substring(2, 3)}`, 16) : Number.parseInt(input.substring(4, 6), 16)
    return [ r, g, b ]
}

export const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = h / 60.0;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb1;
    if (isNaN(h)) rgb1 = [ 0, 0, 0 ];
    else if (hp <= 1) rgb1 = [ c, x, 0 ];
    else if (hp <= 2) rgb1 = [ x, c, 0 ];
    else if (hp <= 3) rgb1 = [ 0, c, x ];
    else if (hp <= 4) rgb1 = [ 0, x, c ];
    else if (hp <= 5) rgb1 = [ x, 0, c ];
    else if (hp <= 6) rgb1 = [ c, 0, x ];
    const m = l - c * 0.5;
    if (rgb1 === undefined)
        return [ NaN, NaN, NaN ]
    return [
        Math.round(255 * (rgb1[0] + m)),
        Math.round(255 * (rgb1[1] + m)),
        Math.round(255 * (rgb1[2] + m)),
    ]
}

export const rgbToHex = (r: number, g: number, b: number): string => `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`

const backgroundThemeColorHsl = rgbToHsl(...hexToRgb(themeColors.background))
themeColors.backgroundLighter1 = rgbToHex(...hslToRgb(backgroundThemeColorHsl[0], backgroundThemeColorHsl[1], backgroundThemeColorHsl[2] + .06))
themeColors.backgroundLighter2 = rgbToHex(...hslToRgb(backgroundThemeColorHsl[0], backgroundThemeColorHsl[1], backgroundThemeColorHsl[2] + .12))
themeColors.backgroundDarker1 = rgbToHex(...hslToRgb(backgroundThemeColorHsl[0], backgroundThemeColorHsl[1], backgroundThemeColorHsl[2] - .03))
themeColors.backgroundDarker2 = rgbToHex(...hslToRgb(backgroundThemeColorHsl[0], backgroundThemeColorHsl[1], backgroundThemeColorHsl[2] - .06))

/**
 * For usage with the rgb() CSS function (in format: "<r> <g> <b>" - "255 255 255")
 */
export const themeColorsRgb = Object.keys(themeColors).reduce((accumulator: typeof themeColors, colorName: string) => {
    const rgbColor = hexToRgb(themeColors[colorName as keyof typeof themeColors])
    accumulator[colorName as keyof typeof themeColors] = `${rgbColor[0]} ${rgbColor[1]} ${rgbColor[2]}`
    return accumulator
}, { ...themeColors })

export const isNumeric = (str: string) =>
    typeof str !== "string" ? false : // just in case
        !isNaN(str as any) && !isNaN(parseFloat(str))

export function getSeparator(separatorType: "decimal", locale: string): string
export function getSeparator(separatorType: "group", locale: string): string | undefined
export function getSeparator(separatorType: "decimal" | "group", locale: string) {
    const numberWithGroupAndDecimalSeparator = 1000.1
    return Intl.NumberFormat(locale).formatToParts(numberWithGroupAndDecimalSeparator).find(part => part.type === separatorType)?.value
}

export const getParentBackgroundColor = (el: HTMLElement): string => {
    const parent = el.parentElement
    if (parent == null)
        return "transparent"

    const backgroundColor = window.getComputedStyle(parent).backgroundColor
    if (backgroundColor === "transparent" || backgroundColor === "rgba(0, 0, 0, 0)")
        return getParentBackgroundColor(parent)
    return backgroundColor
}

/**
 * Turns any camelCase or PascalCase string to kebab-case
 */
export const toKebabCase = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
