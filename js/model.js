/* Belichtungsmodell – rechnet in Drittelblenden wie das Einstellrad einer Kamera.
   Läuft im Browser (window.BM) und in Node (require), damit tools/loesungen.js
   dieselbe Rechnung prüft, die die App anzeigt. */
(function (root) {
  "use strict";

  /* Nominalwerte in Drittelstufen. Gerechnet wird mit dem Index, nicht mit den
     gerundeten Zahlen – sonst entstehen Rundungsfehler wie 1/125 ≠ 1/128. */
  var AP = [2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14, 16];          // Av = 3 + i/3
  var SH = [30, 40, 50, 60, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000,
            1250, 1600, 2000, 2500, 3200, 4000];                                          // Tv = 5 + j/3
  var IS = [100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200]; // Sv = k/3
  var ND = [0, 1, 2, 3, 4, 5, 6];                                                          // ganze Blenden
  var ND_DICHTE = ["aus", "0,3", "0,6", "0,9", "1,2", "1,5", "1,8"];
  var ND_FAKTOR = ["", "1/2", "1/4", "1/8", "1/16", "1/32", "1/64"];
  var LICHT = [-3, -2, -1, 0, 1, 2, 3];                                                    // Studiolicht, ganze Blenden

  var SH_VIDEO = 2;          // Index von 1/50 s
  var AP_WEICH = 6;          // bis f/5.6 gilt der Hintergrund als unscharf (siehe DOF_OK)
  var SH_FRIERT = 6;         // ab 1/125 s gilt die winkende Hand als eingefroren
  var TOL3 = 1;              // Toleranz in Drittelblenden: MM −0.3 … +0.3 zählt als richtig
  var DOF_OK = 4;            // Unschärfewert, ab dem der Hintergrund als unscharf gilt
  var BEWEGUNG_VIDEO = 0.7;  // natürliche Bewegungsunschärfe bei 1/50 s

  /* Die vier Aufträge. ev = Szenenhelligkeit bei ISO 100 in Lichtwerten. */
  var AUFTRAEGE = [
    { id: "foto-studio", nr: 1, kamera: "foto",  ort: "studio", ev: 9,
      start: { ap: 12, sh: 3, is: 6, nd: 0, li: 3 } },   // f/11 · 1/60 · ISO 400 → MM −2.0
    { id: "foto-see",    nr: 2, kamera: "foto",  ort: "see",    ev: 15,
      start: { ap: 9, sh: 9, is: 6, nd: 0, li: 3 } },    // f/8 · 1/250 · ISO 400 → MM +3.0
    { id: "video-studio", nr: 3, kamera: "video", ort: "studio", ev: 9,
      start: { ap: 9, sh: SH_VIDEO, is: 12, nd: 0, li: 3 } }, // f/8 · ISO 1600 → MM +1.3
    { id: "video-see",   nr: 4, kamera: "video", ort: "see",    ev: 15,
      start: { ap: 6, sh: SH_VIDEO, is: 9, nd: 0, li: 3 } }   // f/5.6 · ISO 800 → weit über +2.0
  ];

  function av(i) { return 3 + i / 3; }
  function tv(j) { return 5 + j / 3; }
  function sv(k) { return k / 3; }

  /* Hintergrundunschärfe aus der Blende (0 … ~7). Dieselbe Kurve wie in v1:
     10 · (1 − (log2 N − log2 1.4) / (log2 16 − log2 1.4)), mit log2 N = Av/2. */
  function dofWert(i) {
    var l14 = Math.log2(1.4);
    return Math.max(0, 10 * (1 - (av(i) / 2 - l14) / (4 - l14)));
  }

  /* Bewegungsunschärfe der winkenden Hand. 0 ab 1/125 s, +1 je Drittelstufe länger. */
  function bewegungWert(auftrag, j) {
    if (auftrag.kamera === "video") return BEWEGUNG_VIDEO;
    return Math.max(0, (7 - tv(j)) * 3);
  }

  /* Rauschen 0 … 1: ab ISO 200 steigend, ISO 3200 = 1. */
  function rauschWert(k) { return Math.min(1, Math.max(0, (sv(k) - 1) / 4)); }

  /* Kern der Rechnung. s = { ap, sh, is, nd, li } als Indizes. */
  function rechne(auftrag, s) {
    var video = auftrag.kamera === "video";
    var j = video ? SH_VIDEO : s.sh;
    var nd = video ? ND[s.nd] : 0;
    var licht = (video && auftrag.ort === "studio") ? LICHT[s.li] : 0;

    /* Fehler in Drittelblenden: positiv = zu hell. Ganzzahlig, weil alles auf
       dem Drittelraster liegt. */
    var szene3 = 3 * (auftrag.ev + licht - nd);
    var einst3 = (9 + s.ap) + (15 + j) - s.is;
    var fehler3 = szene3 - einst3;

    var dof = dofWert(s.ap);
    var bew = bewegungWert(auftrag, j);
    var rausch = rauschWert(s.is);

    /* Jede Marke leitet sich aus dem Wert ab, der auch das Bild zeichnet. */
    var expoOK = Math.abs(fehler3) <= TOL3;
    var dofOK = dof >= DOF_OK;
    var bewOK = video ? true : bew < 0.5;

    return {
      video: video, j: j, nd: nd, licht: licht,
      fehler3: fehler3, fehler: fehler3 / 3,
      dof: dof, bew: bew, rausch: rausch,
      expoOK: expoOK, dofOK: dofOK, bewOK: bewOK,
      geloest: expoOK && dofOK && bewOK
    };
  }

  /* Alle gültigen Einstellungen eines Auftrags – für die Lösungszählung und
     für den Vorschlag „probier eine andere Kombination". */
  function alleLoesungen(auftrag) {
    var video = auftrag.kamera === "video";
    var shs = video ? [SH_VIDEO] : SH.map(function (_, j) { return j; });
    var nds = video ? ND : [0];
    var lis = (video && auftrag.ort === "studio") ? LICHT.map(function (_, x) { return x; }) : [3];
    var out = [];
    lis.forEach(function (li) {
      nds.forEach(function (nd) {
        for (var ap = 0; ap < AP.length; ap++) {
          shs.forEach(function (sh) {
            for (var is = 0; is < IS.length; is++) {
              var s = { ap: ap, sh: sh, is: is, nd: nd, li: li };
              if (rechne(auftrag, s).geloest) out.push(s);
            }
          });
        }
      });
    });
    return out;
  }

  function schluessel(auftrag, s) {
    return auftrag.kamera === "video"
      ? [s.ap, s.is, s.nd, auftrag.ort === "studio" ? s.li : 3].join("-")
      : [s.ap, s.sh, s.is].join("-");
  }

  /* Anzeige wie im Kameradisplay: MM +0.7, MM −1.3, MM 0.0 */
  function mmText(fehler3) {
    var f = Math.max(-6, Math.min(6, fehler3));
    var v = Math.abs(f) / 3;
    var ganz = Math.floor(v + 1e-9), rest = Math.round((v - ganz) * 3);
    var dez = rest === 0 ? "0" : rest === 1 ? "3" : "7";
    var zahl = ganz + "." + dez;
    if (f === 0) return "0.0";
    return (f > 0 ? "+" : "−") + zahl;
  }

  /* „1/3 Blende", „1 Blende", „1 2/3 Blenden" */
  function stufenText(d3) {
    d3 = Math.abs(d3);
    var ganz = Math.floor(d3 / 3), rest = d3 % 3;
    var bruch = rest === 1 ? "1/3" : rest === 2 ? "2/3" : "";
    if (ganz === 0) return bruch + " Blende";
    var zahl = ganz + (bruch ? " " + bruch : "");
    return zahl + (ganz === 1 && !bruch ? " Blende" : " Blenden");
  }

  function blendeText(i) { var n = AP[i]; return "f/" + (n % 1 === 0 ? n : n.toFixed(1)); }
  function zeitText(j) { return "1/" + SH[j] + " s"; }
  function isoText(k) { return "ISO " + IS[k]; }
  function ndText(x) { return x === 0 ? "aus" : ND_DICHTE[x] + " · " + ND_FAKTOR[x]; }
  function lichtText(x) { var l = LICHT[x]; return l === 0 ? "Grundlicht" : (l > 0 ? "+" : "−") + Math.abs(l) + (Math.abs(l) === 1 ? " Blende" : " Blenden"); }

  var BM = {
    AP: AP, SH: SH, IS: IS, ND: ND, LICHT: LICHT, ND_DICHTE: ND_DICHTE, ND_FAKTOR: ND_FAKTOR,
    SH_VIDEO: SH_VIDEO, AP_WEICH: AP_WEICH, SH_FRIERT: SH_FRIERT, TOL3: TOL3, DOF_OK: DOF_OK,
    AUFTRAEGE: AUFTRAEGE,
    av: av, tv: tv, sv: sv, dofWert: dofWert, rauschWert: rauschWert,
    rechne: rechne, alleLoesungen: alleLoesungen, schluessel: schluessel,
    mmText: mmText, stufenText: stufenText,
    blendeText: blendeText, zeitText: zeitText, isoText: isoText, ndText: ndText, lichtText: lichtText
  };

  if (typeof module !== "undefined" && module.exports) module.exports = BM;
  else root.BM = BM;
})(this);
