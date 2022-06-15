import * as Element from './element.js';

export function disableButton(button) {
    button.disabled = true;
    const label = button.innerHTML;
    button.innerHTML = 'Loading...'
    return label;
}

export function enableButton(button, label) {
    if (label) button.innerHTML = label;
    button.disabled = false;
}

export function display(title, body) {
    Element.modalDisplayTitle.innerHTML = title;
    Element.modalDisplayBody.innerHTML = body;
    Element.modalDisplay.show();
}