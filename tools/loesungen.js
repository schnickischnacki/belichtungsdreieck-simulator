#!/usr/bin/env node
/* Zählt die gültigen Einstellungen je Auftrag und prüft die Startzustände.
   Vor jeder Änderung an Reglerbereichen, Schwellen oder Szenenhelligkeit laufen lassen:
     node tools/loesungen.js                                                          */
"use strict";
var BM = require("../js/model.js");

var fehler = 0;
function pruefe(bed, text) { if (!bed) { fehler++; console.log("  FEHLER: " + text); } }

/* Die Schwelle für den unscharfen Hintergrund muss genau auf f/5.6 fallen,
   sonst stimmen Hinweistexte und Rechnung nicht mehr überein. */
pruefe(BM.dofWert(BM.AP_WEICH) >= BM.DOF_OK, "f/5.6 muss als unscharf gelten");
pruefe(BM.dofWert(BM.AP_WEICH + 1) < BM.DOF_OK, "f/6.3 darf nicht mehr als unscharf gelten");
pruefe(BM.SH[BM.SH_VIDEO] === 50, "Videozeit muss 1/50 s sein");
pruefe(BM.SH[BM.SH_FRIERT] === 125, "Einfrierschwelle muss 1/125 s sein");

console.log("Auftrag            Lösungen   davon MM 0.0   Start (MM)   Start gelöst?");
BM.AUFTRAEGE.forEach(function (a) {
  var l = BM.alleLoesungen(a);
  var exakt = l.filter(function (s) { return BM.rechne(a, s).fehler3 === 0; }).length;
  var r0 = BM.rechne(a, a.start);
  console.log(
    (a.nr + " " + a.id).padEnd(19) +
    String(l.length).padStart(8) + String(exakt).padStart(15) +
    (Math.abs(r0.fehler3) > 6 ? (r0.fehler3 > 0 ? "+" : "−") + BM.stufenText(r0.fehler3).replace(/ Blenden?/, "") + " (blinkt)" : "MM " + BM.mmText(r0.fehler3)).padStart(13) +
    (r0.geloest ? "   ja" : "   nein")
  );
  pruefe(l.length >= 5, a.id + ": zu wenige Lösungen");
  pruefe(!r0.geloest, a.id + ": Startzustand ist schon gelöst");
});

/* Kamera-Kombinationen ohne ND und Licht – so viele Blende/ISO-Paare führen im
   Video überhaupt zum Ziel. */
BM.AUFTRAEGE.filter(function (a) { return a.kamera === "video"; }).forEach(function (a) {
  var paare = {};
  BM.alleLoesungen(a).forEach(function (s) { paare[s.ap + "/" + s.is] = 1; });
  console.log("  " + a.id + ": " + Object.keys(paare).length + " verschiedene Blende/ISO-Paare");
});

console.log(fehler ? "\n" + fehler + " Fehler" : "\nalles in Ordnung");
process.exit(fehler ? 1 : 0);
