# Belichtungs-Simulator – Foto und Video

Interaktiver Simulator zur Belichtung für den Moodle-Kurs zur Kamerascheinprüfung
(HS Ansbach). Regler, ein simuliertes Bild, sofortige Rückmeldung: Wer eine
Stellschraube verändert, sieht, was mit Belichtung, Schärfentiefe,
Bewegungsunschärfe und Rauschen passiert.

Die App hat **zwei Modi**, und der Unterschied zwischen ihnen ist der eigentliche
Lerninhalt:

| Modus | Stellschrauben | Aufgabe |
|---|---|---|
| **Fotokamera** – das Belichtungs*dreieck* | Blende, Belichtungszeit, ISO | korrekt belichten, Bewegung einfrieren, Hintergrund unscharf |
| **Videokamera** – das Belichtungs*fünfeck* | Licht, ND-Filter, Blende, **Zeit gesperrt auf 1/50 s**, ISO | korrekt belichten und Hintergrund unscharf – ohne die Zeit anzufassen |

Dazu zwei Lichtsituationen: **draußen bei Sonne** (hell, nicht regelbar – hier hilft
nur der ND-Filter) und **Studiolicht** (in Blendenstufen regelbar, „halb so hell =
eine Blendenstufe weniger").

Verortung: **Modul 3 – Kamera konfigurieren**, Abschnitt 3b „Richtig belichten".

## Aufbau

Eine einzige statische `index.html` – kein Build, keine Dependencies, kein Backend.
Alles inline: SVG-Szene, Simulationslogik, Styles.

```
index.html          die App
scorm/              imsmanifest.xml für die SCORM-Variante (siehe unten)
```

## Lokal ansehen

```bash
python3 -m http.server 8000
```

Im Projekt-Repo der Masterarbeit gibt es dafür die Startkonfiguration
`belichtungsdreieck` in `.claude/launch.json`.

## Deploy auf Vercel

Repo in Vercel importieren, Framework-Preset **„Other"**, Build Command leer lassen,
Output Directory auf den Repo-Root. Keine Env-Variablen. Es ist eine statische Datei.
Push auf `master` löst den Deploy aus.

## Einbau in Moodle

Im Projekt ist **SCORM als Erstwahl dokumentiert** (`SecondBrain Thesis/06_Prototyp_Moodle/Gestaltungsmöglichkeiten Moodle.md`, Abschnitt 3.3). Die iframe-Variante ist vorbereitet, hebt die Entscheidung aber nicht auf – sie ist der einfachere Update-Weg, kostet dafür den automatischen Aktivitätsabschluss.

### Variante A – Link/URL-Aktivität (im Kurs umgesetzt)

Wie bei der Objektivwechsel-App: Link/URL-Aktivität, Anzeige „Neues Fenster".
Die Instanz erlaubt keine fremden iframes ohne Whitelist-Eintrag – deshalb ist der
Link der zuverlässige Weg.

### Variante B – SCORM-Paket

`index.html` + `scorm/imsmanifest.xml` (Manifest ins Zip-Root) als ZIP packen und als
SCORM-Lernpaket hochladen. Dann meldet die App Score und `lesson_status` per
SCORM 1.2 an Moodle – Aktivitätsabschluss ohne Zusatzcode.

Beide Wege laufen aus derselben `index.html`: Findet sie eine SCORM-API, meldet sie
darüber; findet sie keine, schickt sie
`postMessage({type:'belichtung:progress', score, status})` ans Parent-Fenster.
**Score:** 50 pro gelöstem Modus, 100 wenn beide gelöst sind.

## Simulationsmodell

Gerechnet wird in Blendenstufen (EV), nicht in Messwerten:

```
Fehler = (EV_Szene − ND) − ( log2(N² · t⁻¹) − log2(ISO/100) )
```

`EV_Szene` ist 15 bei Sonne und 6–13 im Studio (Vorgabe 9). Ein Fehler von 0 ist
korrekt belichtet, Toleranz ±0,5 Blenden. Schärfentiefe folgt aus der Blendenzahl,
Rauschen aus dem ISO-Wert.

**Reglerbereiche** (bewusst eng gehalten, damit jeder Schritt eine Entscheidung ist):
Blende f/2.8–f/16, Belichtungszeit 1/15–1/1000 s, ISO 100–1600, ND 0–6 Blenden.
Vor jeder Änderung dieser Bereiche die Lösbarkeit nachrechnen. Stand: Foto/Studio 9,
Foto/draußen **1**, Video/Studio 12, Video/draußen 6 Lösungen bei Vorgabehelligkeit.
Der Engpass draußen im Fotomodus ist die Belichtung, nicht die Bewegung: Bei EV 15 und
einer Blende, die für den unscharfen Hintergrund gebunden ist, balanciert nur
f/5.6 · 1/1000 s · ISO 100. Fachlich stimmt das (pralle Sonne lässt wenig Spielraum),
verträgt aber keine weitere Einengung. Bewusst ein didaktisches Modell: Es zeigt *Richtung* und
*Zielkonflikt*, keine fotometrisch exakten Werte.

**Die Szene** ist eine Halbnahe (Kopf und Schultern, unten angeschnitten) mit einem
Lichtpool hinter der Person und einer leichten Vignette. Beides ist kein Zierrat: Ohne
Trennung vom Hintergrund liest sich der Unterschied zwischen offener und geschlossener
Blende nicht. Im Videomodus trägt die Person nur noch einen Hauch Unschärfe (0,7 statt
2,4) – bei 1/50 s sitzt eine Interviewpartnerin praktisch still, und eine dauerhaft
weiche Person kann sich nie vom Hintergrund abheben.

**Bewegungsunschärfe** wird im Fotomodus aus der Belichtungszeit abgeleitet
(Referenz **1/125 s = eingefroren**; in der Praxis stehen Portraits je nach Bewegung
schon ab 1/60–1/125 s. Die früher bei 1/250 s gezeichnete Unschärfe liegt jetzt bei
1/60 s – das schafft mehrere gültige Lösungen statt einer einzigen) und im Videomodus als konstanter, erwünschter Wert
gezeichnet – bei 1/50 s ist Bewegungsunschärfe kein Fehler, sondern das Ziel.

> **Regel im Code:** Die Marke unter dem Bild leitet sich aus demselben Wert ab, der
> die Unschärfe zeichnet (`motOK = motB < 0.5`). Damit kann die Rückmeldung nicht mehr
> „eingefroren" sagen, während das Bild sichtbar verwischt ist – genau dieser Fehler
> trat vorher bei 1/250 s auf.

## Fachlicher Hintergrund: warum zwei Modi

Der Abgleich mit `Old Moodle Kurs/8_Richtig Belichten/Belichtungsdreieck.html`
hatte 2026-07-16 zwei Konflikte ergeben:

1. **Der Kurs lehrt kein Dreieck, sondern ein Fünfeck.** Die Quellseite nennt fünf
   Wege zu weniger Belichtung – Licht im Set, ND-Filter, Blende, Belichtungszeit,
   ISO – und sagt ausdrücklich, dass Punkt 1 und 2 „beim klassischen
   Belichtungsdreieck der Fotografie nicht berücksichtigt" werden. Auch das
   Kursvideo heißt `11_belichtungsdrei-vier-fünfeck.mp4`.
2. **Die alte Aufgabe trainierte gegen die Kursregel.** Die Quelle: „für ein
   cinematische Seherfahrung wollen wir die Belichtungszeit unbedingt 1/50s behalten
   bei 25fps". Die Aufgabe verlangte „friere die Bewegung ein" – wer löste, tat
   genau das, was der Kurs verbietet (180°-Regel).

**Beides ist mit den zwei Modi aufgelöst**, statt einen der beiden Konflikte
wegzudefinieren: Der Fotomodus bleibt das Dreieck und ist als Fotografie
gekennzeichnet; der Videomodus sperrt die Zeit auf 1/50 s, nennt die 25 Bilder und
ergänzt Licht und ND-Filter zum Fünfeck. Der Wechsel zwischen beiden *ist* die
Lernerfahrung – der Unterschied wird erlebbar statt behauptet.

## Gestaltung

Die App nutzt die Design-Tokens der Moodle-Kursseiten und der Objektivwechsel-App
(Cream `#f6f4f0`, Ink `#1e2530`, Akzent `#c1651f`, Serif für Zitate). Der frühere
dunkle Eigenstil ist damit aufgelöst; dunkel bleibt nur die Bildfläche selbst, weil
sie einen Monitor darstellt.

Geprüft auf Desktop (1280), iPad (768) und Mobil (375): einspaltig ab unter 900 px,
kein horizontaler Überlauf, alle Bedienelemente mindestens 44 px hoch.

Die Kopfleiste hat drei Segmente – **Intro · Foto · Video**; das Intro ist damit
jederzeit erreichbar, ohne dass eine Fußzeile nötig wäre.

## Offene Punkte

- Kein Narrativ-Anschluss an Mara / Episode 3 (Seeufer, Amt, Labor) – die App steht
  fachlich für sich.
- Die Toleranz der Belichtungsaufgabe (±0,5 Blenden) ist gesetzt, nicht aus dem
  Kursmaterial abgeleitet.
- Die Studio-Lichtstufen sind relativ angegeben („+1 Blende"), nicht in Lux oder Watt –
  bewusst, weil der Kurs die Beziehung „doppelt so hell = eine Blende" lehrt und keine
  absoluten Werte.
