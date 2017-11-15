namespace Config{

export let PREFERRED_BOARD_SIZE=400

export let BOARD_INFO_HEIGHT=50

export let TOTAL_BOARD_HEIGHT = PREFERRED_BOARD_SIZE + 2 * BOARD_INFO_HEIGHT

export let PREFERRED_TAB_SIZE=900

export let STANDARD_START_RAW_FEN =

    "r0n0b0q0k0b0n0r0"+
    "p0p0p0p0p0p0p0p0"+
    "-0-0-0-0-0-0-0-0"+
    "-0-0-0-0-0-0-0-0"+
    "-0-0-0-0-0-0-0-0"+
    "-0-0-0-0-0-0-0-0"+
    "p1p1p1p1p1p1p1p1"+
    "r1n1b1q1k1b1n1r1"

let FOUR_PLAYER_START_RAW_FEN =
    "-0-0-0r0n0b0q0k0b0n0r0-0-0-0"+
    "-0-0-0p0p0p0p0p0p0p0p0-0-0-0"+
    "-0-0-0-0-0-0-0-0-0-0-0-0-0-0"+
    "r3p3-0-0-0-0-0-0-0-0-0-0p2r2"+
    "n3p3-0-0-0-0-0-0-0-0-0-0p2n2"+
    "b3p3-0-0-0-0-0-0-0-0-0-0p2b2"+
    "k3p3-0-0-0-0-0-0-0-0-0-0p2q2"+
    "q3p3-0-0-0-0-0-0-0-0-0-0p2k2"+
    "b3p3-0-0-0-0-0-0-0-0-0-0p2b2"+
    "n3p3-0-0-0-0-0-0-0-0-0-0p2n2"+
    "r3p3-0-0-0-0-0-0-0-0-0-0p2r2"+
    "-0-0-0-0-0-0-0-0-0-0-0-0-0-0"+
    "-0-0-0p1p1p1p1p1p1p1p1-0-0-0"+
    "-0-0-0r1n1b1k1q1b1n1r1-0-0-0"

export let variantToDisplayName={
    "standard":"Standard",
    "atomic":"Atomic",
    "fourplayer":"Four Player"
}

export let variantToVariantCode={
    "standard":201,
    "atomic":202,
    "fourplayer":401
}

export let startRawFens={
    "standard":STANDARD_START_RAW_FEN,
    "atomic":STANDARD_START_RAW_FEN,
    "fourplayer":FOUR_PLAYER_START_RAW_FEN
}

export function isSupportedVariant(variant:string){
    return variantToVariantCode[variant]!=undefined
}

export function supportedVariants():string[]{
    return Object.keys(variantToVariantCode)
}

}