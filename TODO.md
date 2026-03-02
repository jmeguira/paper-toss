# TODO

## Deferred Design Decisions
- [ ] Power mechanic — swipe gesture feels too imprecise for power input. Revisit whether power should come from swipe speed, a separate UI element, or stay fixed. Low lift to add later
- [ ] Spin mechanic — curved swipe → curved flight. Deferred from MVP. Need to decide if it adds skill depth or just frustration
- [ ] Accessibility options — mechanical angle/power input as alternative to swipe gesture (sliders, buttons, etc.)
- [ ] SwipeFeedback / horizontal launch point — should swiping laterally move the ball's starting position, not just change the angle? Affects feel of the throw mechanic
- [ ] Overall gameplay complexity — how many mechanics (power, spin, wind, angle) is the right amount? Keep it simple or layer up?
- [ ] Swipe sensitivity settings — user-adjustable thresholds for cancel distance, min swipe distance, and min speed
- [ ] Projectile types (Heavy/Balanced/Flippy) — different physics profiles. Needs unlock system design

## Polish / Tech Debt
- [ ] Handle dynamic window resizing — GroundPlane and Target positions are calculated once at creation; they won't reposition if the viewport changes. Fine for mobile, needs fixing for desktop play
