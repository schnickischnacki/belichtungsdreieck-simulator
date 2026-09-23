# Belichtung üben

Belichtungs-Simulator für den Moodle-Kurs zur Kamerascheinprüfung (HS Ansbach, Modul 3,
Abschnitt 3b). Live: https://belichtungsdreieck-simulator.vercel.app – Push auf `master`
löst den Deploy aus, der Kurs verlinkt diese Adresse.

**Seit 23.09.2026 läuft hier v2.** Die erste Fassung (eine `index.html`, Schalter
Foto/Video und Lichtsituation) steht im Tag `v1-zwei-modi`:
`git checkout v1-zwei-modi -- index.html` holt sie zurück.

## Was sich gegenüber v1 ändert

| Wunsch (23.09.2026) | Umsetzung |
|---|---|
| **Schönerer Hintergrund**, weiter im Cartoon-Stil | Zwei neue Szenen: *Studio* (Interview-Set mit Fenster, Stehlampe, Lichterkette, Regal, Monstera) und *See* (Himmel, Sonne, Wolken, Hügel, Segelboot, Steg, Baum, Schilf). Jede Szene besteht aus **Tiefenebenen** (fern · Bokeh · mitte · Person · vorn), die je nach Blende unterschiedlich stark unscharf werden. Lichter (Lichterkette, Lampe, Glitzern auf dem See) werden bei offener Blende zu **Bokeh-Scheiben**. |
| **Übersichtlichere Navigation** statt zwei unabhängiger Schalter (Foto/Video × drinnen/draußen) | **Vier Aufträge** in einer Leiste, gruppiert nach Kamera: *Foto · Dreieck* (1 Studio, 2 See) und *Video · Fünfeck* (3 Studio, 4 See). Ein Klick wählt Kamera und Ort zusammen; jeder Auftrag merkt sich seine Einstellungen. Nach dem Lösen führt „Weiter“ zum nächsten offenen Auftrag. |
| **Mehr Spielraum** für richtige Lösungen bei realistischen Werten | Alle Regler rasten in **Drittelstufen** wie das Einstellrad einer Kamera (f/2.8–f/16, 1/30–1/4000 s, ISO 100–3200). „Foto draußen“ hat jetzt **84 statt 1** gültige Einstellung. Nach dem Lösen sammelt die App die gefundenen Lösungen und schlägt einen **anderen Weg** vor („Öffne die Blende um eine ganze Stufe – womit gleichst du aus?“). |
| **Erklärungen an den Reglern** | Jeder Regler hat einen **i-Knopf**, der eine Wissenskarte aufklappt: kleine Grafik, die live auf den eingestellten Wert reagiert, dazu *Licht*, *Nebenwirkung* und ein Satz zur aktuellen Einstellung. |

Weitere Änderungen:

- **Kameradisplay im Bild:** Zeit, Blende (Sony-Schreibweise `F4.0`), ISO und die **MM-Anzeige**
  (−2.0 … +2.0 in Drittelschritten, blinkt darüber hinaus) – so, wie es die Kursseite
  „Manuell richtig belichten mit MANUAL METERING (FX30)“ beschreibt. Im Video
  `STBY`, sobald alles stimmt `● REC` mit laufendem Timecode. Oben rechts drei Zeichen für
  die Ziele: Sonne (Belichtung), Irisblende (Hintergrund unscharf), Hand bzw. Schloss (Bewegung
  bzw. feste Zeit) – grün, sobald erreicht.
- **Foto = Standbild, Video = bewegtes Bild:** Im Foto steht die Person still und winkt;
  die Hand verwischt mit Nachziehern, solange die Zeit zu lang ist. Im Video spricht sie,
  blinzelt und gestikuliert, mit Ansteckmikrofon.
- **Fotoaufträge sind das reine Dreieck:** Das Licht ist im Foto fest (Studio fest
  eingerichtet, draußen Sonne). Licht im Set und ND-Filter gibt es nur im Video – das
  schärft den Unterschied Dreieck/Fünfeck und spart Bedienelemente.
- **Das Bild bleibt stehen**, während man durch die Regler scrollt (Handy und Laptop).
- **Helligkeitsverlauf auf jeder Reglerspur:** Die helle Seite ist die, auf der mehr Licht ankommt.
- Überbelichtung **frisst Lichter aus** statt einen weißen Schleier zu legen; Rauschen ist
  ein Korn, das im Video lebt.

## Aufbau

Statisch, kein Build, keine Abhängigkeiten.

