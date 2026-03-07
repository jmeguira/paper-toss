# Next Up — Visual & Feel Polish

Picked direction: bioluminescent deep-ocean palette, teal/cyan world + warm orange player elements. Portal/Tron inspired but accessible — soft glow, not neon.

## Palette pass (done)
- Teal grid, orange ball, cyan target, soft white text
- Two-color rule: teal = world, orange = player

## Remaining steps

### Target elevation
- Give target actual Y height in world space — ball arcs *into* it, not onto it
- "Making a basket" / "Death Star trench run" feel
- Hit detection unchanged (x,z only, Y is cosmetic)
- Render as a vertical ring/portal floating at a world-space Y height

### Landing feedback
- Tier text on the back wall: PERFECT (gold), HIT (teal), NEAR HIT (subtle), MISS (dim red)
- Flash/fade quickly — don't slow down the shot cycle
- Gradient of delight already baked into tier system, just needs a face

### Wind particles
- Ambient flow lines/streamers showing wind direction + strength
- Keep the numeric display — user should feel like a calculation is happening
- Layer on top of existing arrow + number

### Future
- Sound + haptics
- Dev settings panel (live sliders for tuning)
- Skin system (paper toss easter egg, etc.)
