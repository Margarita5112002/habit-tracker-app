

export const getColorWithOpacity = (color: string, opacity: number): string => {
    const a = Math.round(255*(opacity/100))
    const hexa = a.toString(16)

    return color.slice(0, 7) + (hexa.length < 2 ? '0' + hexa : hexa)
}