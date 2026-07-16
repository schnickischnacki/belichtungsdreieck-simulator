# Belichtungsdreieck-Simulator

Interaktiver Simulator zum Belichtungsdreieck (Blende / Belichtungszeit / ISO) für den
Moodle-Kurs zur Kamerascheinprüfung (HS Ansbach). Drei Regler, ein simuliertes Bild:
Wer eine Achse verändert, sieht sofort, was mit Belichtung, Bewegungsunschärfe,
Schärfentiefe und Rauschen passiert.

**Aufgabe:** Motiv korrekt belichten, Bewegung einfrieren, Hintergrund unscharf halten –
alle drei Ziele gleichzeitig. Genau der Zielkonflikt, um den es beim Belichtungsdreieck geht.

Verortung: **Modul 3 – Kamera konfigurieren** (Lichtwechsel Seeufer / Amt / Labor).

## Aufbau

Eine einzige statische `index.html` – kein Build, keine Dependencies, kein Backend.
Alles inline: SVG-Szene, Simulationslogik, Styles.

```
index.html          das Widget
scorm/              imsmanifest.xml für die SCORM-Variante (siehe unten)
```

## Lokal ansehen

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Deploy auf Vercel

Repo in Vercel importieren, Framework-Preset **„Other"**, Build Command leer lassen,
Output Directory auf den Repo-Root. Keine Env-Variablen. Es ist eine statische Datei.

## Einbau in Moodle

Im Projekt ist **SCORM als Erstwahl dokumentiert** (`SecondBrain Thesis/06_Prototyp_Moodle/Gestaltungsmöglichkeiten Moodle.md`, Abschnitt 3.3 und Auswahllogik). Die iframe-Variante ist zusätzlich vorbereitet, hebt diese Entscheidung aber nicht auf – sie ist der einfachere Update-Weg, kostet dafür den automatischen Aktivitätsabschluss.

### Variante A – iframe auf die Vercel-URL

Text- und Medien-Feld, Editor auf Quellcode umschalten, einfügen und URL ersetzen:

```html
<iframe
  src="https://DEINE-URL.vercel.app"
  title="Simulator: Belichtungsdreieck"
  width="100%"
  height="720"
  style="border:1px solid #e4dfd7;border-radius:14px;"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin"
></iframe>
```

Bei gelöster Aufgabe schickt das Widget
`postMessage({type:'belichtungsdreieck:done', score:100})` ans Parent-Fenster – falls der
Aktivitätsabschluss später daran gehängt werden soll.

### Variante B – SCORM-Paket (dokumentierte Erstwahl)

`index.html` + `scorm/imsmanifest.xml` (Manifest muss dabei ins Zip-Root) als ZIP packen und
als SCORM-Lernpaket hochladen. Dann meldet das Widget Score und `lesson_status` per
SCORM 1.2 an Moodle – Aktivitätsabschluss ohne Zusatzcode. Dafür liegt es nicht unter einer
eigenen URL und ist schwerer zu aktualisieren.

Beide Wege funktionieren aus derselben `index.html`: Findet sie eine SCORM-API, meldet sie
darüber; findet sie keine, nutzt sie `postMessage`.

## Simulationsmodell

`stops = log2((t / N²) · ISO / K)` mit `K = 0.2` – Abweichung von 0 EV ist Fehlbelichtung.
Schärfentiefe wird aus der Blendenzahl, Bewegungsunschärfe aus der Belichtungszeit
(Referenz 1/500 s) und Rauschen aus dem ISO-Wert abgeleitet. Bewusst ein didaktisches
Modell, keine fotometrisch exakte Rechnung: Es soll die *Richtung* und den *Zielkonflikt*
zeigen, nicht Messwerte liefern.

## ⚠ Fachlicher Konflikt mit der Kursquelle – vor dem Einsatz klären

Abgleich mit `Old Moodle Kurs/8_Richtig Belichten/Belichtungsdreieck.html` (16.07.2026):

1. **Der Kurs lehrt kein Dreieck, sondern ein Fünfeck.** Die Quellseite nennt fünf Wege zu
   weniger Belichtung: Licht im Set, ND-Filter, Blende, Belichtungszeit, ISO – und sagt
   ausdrücklich, dass Punkt 1 und 2 „beim klassischen Belichtungsdreieck der Fotografie
   nicht berücksichtigt" werden. Auch das Kursvideo heißt
   `11_belichtungsdrei-vier-fünfeck.mp4`. Dieser Simulator hat nur die drei fotografischen
   Regler – also das Modell, das der Kurs als unvollständig markiert.

2. **Die Aufgabe trainiert gegen die Kursregel.** Die Quelle: „für ein cinematische
   Seherfahrung wollen wir die Belichtungszeit unbedingt 1/50s behalten bei 25fps".
   Die Aufgabe hier verlangt „friere die Bewegung ein" – lösbar erst ab ca. 1/250 s. Wer
   löst, tut genau das, was der Kurs verbietet (180°-Regel).

Optionen: **(A)** Belichtungszeit auf 1/50 s fixieren und stattdessen ND-Filter und Licht
als Regler ergänzen – dann bildet der Simulator den Kursinhalt ab und der Zielkonflikt wird
schärfer; die Rechnung bleibt dieselbe (jede Stufe = 1 Blende). **(B)** Als bewussten
Vorschritt „so geht Fotografie" rahmen und die Erweiterung direkt danach setzen.
Unverändert einbinden ist nicht empfohlen.

## Weitere offene Punkte

- **Gestaltung weicht ab:** Der Simulator ist dunkel (`#0f1115`) und nutzt nicht die
  Farbwelt der übrigen Moodle-Inline-Seiten (Cream `#f6f4f0` / Akzentorange `#c1651f`).
  Für einen Sucher-/Monitorkontext ist Dunkel verteidigbar, als Kursbaustein bricht es aber
  den visuellen Faden. Vor dem Livegang entscheiden: angleichen oder bewusst absetzen.
- Kein Narrativ-Anschluss an Peter Z. / Episode 3 (Seeufer, Amt, Labor) – der Simulator
  steht fachlich für sich.
- Die Toleranz der Belichtungsaufgabe (±0,5 EV) ist gesetzt, nicht aus dem Kursmaterial
  abgeleitet.
