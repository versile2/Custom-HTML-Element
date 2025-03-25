# KeyDownOverride Custom Element Demo

This repository demonstrates a custom HTML element, `<keydown-override>`, built with JavaScript and integrated with Blazor (or adaptable to plain HTML). The custom element enhances an `<input>` or `<textarea>` by adding a `keydown` event listener while preserving any existing handlers. It also showcases proper CSS isolation by leveraging a surrounding `div` for page-level components, ensuring styles don’t bleed unexpectedly.

## Features

1. **Custom Element with Keydown Event**:
   - Wraps an `<input>` or `<textarea>` in a hidden `<keydown-override>` element.
   - Adds a `keydown` event listener that logs keypresses and optionally calls a Blazor method via JS interop.
   - Preserves any pre-existing `keydown` handlers on the input (e.g., from Blazor’s `@onkeydown`).

2. **Hidden Element**:
   - The `<keydown-override>` element uses `display: contents` in CSS, making it invisible to the user and CSS selectors while still allowing its children (the input) to render normally.

3. **CSS Isolation**:
   - Demonstrates encapsulating components (or "pages") within a surrounding `div` to isolate styles.
   - For CSS Isolation to properly work any page that has isolation must encompass itself in a surrounding div. 
   - Components will not receive custom styles unless surrounded by the div that relates to the CSS isolation.
   - Prevents style leakage between components by scoping CSS to the parent container.

## Demo Code

### JavaScript (Custom Element Definition)
```javascript
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
```