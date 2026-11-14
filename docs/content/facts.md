# Facts

Every number the site shows about the car, the rules, the game or the season comes from this file. `content/facts.ts` mirrors it; a unit test checks the copy against it. As of 7 November 2026.

## A. From the 2026 technical rules (sourced)

| Fact | Value on the site | Source |
| --- | --- | --- |
| Engine | 1.6-litre V6 turbo, the architecture introduced in 2014 | [Honda][honda] |
| Split | combustion engine about 400 kW, electric motor (MGU-K) up to 350 kW, "almost equally" | [Honda][honda] |
| Power unit output | 750 kW · 1,006 hp — the sum of the two, converted at 1 kW = 1.341 hp (Honda gives no combined figure) | [Honda][honda], [Motorsport Magazine][msm] |
| MGU-H | removed | [Honda][honda] |
| Energy recovered per lap | 8.5 MJ | [Honda][honda] |
| Fuel | 100% sustainable | [Honda][honda] |
| Minimum mass | 768 kg (down from 800 kg) | [Motorsport Magazine][msm] |
| Wheelbase | 3,400 mm maximum | [Motorsport Magazine][msm] |
| Width | 1,900 mm | [Motorsport Magazine][msm] |
| Tyres | 25 mm narrower at the front, 30 mm at the rear; 18-inch rims | [Motorsport Magazine][msm] |
| Active aero | Straight mode (low drag) and Corner mode (grip); front wing 2 moving elements, rear wing 3 | [The Race][race], [Motorsport Magazine][msm] |
| Overtake mode | within 1 s of the car ahead: an extra 0.5 MJ of electrical energy | [The Race][race] |
| Boost | driver-activated energy deployment | [The Race][race] |
| Floor | flat floor replaces the venturi tunnels | [Motorsport Magazine][msm] |
| Halo | grade 5 titanium; must hold 125 kN (about 12 tonnes) from above for 5 s, and 125 kN from the side | [FIA][fia] |

Wording on the site: "1,006 HP. HALF OF IT ELECTRIC." · "A 1.6-litre V6 turbo makes 400 kW and the electric motor 350 kW, on 100% sustainable fuel. Every lap it recovers 8.5 MJ to spend again."

## B. The HM-27's own figures (fictional, set by the brand)

Shown on the First Light dashboard. They are plausible for the class but belong to a car that doesn't exist; never present them as rules.

| Fact | Value |
| --- | --- |
| 0–100 km/h | 2.6 s |
| Top speed | 352 km/h |
| Model wheelbase | exactly 3,400 mm (the 3D model is scaled to it) |
| Overall size of the model | 5.54 × 1.88 × 1.15 m; wheel radius 0.332 m |
| Scale model (the Store) | 1:18 die-cast, 31 cm long (5.54 m ÷ 18 = 30.8 cm) |

## C. The test drive

| Fact | Value |
| --- | --- |
| The messenger's lap | 1:11.906 |
| His sectors | S1 19.420 · S2 26.411 · S3 26.075 |
| Proving Ground lap length | 3,119 m (derived from the map and his speeds; computed in code) |
| Example winning lap (design) | 1:11.692 (−0.214): S1 19.842 (+0.422), S2 26.323 (−0.088), S3 25.527 (−0.548) |
| Example losing lap (design) | 1:12.058 (+0.152): S1 +0.281, S2 −0.100, S3 −0.029 |

## D. Season 2027

24 rounds, 10 Sprint weekends, Bahrain 12–14 March to Abu Dhabi 10–12 December. Full list with dates in `content/season.ts`, as published in September 2026 ([McLaren][mcl], [Formula 1][f1cal]). Round order for 16 and 17 follows the dates: Azerbaijan 24–26 Sep, then Türkiye 1–3 Oct (subject to FIA circuit homologation). Some Middle East rounds were reported as uncertain; update the data if the calendar changes.

| R | Dates | Grand Prix | Venue | Sprint |
| --- | --- | --- | --- | --- |
| 1 | 12–14 Mar | Bahrain | Sakhir | yes |
| 2 | 19–21 Mar | Saudi Arabia | Jeddah | |
| 3 | 2–4 Apr | Australia | Melbourne | yes |
| 4 | 9–11 Apr | Japan | Suzuka | yes |
| 5 | 16–18 Apr | China | Shanghai | |
| 6 | 30 Apr–2 May | Miami | Miami | |
| 7 | 21–23 May | Canada | Montréal | yes |
| 8 | 4–6 Jun | Monaco | Monte Carlo | yes |
| 9 | 18–20 Jun | Portugal | Portimão | |
| 10 | 2–4 Jul | Great Britain | Silverstone | yes |
| 11 | 9–11 Jul | Austria | Spielberg | |
| 12 | 23–25 Jul | Belgium | Spa-Francorchamps | |
| 13 | 30 Jul–1 Aug | Hungary | Budapest | |
| 14 | 3–5 Sep | Italy | Monza | yes |
| 15 | 10–12 Sep | Spain | Madrid | |
| 16 | 24–26 Sep | Azerbaijan | Baku | |
| 17 | 1–3 Oct | Türkiye | Istanbul | |
| 18 | 8–10 Oct | Singapore | Marina Bay | |
| 19 | 22–24 Oct | United States | Austin | |
| 20 | 29–31 Oct | Mexico | Mexico City | |
| 21 | 5–7 Nov | Brazil | São Paulo | yes |
| 22 | 18–20 Nov | Las Vegas | Las Vegas | |
| 23 | 3–5 Dec | Qatar | Lusail | yes |
| 24 | 10–12 Dec | Abu Dhabi | Yas Marina | yes |

## E. The model

"2026 F1 CAR" by Abu Saif, CC BY 4.0: 714,306 triangles, 42 meshes, 11 materials, 20.9 MB. HM-27 landing version 279,590 triangles, 1.17 MB; game version 49,521 triangles, 281 KB. See `docs/legal/credits.md`.

[honda]: https://global.honda/en/F1/features/2026_Commentary/regulations/
[msm]: https://www.motorsportmagazine.com/special-article/f1-26-new-season-guide/6/inside-f1s-2026-tech-revolution-active-aero-50-50-hybrid-power-and-lighter-cars
[race]: https://www.the-race.com/formula-1/boost-overtake-mode-active-aero-recharge-key-2026-terms-explained
[fia]: https://www.fia.com/news/how-make-f1-halo
[mcl]: https://www.mclaren.com/racing/formula-1/2026/2027-calendar-announced/
[f1cal]: https://www.formula1.com/en/latest/article/everything-you-need-to-know-about-the-2027-f1-calendar.B8HW7bYE1DhRm4Ib1nlqT