```
index.html        Gerüst
css/app.css       Gestaltung (Design-Tokens wie Kursseiten und Objektivwechsel-App)
js/model.js       Rechenmodell – läuft im Browser und in Node
js/scene.js       Szenen und Person als SVG
js/app.js         Bedienung, Rückmeldung, Wissenskarten, SCORM/postMessage
tools/loesungen.js Lösungszählung und Selbstprüfung des Modells
scorm/            imsmanifest.xml für die SCORM-Variante
```

## Lokal ansehen

```bash
python3 -m http.server 8123
```

Im Projekt der Masterarbeit gibt es dafür die Startkonfiguration `belichtungsdreieck` in
`.claude/launch.json` (Port 8123). Über `file://` läuft die App ebenfalls (keine Module).

## Rechenmodell

In Drittelblenden, ganzzahlig – dadurch keine Rundungsfehler zwischen Nominalwerten
(1/125 s ist rechnerisch 1/128 s):

```
Fehler(1/3) = 3 · (EV_Szene + Licht − ND) − ((9 + i_Blende) + (15 + j_Zeit) − k_ISO)
```

`EV_Szene` bei ISO 100: Studio 9, See 15. Licht im Set −3 … +3 Blenden (nur Video, nur
Studio), ND 0 … 6 Blenden (0,3 … 1,8). Positiv = zu hell. Die MM-Anzeige ist genau
dieser Fehler.

**Ziele:**

| Ziel | Bedingung | Bemerkung |
|---|---|---|
| richtig belichtet | \|MM\| ≤ 0.3 | ein Klick daneben zählt noch; ideal ist 0.0 |
| Hintergrund unscharf | f/5.6 oder offener | aus derselben Unschärfekurve wie v1 (`dof ≥ 4`) |
| Hand eingefroren (Foto) | 1/125 s oder kürzer | Schwelle aus v1 übernommen |
| Zeit (Video) | fest 1/50 s | 25p, halbe Bilddauer |

Jede Marke leitet sich aus demselben Wert ab, der das Bild zeichnet – die Regel aus v1
gilt weiter.

**Lösungszahlen** (`node tools/loesungen.js`, Stand 23.09.2026):

| Auftrag | gültige Einstellungen | davon MM 0.0 | Start |
|---|---:|---:|---|
| 1 Foto · Studio | 210 | 70 | f/11 · 1/60 · ISO 400 → MM −2.0 |
| 2 Foto · See | 84 | 28 | f/8 · 1/250 · ISO 400 → +3 Blenden (blinkt) |
| 3 Video · Studio | 599 | 199 | f/8 · ISO 1600 → MM +1.3 |
| 4 Video · See | 28 | 9 | f/5.6 · ISO 800 → +7 1/3 Blenden (blinkt) |

Zum Vergleich v1: 9 / **1** / 12 / 6. Im Video zählen ND- und Lichtvarianten mit; als
Blende/ISO-Paare sind es 112 (Studio) und 28 (See). **Vor jeder Änderung an Bereichen,
Schwellen oder Szenenhelligkeit das Skript laufen lassen** – es bricht ab, wenn ein
Auftrag schon beim Start gelöst ist oder zu wenige Lösungen hat.

## Einbau in Moodle

Link/URL-Aktivität (cmid `259282` im Arbeitskurs 8273, Modul 3), Anzeige „Neues Fenster“ (fremde iframes brauchen einen
Whitelist-Eintrag). Alternativ SCORM: `index.html`, `css/`, `js/` und
`scorm/imsmanifest.xml` (ins Zip-Root) packen. Die App meldet über SCORM 1.2 oder
`postMessage({type:'belichtung:progress', score, status})`: **25 Punkte je Auftrag**,
`completed` nach allen vier.

## Offen – fachlich vor dem Einsatz prüfen

- **Toleranz ±0.3** ist gesetzt, nicht aus dem Kursmaterial abgeleitet (Kurs: „Ziel ist im
  Allgemeinen MM 0.0“).
- **Einfrier-Schwelle 1/125 s** für die winkende Hand stammt aus der Durchsicht von v1
  (01.09.2026), keine Quelle.
- **Rauschen** ist didaktisch überzeichnet: Ab ISO 1600 sichtbar, damit der Zielkonflikt
  erkennbar wird. Die FX30 ist bei ISO 1600 in der Praxis deutlich sauberer.
- Wissenskarte ISO: „Wenn du das Licht woanders herholen kannst, ist das meist die
  bessere Wahl.“ – Faustregel, keine Quelle.
- Die Szenenhelligkeit (Studio EV 9, Sonne EV 15) ist plausibel gewählt, nicht gemessen.
- Kein Anschluss an die Kursgeschichte; die App steht fachlich für sich.
- Erprobung mit Studierenden steht aus.
