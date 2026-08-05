# Visual fidelity ledger

**Accepted concept:** `public/concept/accepted-concept.png`  
**Rendered QA references:** generated with headless Chromium through Playwright request interception because direct loopback navigation was blocked by the browser policy in the execution environment.

## Comparison points

1. **First viewport composition** — preserved the fixed dark glass header, left-aligned KOTRASKO hero copy, dominant haircut image, right-side €10 / 60 min service card, and gold CTA hierarchy.
2. **Palette** — locked to true black/deep charcoal, warm gold accents, and soft ivory text from the accepted concept.
3. **Typography** — large condensed/display KOTRASKO treatment, clean sans-serif body/UI typography, tight heading tracking, and compact gold labels.
4. **Lookbook anatomy** — horizontal haircut rail with consistent 4:5 crops, dark image cards, gold tags, and booking-by-vibe interaction.
5. **Booking flow** — reproduced the visual stepper, photo-led vibe selection, gold selected state, date/time slots, review ticket, and glowing success check.
6. **Mobile behavior** — full-screen booking workspace, bottom sticky booking CTA, thumb-friendly 44 px+ controls, single-column vibe cards, and responsive type/layout.
7. **Brand integration** — Big Head House appears as the parent/location brand while KOTRASKO remains primary.
8. **Motion and accessibility** — subtle reveal, selected-state transitions, dialog entry, confirmation animation, focus-visible styles, and reduced-motion fallback.

## Material mismatches fixed during QA

- Added a fallback that reveals all sections if IntersectionObserver does not fire.
- Corrected hidden admin/login panels by enforcing the HTML `hidden` attribute.
- Mirrored and edge-faded the hero haircut image to better match the concept direction.
- Corrected the Big Head House logo sizing and eager loading on mobile to remove a large empty section.
- Verified the first booking state, mobile booking state, success state, and admin dashboard in Chromium.

## Intentional differences

- Real supplied haircut photographs are used instead of the concept's generated/retouched substitutes.
- Unverified claims such as “100% satisfaction” or “best barber” are not included.
- The production UI uses Slovak-first copy with selected English brand moments such as `YOU’RE BOOKED.`
