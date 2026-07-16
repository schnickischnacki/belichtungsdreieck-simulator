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

### Variante A – iframe auf die Vercel-URL (empfohlen)

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

### Variante B – SCORM-Paket

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

## Offene Punkte

- **Gestaltung weicht ab:** Der Simulator ist dunkel (`#0f1115`) und nutzt nicht die
  Farbwelt der übrigen Moodle-Inline-Seiten (Cream `#f6f4f0` / Akzentorange `#c1651f`).
  Für einen Sucher-/Monitorkontext ist Dunkel verteidigbar, als Kursbaustein bricht es aber
  den visuellen Faden. Vor dem Livegang entscheiden: angleichen oder bewusst absetzen.
- Kein Narrativ-Anschluss an Peter Z. / Episode 3 (Seeufer, Amt, Labor) – der Simulator
  steht fachlich für sich.
- Die Zielwerte der Aufgabe (Belichtung ±0,5 EV, Bewegung, Schärfentiefe) sind gesetzt,
  nicht aus dem Kursmaterial abgeleitet.
