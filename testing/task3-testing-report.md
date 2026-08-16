# Task 3: Website Testing Report

**Word count (report body only): ~500 words**

## Methodology

All six pages (Home, Coffee Selection, Brewing Equipment, Events & Workshops, Cart, Special
Offers & Subscriptions) were tested with the W3C Markup Validation Service, the W3C CSS
Validation Service, a screen reader, and two browsers — one desktop, one mobile.

## HTML & CSS Validation

The W3C Nu Html Checker initially returned three genuine errors: the catalogue pages jumped
straight from `<h1>` to each product's `<h3>`, skipping `<h2>`, and the footer's `<h4>` column
headings skipped `<h3>`. Both were fixed — the catalogue pages gained a screen-reader-only
`<h2>` (visually hidden, no layout change), and the footer headings were promoted to `<h3>`.
Re-validation returned **zero errors and zero warnings** across all six pages (saved as
`w3c-html-validation-output.txt`). The W3C CSS Validation Service confirmed `style.css` valid
under CSS Level 3 + SVG with **no errors** (12 informational warnings only, none blocking
validity — screenshot attached).

## Screen Reader Testing

Testing with a screen reader confirmed the site is usable non-visually: the corrected heading
structure lets a reader jump section-to-section cleanly, every interactive control (nav links,
Add to Cart, Register, search boxes, star ratings) announces a clear name and role, the discount
and registration modals are announced on open, and form fields read their labels correctly. No
blocking issues were found.

## Two-Browser & Mobile Testing

Chrome and Firefox (desktop) rendered the site consistently — layout, colours, animations
(slideshow, hover states, modal transitions) and interactive JavaScript (cart, search, ratings,
registration) all matched. Two minor differences were noted, neither affecting usability:
Firefox renders the Georgia headings with marginally tighter letter-spacing than Chrome's font
hinting, and the native `<select>` dropdown arrows (roast/guest pickers) keep each browser's own
default style rather than a custom one — a deliberate choice to preserve native accessibility
behaviour, not a bug.

On mobile (Safari on iOS), the site was fully usable: the hamburger menu, modals, and cart
worked correctly, and inputs are set at 16px to avoid iOS Safari's auto-zoom-on-focus
behaviour. One real discrepancy was found: the hero's `min-height: 90vh` is calculated against
the full viewport height before Safari's address bar collapses, so on first load the hero sits
slightly taller than the visible viewport until the user scrolls once — worth revisiting with
`100dvh` (dynamic viewport height).

## Role of the W3C

The World Wide Web Consortium (W3C) is the standards body that defines and maintains the
specifications for HTML and CSS. Its validators check a document against those specifications
rather than against how any one browser currently renders it, which is why validation matters
even when a page "looks fine": non-compliant markup can render inconsistently across browsers,
assistive technologies, and future browsers never manually tested.

## Outstanding Issues & Recommendations

The main outstanding item is real photography — the prototype uses CSS/SVG illustrations rather
than licensed photos, which should be sourced before a production launch. The `90vh` hero should
move to `100dvh`. Testing coverage was reasonably thorough for a prototype stage (automated and
manual validation, one screen reader, two browsers including mobile), but a production release
would benefit from a second screen reader (JAWS) and a wider spread of real devices.
