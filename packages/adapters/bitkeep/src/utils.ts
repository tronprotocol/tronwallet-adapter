export function supportBitKeep() {
    return !!window.tronLink && (window as any).isBitKeep;
}
