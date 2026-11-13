# Copy deck

Every user-facing string, by page and state. `/` marks a line break in a Michroma headline; the middle line of three is dimmed. Strings marked **new** aren't on a board; **Changed from the board** marks deliberate fixes.

## Shared

**Header.** Wordmark "HERMES" (aria-label "Hermes Motors home") · nav: Team · HM-27 · Drivers · Season 2027 · Partners · News · Store icon (aria-label "Store") · theme button aria-label: night → "Preview first light", day → "Preview the site before dawn" · preview chip **new**: "Preview" · Test drive: day "Test drive"; night "Test drive opens 06:00" (locked). Menu button **new**: "Menu" / "Close menu".

**Footer.** "SPEED IS / THE / MESSAGE." · day line: "A Grand Prix team in its first season. Take the HM‑27 for a lap." · night line: "A message is on its way. At 06:00 the HM‑27 meets first light, and the test drive opens." · status chip day: "TEST DRIVE OPEN · BEAT 1:11.906"; night: "06:00 AT THE PROVING GROUND · STREAMED LIVE" (phone: "06:00 AT THE PROVING GROUND") · columns: HM-27 (The car, Specs, Test drive) · TEAM (About, Drivers, Manifesto) · SEASON 2027 (Calendar, News, Press kit) · MORE (Partners, Store, Contact) · social: INSTAGRAM, TIKTOK, YOUTUBE, X · credit: "3D models based on “2026 F1 CAR” by Abu Saif and a helmet by Miopass, both CC BY 4.0, modified." (**Changed from the board:** the footer boards show only the car's credit; the helmet came later) · "Hermes Motors is a fictional team, made as a portfolio project. Not affiliated with Formula 1, the FIA, Porsche or Hermès." · "Privacy · Credits · Made by Oscar ↗"

## Landing — Before Dawn

- Outline behind the car: "06:00" · chip under the car: "THE HM‑27 WAKES AT 06:00"
- Eyebrow: "BEFORE DAWN · DAY ONE" · H1: "A MESSAGE / IS ON ITS / WAY."
- Body: "At 06:00 the HM‑27 meets first light, streamed live from the Proving Ground. Until then, it waits in the dark."
- CTAs: "Be here at 06:00" (downloads the calendar file) · "Read the manifesto"
- Panel: "NIGHT MODE" · "UNTIL FIRST LIGHT" · timer `HH:MM:SS` · "06:00 at the Proving Ground · streamed live" · "SEALED UNTIL 06:00" rows: 0–100 KM/H, TOP SPEED, SYSTEM POWER, MIN. MASS, ELECTRIC · MGU-K · footer: "One feather tonight. The rest at first light."
- Calendar file **new**: title "Hermes Motors · First Light", description "The HM‑27 is revealed at 06:00 at the Proving Ground. Speed is the message.", URL the site.

## Landing — First Light

- Outline: "HM-27" · hotspots: "ACTIVE AERO", "HALO", "750 kW POWER UNIT"
- Chip: "LIVE FROM THE PROVING GROUND" · H1: "SPEED IS / THE / MESSAGE."
- Body: "Our first Grand Prix car. 1,006 horsepower, half of it electric. Built for the 2027 grid."
- CTAs: "Beat the messenger" · "Explore the car"
- Dashboard: ignite aria-label "Start engine and replay the ignition sequence" · dials: 0–100 KM/H (2.6 SEC), TOP SPEED (352 KM/H), SYSTEM POWER (1,006 HP · 750 KW · 50/50), MIN. MASS (768 KG), ELECTRIC · MGU-K (350 KW) · unit toggle "HP" / "kW"
- **Changed from the board:** drop "DRAG TO ROTATE · 360°" (the hero is a still; see ARCHITECTURE §5).

## Specs — five chapters

| # | Label | Headline | Body | Figures |
| --- | --- | --- | --- | --- |
| 01 | THE CAR | EVERY PART / CARRIES THE / MESSAGE. | Shorter, narrower and lighter than the cars before it, built to the 2026 rules. Keep scrolling and it comes apart. | 768 KG MINIMUM MASS · 3,400 MM WHEELBASE |
| 02 | ACTIVE AERO | AIR THAT / CHANGES / SHAPE. | Both wings move. Straight mode opens them to cut drag; corner mode closes them for grip. No DRS, and no waiting for a gap. | 2 MODES STRAIGHT AND CORNER · 5 ELEMENTS 2 FRONT, 3 REAR |
| 03 | HALO | A RING OF / GRADE 5 / TITANIUM. | It sits over the driver's head and has to hold 125 kN, about 12 tonnes, pressed from above or from the side. | 125 kN TESTED LOAD, ABOVE AND SIDE · 5 S HELD FROM ABOVE |
| 04 | FLOOR & WHEELS | WHERE IT / MEETS THE / TRACK. | A flat floor replaces the venturi tunnels of the last generation. The tyres are narrower, 25 mm at the front and 30 mm at the rear, still on 18-inch rims. | 18 IN RIMS · 30 MM NARROWER REAR TYRES |
| 05 | POWER | 1,006 HP. / HALF OF IT / ELECTRIC. | A 1.6-litre V6 turbo makes 400 kW and the electric motor 350 kW, on 100% sustainable fuel. Every lap it recovers 8.5 MJ to spend again. | SYSTEM POWER 750 kW · V6 TURBO · 400 kW · ELECTRIC · 350 kW · 8.5 MJ RECOVERED PER LAP · 100% SUSTAINABLE FUEL |

Callouts (desktop / phone): "3,400 MM WHEELBASE" / "3,400 MM" · "FRONT WING · 2 MOVING ELEMENTS" / "FRONT WING · 2" · "REAR WING · 3 MOVING ELEMENTS" / "REAR WING · 3" · "HALO · GRADE 5 TITANIUM" / "HALO" · "18-INCH RIMS" · "FLAT FLOOR" · "750 kW · V6 + ELECTRIC" / "750 kW". Chapter 5 CTA: "Take it for a test drive". Rail: "01 THE CAR" … "05 POWER"; play button "Play the scroll" / "Pause" (phone aria: "Play all chapters"). Car alt text per chapter: see `docs/design/03-specs.md`.

## Test drive

- Rotate screen (phone portrait): "TEST DRIVE · PROVING GROUND" · "BEAT THE / MESSENGER." · "One flying lap against the test driver's ghost. His time is 1:11.906." · "TURN YOUR PHONE TO DRIVE" · steps: "Five red lights. Go when they go out." / "Get within one second of the messenger and Overtake unlocks." / "Finish the lap, then share your card." · status "Waiting for landscape" · footnote **Changed from the board**: "Your time lives on the card." (no game audio is planned; never a word about sign-up or databases, Oscar 2026-11-13).
- HUD: "BEAT THE MESSENGER" · "MESSENGER 1:11.906" · "YOUR BEST" · "Δ MESSENGER" · "PROVING GROUND" · map labels "YOU", "THE MESSENGER" · "WITHIN 1 S · OVERTAKE READY" · bars THR, BRK, ERS · OVERTAKE, BOOST · mode "STRAIGHT" / "CORNER" · lights captions "WAIT FOR LIGHTS OUT" / "LIGHTS OUT AND AWAY" · progress "ON THE GRID" / "42% · CHASING" / "LEADING".
- Key bar: "W R SHIFT Throttle · S R CTRL Brake · A D Steer · SPACE Overtake · E Boost" (**changed from the board** by Oscar, 2026-11-12/13: right-hand pedals, E for Boost) · phone: "BRAKE", "THROTTLE", "OT", "BST" · **Changed from the board:** "STEER · BUTTONS · TILT IN SETTINGS" → "STEER WITH THE BUTTONS" (tilt is a stretch goal).
- Pause **new**: "Paused" · "Resume" · "Restart" · "Exit".
- Finish, won: "LAP COMPLETE" · "YOU BEAT THE / MESSENGER." · gap "−0.214 S" · "YOU 1:11.692 · MESSENGER 1:11.906". Lost: "THE MESSENGER / HOLDS ON." · "+0.152 S". Table headers: Driver, S1, S2, S3, LAP, GAP · rows YOU, MESSENGER. Buttons won: "Share your card", "Run it back"; lost: "Run it back", "Share". Note **changed** (Oscar, 2026-11-13: users never hear about sign-up or databases): "Your time lives on the card."
- Card text: won "I BEAT THE / MESSENGER BY / 0.214 S"; lost "I CHASED THE / MESSENGER TO / 0.152 S" · "YOU 1:11.692 · MESSENGER 1:11.906" · "PROVING GROUND · BEAT THE MESSENGER" · credit line in small type.
- Locked (before Day One, not previewing) **new**: "The test drive opens at 06:00 on Day One." + countdown. Preview banner **new**: "Preview · the test drive opens at 06:00 on Day One".
- No WebGL **new**: "Your browser can't run the test drive. Here's the messenger's lap instead: 1:11.906."

## Pages

- **Drivers:** "DRIVERS · SEASON 2027" · day "TWO SEATS. / TWO NAMES. / ONE MESSAGE." · night "TWO SEATS. / NO NAMES / BEFORE 06:00." · intro day "Two rookies for a rookie team, and a test driver nobody has named. You can race him right now." · night "The drivers are revealed at first light, with the car. Until then, their helmets wait in the dark." · cards: see `content/drivers.ts` (placeholders, D4) · night card body "Two seats, two names. They are revealed at first light, with the car." · messenger: "TEST DRIVER · NAME WITHHELD" · "THE MESSENGER" · day "He set the lap at the Proving Ground before the car was revealed, and he hasn't said a word since. His lap is the ghost in the test drive." · night "He has already driven the HM‑27 in the dark. At 06:00 his lap becomes the ghost you race." · "1:11.906 THE LAP TO BEAT · PROVING GROUND". · helmet alt **new** (names from `content/drivers.ts`): "Lena Brandt's helmet: white with black trim, number 9 on the chin, three red feathers along the side" · "Mateo Ríos's helmet: graphite with white trim, number 19 on the chin, three red feathers along the side" · night "A helmet in the dark, its livery hidden until 06:00" · messenger "The messenger's helmet: see-through, its edges and the three feathers glowing red".
- **News:** "NEWS · 7 STORIES" (count from data) · "NEWS FROM / THE PROVING / GROUND." · "Every message we have sent, newest first. Short, factual, on time." · filters All, Car, Test drive, Team · items in `content/news/` (titles and deks on board 26) · "Read the story".
- **Team:** "TEAM · HERMES MOTORS" · "BUILT FOR / A FIRST / DAY." · "A new Grand Prix team with one car, two rookies and no history to hide behind. We started from a blank sheet and the 2026 rules, and we let the lap times talk." · traits PRECISE / QUIETLY AUDACIOUS / SWIFT (board 27) · "OUR TRACK" · "THE PROVING / GROUND" · "Where the HM‑27 first turned a wheel, and where the messenger set his lap. Open to everyone from 06:00 on Day One, one lap at a time." · "Take it for a lap".
- **Season 2027:** "SEASON 2027 · OUR DEBUT" · "24 ROUNDS. / ONE FIRST / SEASON." · "Bahrain in March to Abu Dhabi in December, with ten Sprint weekends on the way. Day One is 28 days before the first race." · stats 24 RACES, 10 SPRINTS, 10 MONTHS · tags "SPRINT", "OPENER · D+28", "FINALE" · note "Dates as Formula 1 published them in September 2026. Bahrain and Abu Dhabi weekends open and close the season; the race calendar can still change."
- **Partners:** "PARTNERS · FOUNDING SEATS" · "THE PEOPLE / BEHIND THE / MESSAGE." · "Our founding partners are announced on Day One, with the car. Their names are sealed until then." · slots "TITLE PARTNER · SEALED", "SEALED UNTIL DAY ONE" · "MOVE AT THIS SPEED?" · "Eight seats on the car and in the garage. Tell us what you build and why it belongs on the HM‑27; we answer every message within a day." · "Partner with us".
- **Store:** "STORE · TEAM KIT" · "THE STORE / OPENS ON / DAY ONE." · "Team kit and a 1:18 HM‑27, released at 06:00 with the car. Three pieces to start; more as the season runs." · products: "HM-27 · 1:18" "Die-cast, First Light livery, 31 cm long." · "TEAM CAP" "Carbon, with the winged H embroidered in white and Redline." · "MESSENGER TEE" "Gallery White, the line from the brand printed on the back." · tag "OPENS 06:00 · DAY ONE" (after Day One **new**: "LOOKBOOK · NOT FOR SALE").
- **Manifesto:** text on board 28, verbatim from the brand book: "WE HAVE NO / TROPHIES." · "No archive. No legends in the lobby." · "WE HAVE A FIRST DAY, / AND WE INTEND TO USE ALL OF IT." · myth line · beats 06:00 / 12:00 / D+28 · "WE BUILD THE WAY HE MOVED:" PRECISELY, / QUIETLY, / QUICKLY. with their lines · "WE WON'T TELL YOU / WHAT WE ARE." · "WE'LL SHOW YOU, / ONE LAP AT A TIME." · "SPEED IS / THE / MESSAGE." · CTA night "Be here at 06:00", day "Beat the messenger".
- **Press kit:** board 30, verbatim (boilerplate in full there).
- **404 new:** "OFF THE / RACING / LINE." · "This page isn't on the Proving Ground." · "Back to the start".
