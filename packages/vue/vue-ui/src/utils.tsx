export function copyData(copyText: string) {
    const textArea = document.createElement('textarea');
    textArea.value = copyText;
    document.body.appendChild(textArea);
    textArea.select();
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.execCommand('copy');
    textArea.blur();
}

export function createWrapperAndAppendToBody(wrapperId?: string) {
    if (!wrapperId) {
        wrapperId = `wallet-${crypto.randomUUID()}`;
    }
    const wrapperElement = document.createElement('div');
    wrapperElement.setAttribute('id', wrapperId);
    wrapperElement.style.position = 'relative';
    document.body.appendChild(wrapperElement);
    return wrapperElement;
}

export function getRelatedPosition(child: HTMLElement, parent: HTMLElement) {
    let offsetParent: HTMLElement = child.offsetParent as HTMLElement;
    let left = 0,
        top = 0;
    while (offsetParent && offsetParent !== parent) {
        left += child.offsetLeft;
        top += child.offsetTop;
        child = offsetParent;
        offsetParent = child.offsetParent as HTMLElement;
    }
    left += child.offsetLeft;
    top += child.offsetTop;

    return { left, top };
}
