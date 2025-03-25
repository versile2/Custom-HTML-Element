class KeyDownOverride extends HTMLElement {    
    constructor() {
        super();
    }
    connectedCallback() {
        requestAnimationFrame(() => {
            this.inputElement = this.querySelector('input, textarea');

            if (this.inputElement) {
                this.handleKeyDown = this.handleKeyDown.bind(this);
                this.inputElement.addEventListener('keydown', this.handleKeyDown);
            } else {
                console.warn('No input or textarea found inside keydown-override');
            }
        });
    }

    disconnectedCallback() {
        if (this.inputElement && this.handleKeyDown) {
            this.inputElement.removeEventListener('keydown', this.handleKeyDown);
        }
    }

    handleKeyDown(event) {
        if (event.key === "Enter") {
            event.stopPropagation();
        }
        if (this.dotNetReference) {
            // Pass relevant event data to Blazor
            this.dotNetReference.invokeMethodAsync('CallOnKeyDownAsync', {
                key: event.key,
                code: event.code,
                altKey: event.altKey,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey
            });
        } else {
            console.warn('dotNetReference is not set');
        }
    }

    // Method to set the DotNetReference from Blazor
    setDotNetReference(ref) {
        this.dotNetReference = ref;
    }
}

customElements.define('keydown-override', KeyDownOverride);
// Hides the element from the user and CSS
document.head.insertAdjacentHTML('beforeend', `
    <style>
        keydown-override {
            display: contents;
        }
    </style>
`);

window.setDotNetReferenceOnElement = (dotNetRef) => {
    const element = document.querySelector('keydown-override');
    if (element) {
        element.setDotNetReference(dotNetRef);
    } else {
        console.error('keydown-override element not found');
    }
};