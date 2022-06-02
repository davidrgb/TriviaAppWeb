export function disableButton(button) {
    button.disabled = true;
    const label = button.innerHTML;
    button.innerHTML = 'Wait...'
    return label;
}

export function enableButton(button, label) {
    if (label) button.innerHTML = label;
    button.disabled = false;
}