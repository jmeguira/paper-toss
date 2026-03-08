# Next Up — Visual & Feel Polish

Picked direction: bioluminescent deep-ocean palette, teal/cyan world + warm orange player elements. Portal/Tron inspired but accessible — soft glow, not neon.

## Palette pass (done)
- Teal grid, orange ball, cyan target, soft white text
- Two-color rule: teal = world, orange = player

## Remaining steps

### Target elevation ✅
- `TARGET_Y = 200` world-space height — ball arcs *into* it, not onto it
- Hit detection unchanged (x,z only, Y is cosmetic)
- vy0 formula adjusted so ball arrives at TARGET_Y; flight baseline interpolates to TARGET_Y
- Focal length tuned (250→225) and difficulty spread widened (600/1000/1400) for more felt distance

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
