/* Szenen im Cartoon-Stil. Jede Szene besteht aus Tiefenebenen, die einzeln
   unscharf werden – so entsteht Schärfentiefe statt eines flachen Weichzeichners:
     fern   Himmel, Wand, Lichter        stärkste Unschärfe
     bokeh  Lichtpunkte als Scheiben     wachsen mit offener Blende
     mitte  Wiese, Baum, Regal, Pflanze  mittlere Unschärfe
     person                              scharf
     vorn   Schilf, Tisch                leicht unscharf
   Koordinaten: viewBox 0 0 1600 900. */
(function (root) {
  "use strict";

  /* Reproduzierbarer Zufall, damit die Szene bei jedem Laden gleich aussieht. */
  function zufall(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  function r1(n) { return Math.round(n * 10) / 10; }

  var VB = 'viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"';

  /* ------------------------------------------------------------------ */
  /* Draußen am See                                                     */
  /* ------------------------------------------------------------------ */

  function wolke(x, y, s) {
    var t = 'transform="translate(' + x + ' ' + y + ') scale(' + s + ')"';
    return '<g ' + t + '>' +
      '<g fill="#d9ecf8"><circle cx="-4" cy="14" r="48"/><circle cx="58" cy="-6" r="62"/><circle cx="124" cy="16" r="46"/><rect x="-52" y="18" width="226" height="46" rx="23"/></g>' +
      '<g fill="#ffffff"><circle cx="-4" cy="4" r="46"/><circle cx="58" cy="-16" r="60"/><circle cx="122" cy="6" r="44"/><rect x="-50" y="8" width="220" height="44" rx="22"/></g>' +
      '</g>';
  }

  function baumreihe() {
    var z = zufall(7), out = "", x = -120;
    while (x < 1720) {
      var r = 16 + z() * 16, y = 492 - r * 0.55;
      var c = z() < 0.5 ? "#4f9562" : "#5ea36f";
      out += '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(r) + '" fill="' + c + '"/>';
      x += r * (1.1 + z() * 0.9);
    }
    return out;
  }

  var SEE_GLANZ = (function () {
    var z = zufall(21), p = [];
    for (var i = 0; i < 16; i++) {
      p.push({ x: r1(40 + z() * 1520), y: r1(530 + z() * 110), w: r1(30 + z() * 70) });
    }
    return p;
  })();

  function glanzlichter() {
    return SEE_GLANZ.map(function (g) {
      return '<rect x="' + g.x + '" y="' + g.y + '" width="' + g.w + '" height="5" rx="2.5" fill="#ffffff" opacity=".75"/>';
    }).join("");
  }

  function segelboot(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<path d="M-58 0 L58 0 L44 20 L-44 20 Z" fill="#ffffff"/>' +
      '<path d="M-58 0 L58 0 L54 6 L-54 6 Z" fill="#e8743b"/>' +
      '<rect x="-3" y="-118" width="5" height="120" fill="#6b4a35"/>' +
      '<path d="M4 -112 L4 -6 L62 -6 Z" fill="#fffaf0"/>' +
      '<path d="M-4 -96 L-4 -6 L-46 -6 Z" fill="#f4c16a"/>' +
      '<path d="M-44 26 L44 26" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".45"/>' +
      '</g>';
  }

  function vogel(x, y, s) {
    return '<path d="M' + x + ' ' + y + ' q ' + 9 * s + ' ' + -9 * s + ' ' + 18 * s + ' 0 q ' + 9 * s + ' ' + -9 * s + ' ' + 18 * s + ' 0" fill="none" stroke="#3b5d75" stroke-width="3.2" stroke-linecap="round"/>';
  }

  var seeFern =
    '<svg class="ebene" data-ebene="fern" ' + VB + ' aria-hidden="true">' +
    '<defs>' +
      '<linearGradient id="see-himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b9fe0"/><stop offset=".62" stop-color="#9ed3f3"/><stop offset="1" stop-color="#f7efd8"/></linearGradient>' +
      '<radialGradient id="see-schein"><stop offset="0" stop-color="#fffbe6"/><stop offset=".3" stop-color="#fff4c4" stop-opacity=".6"/><stop offset="1" stop-color="#fff4c4" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="see-wasser" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#94d3ef"/><stop offset=".35" stop-color="#5eaee0"/><stop offset="1" stop-color="#3584c0"/></linearGradient>' +
    '</defs>' +
    '<rect x="-300" y="-300" width="2200" height="880" fill="url(#see-himmel)"/>' +
    '<circle cx="520" cy="150" r="330" fill="url(#see-schein)"/>' +
    '<circle cx="520" cy="150" r="64" fill="#fff6c9"/>' +
    wolke(780, 150, 1) + wolke(1250, 96, 0.78) + wolke(1500, 250, 0.6) + wolke(170, 250, 0.55) +
    vogel(930, 250, 1) + vogel(975, 232, 0.8) + vogel(1010, 262, 0.7) +
    '<path d="M-300 470 C -60 392, 140 404, 320 432 S 640 356, 850 418 S 1190 346, 1410 406 S 1760 372, 1900 420 L1900 560 L-300 560 Z" fill="#a9cfd9"/>' +
    '<path d="M-300 498 C 60 444, 300 470, 540 482 S 930 432, 1170 470 S 1560 440, 1900 480 L1900 560 L-300 560 Z" fill="#82b893"/>' +
    baumreihe() +
    '<rect x="-300" y="505" width="2200" height="260" fill="url(#see-wasser)"/>' +
    '<rect x="-300" y="505" width="2200" height="16" fill="#5f9f8e" opacity=".45"/>' +
    glanzlichter() +
    segelboot(420, 580) +
    '</svg>';

  function blumen(seed, n, y0, y1) {
    var z = zufall(seed), out = "", farben = ["#ffffff", "#ffd35c", "#f59ab5", "#ffffff", "#b9a3f0"];
    for (var i = 0; i < n; i++) {
      var x = r1(-40 + z() * 1680), y = r1(y0 + z() * (y1 - y0)), c = farben[Math.floor(z() * farben.length)];
      out += '<circle cx="' + x + '" cy="' + y + '" r="7" fill="' + c + '"/><circle cx="' + x + '" cy="' + y + '" r="2.6" fill="#f0a02a"/>';
    }
    return out;
  }
  function grasbueschel(seed, n, y0, y1, farbe) {
    var z = zufall(seed), out = "";
    for (var i = 0; i < n; i++) {
      var x = -40 + z() * 1680, y = y0 + z() * (y1 - y0), h = 16 + z() * 16;
      out += '<path d="M' + r1(x - 10) + ' ' + r1(y) + ' q 4 ' + r1(-h) + ' 8 ' + r1(-h * 0.2) + ' q 3 ' + r1(-h * 1.1) + ' 6 0 q 4 ' + r1(-h * 0.8) + ' 9 ' + r1(h * 0.2) + '" fill="none" stroke="' + farbe + '" stroke-width="3.5" stroke-linecap="round"/>';
    }
    return out;
  }

  var seeMitte =
    '<svg class="ebene" data-ebene="mitte" ' + VB + ' aria-hidden="true">' +
    /* Steg rechts, läuft ins Wasser */
    '<g>' +
      '<rect x="1390" y="624" width="12" height="60" fill="#7a5638"/><rect x="1540" y="624" width="12" height="70" fill="#7a5638"/>' +
      '<path d="M1330 600 L1900 590 L1900 640 L1320 632 Z" fill="#c29466"/>' +
      '<path d="M1320 632 L1900 640 L1900 652 L1322 644 Z" fill="#9c7048"/>' +
      '<path d="M1400 598 L1396 634 M1470 597 L1468 635 M1540 596 L1540 636 M1610 595 L1612 637" stroke="#a57a50" stroke-width="3"/>' +
    '</g>' +
    '<path d="M-300 668 C 180 632, 600 654, 920 642 S 1420 628, 1900 654 L1900 1200 L-300 1200 Z" fill="#92c96c"/>' +
    '<path d="M-300 740 C 260 704, 700 736, 1120 716 S 1620 706, 1900 726 L1900 1200 L-300 1200 Z" fill="#7cb85b"/>' +
    grasbueschel(31, 26, 690, 880, "#6aa64b") +
    blumen(41, 30, 690, 880) +
    /* großer Baum links, rahmt das Bild */
    '<path d="M70 920 C 92 760, 110 560, 96 380 L148 380 C 160 560, 170 760, 196 920 Z" fill="#8a5a3b"/>' +
    '<path d="M120 520 C 170 470, 220 450, 268 440" stroke="#8a5a3b" stroke-width="18" fill="none" stroke-linecap="round"/>' +
    '<g fill="#4f9660"><circle cx="40" cy="250" r="150"/><circle cx="200" cy="200" r="130"/><circle cx="270" cy="360" r="110"/><circle cx="-60" cy="400" r="130"/></g>' +
    '<g fill="#62ad72"><circle cx="70" cy="190" r="110"/><circle cx="210" cy="160" r="90"/><circle cx="250" cy="320" r="70"/></g>' +
    '<g fill="#7cc487"><circle cx="110" cy="130" r="50"/><circle cx="230" cy="130" r="36"/><circle cx="270" cy="290" r="30"/></g>' +
    '</svg>';

  function schilf(x0, dir, seed) {
    var z = zufall(seed), out = "";
    for (var i = 0; i < 12; i++) {
      var x = x0 + dir * i * 16 + z() * 10, h = 150 + z() * 170, b = 30 + z() * 40;
      out += '<path d="M' + r1(x) + ' 930 Q ' + r1(x + dir * b * 0.4) + ' ' + r1(930 - h * 0.6) + ' ' + r1(x + dir * b) + ' ' + r1(930 - h) + '" fill="none" stroke="' + (i % 2 ? "#4f8f3f" : "#65a650") + '" stroke-width="' + r1(9 + z() * 6) + '" stroke-linecap="round"/>';
      if (i % 4 === 1) out += '<ellipse cx="' + r1(x + dir * b * 0.85) + '" cy="' + r1(930 - h * 0.92) + '" rx="9" ry="30" fill="#7a4f2e" transform="rotate(' + r1(dir * 12) + ' ' + r1(x + dir * b * 0.85) + ' ' + r1(930 - h * 0.92) + ')"/>';
    }
    return out;
  }

  var seeVorn =
    '<svg class="ebene" data-ebene="vorn" ' + VB + ' aria-hidden="true">' +
    schilf(-30, 1, 51) + schilf(1640, -1, 61) +
    '</svg>';

  /* Lichtpunkte, die bei offener Blende zu Bokeh-Scheiben werden */
  var seeBokeh = SEE_GLANZ.map(function (g) {
    return { x: g.x + g.w / 2, y: g.y + 2, r: 7 + g.w / 14, farbe: "#ffffff", staerke: 0.85 };
  });

  /* ------------------------------------------------------------------ */
  /* Studio – Interview-Set                                             */
  /* ------------------------------------------------------------------ */

  var LICHTERKETTE = (function () {
    /* quadratische Kurve (440,120) – (1000,250) – (1640,110) */
    var p = [], n = 17;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = 1 - t;
      var x = a * a * 440 + 2 * a * t * 1000 + t * t * 1640;
      var y = a * a * 120 + 2 * a * t * 250 + t * t * 110;
      p.push({ x: r1(x), y: r1(y + 14) });
    }
    return p;
  })();

  var studioFern =
    '<svg class="ebene" data-ebene="fern" ' + VB + ' aria-hidden="true">' +
    '<defs>' +
      '<linearGradient id="st-wand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3cbb8"/><stop offset="1" stop-color="#94b29d"/></linearGradient>' +
      '<radialGradient id="st-pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6de" stop-opacity=".5"/><stop offset="1" stop-color="#fff6de" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="st-lampe" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe7ad" stop-opacity=".85"/><stop offset="1" stop-color="#ffe7ad" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="st-glas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaf6fc"/><stop offset="1" stop-color="#bfe0f1"/></linearGradient>' +
      '<radialGradient id="st-birne"><stop offset="0" stop-color="#fff3c9"/><stop offset=".45" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>' +
    '</defs>' +
    '<rect x="-300" y="-300" width="2200" height="1500" fill="url(#st-wand)"/>' +
    '<circle cx="1110" cy="420" r="420" fill="url(#st-pool)"/>' +
    /* Wandverkleidung unten */
    '<rect x="-300" y="640" width="2200" height="400" fill="#86a591"/>' +
    '<rect x="-300" y="630" width="2200" height="14" fill="#f3eee4"/>' +
    (function () { var o = ""; for (var x = -260; x < 1900; x += 150) o += '<rect x="' + x + '" y="672" width="118" height="200" rx="6" fill="none" stroke="#7a9985" stroke-width="5"/>'; return o; })() +
    /* Fenster links mit Blick ins Grüne */
    '<rect x="70" y="110" width="340" height="450" rx="10" fill="#f6f1e7"/>' +
    '<rect x="92" y="132" width="296" height="406" fill="url(#st-glas)"/>' +
    '<g fill="#b9dcb0"><circle cx="140" cy="470" r="70"/><circle cx="230" cy="500" r="60"/><circle cx="330" cy="460" r="80"/></g>' +
    '<g fill="#a3d09c"><circle cx="180" cy="520" r="50"/><circle cx="300" cy="530" r="44"/></g>' +
    '<rect x="92" y="132" width="296" height="406" fill="#ffffff" opacity=".18"/>' +
    '<rect x="236" y="132" width="10" height="406" fill="#f6f1e7"/><rect x="92" y="326" width="296" height="10" fill="#f6f1e7"/>' +
    '<rect x="56" y="552" width="368" height="18" rx="4" fill="#ece5d8"/>' +
    '<path d="M40 90 C 70 250, 50 420, 90 600 L 140 600 C 110 420, 130 250, 110 90 Z" fill="#e7c9a0"/>' +
    '<path d="M400 90 C 380 250, 400 420, 372 600 L 430 600 C 460 420, 440 250, 470 90 Z" fill="#e7c9a0"/>' +
    '<rect x="20" y="78" width="480" height="16" rx="8" fill="#8a6a4f"/>' +
    /* Stehlampe mit warmem Schein */
    '<circle cx="560" cy="380" r="200" fill="url(#st-lampe)"/>' +
    '<rect x="555" y="420" width="10" height="420" fill="#4a4038"/>' +
    '<ellipse cx="560" cy="842" rx="54" ry="12" fill="#4a4038"/>' +
    '<path d="M510 312 L610 312 L636 418 L484 418 Z" fill="#fbe2a6"/>' +
    '<path d="M484 418 L636 418 L632 426 L488 426 Z" fill="#e9c47a"/>' +
    /* Lichterkette */
    '<path d="M440 120 Q 1000 250 1640 110" fill="none" stroke="#5b4a3a" stroke-width="3"/>' +
    LICHTERKETTE.map(function (b) {
      return '<circle cx="' + b.x + '" cy="' + b.y + '" r="26" fill="url(#st-birne)"/>' +
             '<rect x="' + (b.x - 3) + '" y="' + (b.y - 16) + '" width="6" height="8" fill="#5b4a3a"/>' +
             '<circle cx="' + b.x + '" cy="' + b.y + '" r="8" fill="#ffe29b"/>';
    }).join("") +
    '</svg>';

  function buecher(x0, y, breite, seed) {
    var z = zufall(seed), out = "", x = x0;
    var farben = ["#e07a5f", "#3d5a80", "#f2cc8f", "#81b29a", "#9c6644", "#e9c46a", "#6d597a", "#2a9d8f"];
    while (x < x0 + breite - 20) {
      var w = 16 + z() * 14, h = 70 + z() * 34, c = farben[Math.floor(z() * farben.length)];
      if (z() < 0.12) { out += '<rect x="' + r1(x) + '" y="' + r1(y - 28) + '" width="' + r1(h) + '" height="' + r1(w) + '" rx="3" fill="' + c + '"/>'; x += h + 4; continue; }
      out += '<rect x="' + r1(x) + '" y="' + r1(y - h) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="3" fill="' + c + '"/>' +
             '<rect x="' + r1(x + 3) + '" y="' + r1(y - h + 12) + '" width="' + r1(w - 6) + '" height="4" fill="#ffffff" opacity=".35"/>';
      x += w + 2;
    }
    return out;
  }

  function monsteraBlatt(x, y, s, rot, farbe) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + s + ')">' +
      '<path d="M0 0 C -60 -20, -90 -90, -40 -150 C 0 -190, 60 -170, 80 -120 C 100 -60, 60 -10, 0 0 Z" fill="' + farbe + '"/>' +
      '<path d="M0 0 C 10 -50, 10 -100, 0 -150" stroke="#2f6b43" stroke-width="5" fill="none"/>' +
      '<path d="M-50 -70 L-20 -80 M-58 -110 L-14 -112 M60 -70 L18 -80 M66 -112 L16 -118" stroke="#e9f2e6" stroke-width="7" stroke-linecap="round" opacity=".7"/>' +
      '</g>';
  }

  var studioMitte =
    '<svg class="ebene" data-ebene="mitte" ' + VB + ' aria-hidden="true">' +
    /* Regal rechts */
    '<rect x="1300" y="236" width="360" height="680" rx="8" fill="#a8744b"/>' +
    '<rect x="1322" y="258" width="330" height="640" fill="#7d5536"/>' +
    buecher(1330, 400, 320, 11) + '<rect x="1300" y="400" width="360" height="16" fill="#b98556"/>' +
    buecher(1330, 560, 180, 12) +
    /* kleine Kamera im Regal */
    '<g transform="translate(1540 510)"><rect x="0" y="0" width="84" height="50" rx="8" fill="#2b2f36"/><rect x="10" y="-10" width="26" height="12" rx="3" fill="#2b2f36"/><circle cx="46" cy="25" r="18" fill="#5b6470"/><circle cx="46" cy="25" r="10" fill="#1b1e23"/><circle cx="42" cy="21" r="3" fill="#ffffff" opacity=".6"/></g>' +
    '<rect x="1300" y="560" width="360" height="16" fill="#b98556"/>' +
    buecher(1330, 720, 320, 13) + '<rect x="1300" y="720" width="360" height="16" fill="#b98556"/>' +
    /* Pflanze im Topf oben im Regal */
    '<path d="M1360 330 C 1340 280, 1380 250, 1400 290 C 1410 250, 1450 260, 1440 300 C 1470 280, 1490 320, 1460 340 Z" fill="#5ea36f"/>' +
    '<rect x="1380" y="330" width="60" height="70" rx="8" fill="#e8e1d6"/>' +
    /* Monstera im Topf links */
    monsteraBlatt(530, 700, 1.25, -38, "#3f8f5a") +
    monsteraBlatt(560, 700, 1.4, 6, "#4fa36a") +
    monsteraBlatt(600, 720, 1.15, 44, "#3f8f5a") +
    '<path d="M470 700 L660 700 L640 880 C 640 900, 490 900, 490 880 Z" fill="#c8693f"/>' +
    '<rect x="460" y="690" width="210" height="30" rx="8" fill="#d9794c"/>' +
    '</svg>';

  var studioVorn =
    '<svg class="ebene" data-ebene="vorn" ' + VB + ' aria-hidden="true">' +
    /* Tischkante mit Tasse, ganz nah an der Kamera */
    '<path d="M-100 820 L330 800 C 360 800, 380 820, 380 840 L380 1000 L-100 1000 Z" fill="#6d4a33"/>' +
    '<path d="M-100 820 L330 800 C 360 800, 380 820, 380 830 L-100 848 Z" fill="#8c6246"/>' +
    '<g transform="translate(120 700)"><rect x="0" y="0" width="110" height="120" rx="18" fill="#f4efe6"/><path d="M110 30 C 160 30, 160 90, 110 90" fill="none" stroke="#f4efe6" stroke-width="18"/><rect x="0" y="22" width="110" height="18" fill="#e8743b"/></g>' +
    '</svg>';

  var studioBokeh = LICHTERKETTE.map(function (b) {
    return { x: b.x, y: b.y, r: 14, farbe: "#ffd98a", staerke: 0.9 };
  }).concat([
    { x: 560, y: 370, r: 42, farbe: "#fbe2a6", staerke: 0.7 },
    { x: 170, y: 230, r: 34, farbe: "#f4fbff", staerke: 0.35 },
    { x: 320, y: 420, r: 30, farbe: "#f4fbff", staerke: 0.3 }
  ]);

  /* ------------------------------------------------------------------ */
  /* Die Person                                                         */
  /* ------------------------------------------------------------------ */

  var HAUT = "#f6d0ae", HAUT2 = "#e9b892", PULLI = "#e8743b", PULLI2 = "#cf5f2a";

  /* Unterarm mit Hand – als Form definiert, damit Nachzieher (Bewegungsunschärfe)
     dieselbe Form wiederverwenden. Gelenk: Ellbogen bei (870, 560). */
  var UNTERARM_WINKEN =
    '<g id="p-unterarm">' +
      '<path d="M870 560 L852 432" stroke="' + PULLI + '" stroke-width="54" stroke-linecap="round"/>' +
      '<path d="M853 446 L851 430" stroke="' + PULLI2 + '" stroke-width="58" stroke-linecap="round"/>' +
      '<g fill="' + HAUT + '">' +
        '<ellipse cx="848" cy="392" rx="30" ry="34"/>' +
        '<rect x="820" y="330" width="14" height="46" rx="7" transform="rotate(-10 827 353)"/>' +
        '<rect x="836" y="318" width="14" height="52" rx="7" transform="rotate(-3 843 344)"/>' +
        '<rect x="853" y="320" width="14" height="50" rx="7" transform="rotate(4 860 345)"/>' +
        '<rect x="869" y="332" width="13" height="42" rx="6.5" transform="rotate(11 875 353)"/>' +
        '<rect x="872" y="380" width="14" height="40" rx="7" transform="rotate(52 879 400)"/>' +
      '</g>' +
    '</g>';

  function person(kamera) {
    var video = kamera === "video";
    var s = '<svg class="ebene" data-ebene="person" ' + VB + ' aria-hidden="true">' +
      '<defs>' +
        '<filter id="p-wisch" x="-60%" y="-30%" width="220%" height="160%"><feGaussianBlur id="p-wisch-b" stdDeviation="0 0"/></filter>' +
        '<filter id="p-koerper-f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur id="p-koerper-b" stdDeviation="0 0"/></filter>' +
        (video ? "" : UNTERARM_WINKEN.replace('<g id="p-unterarm">', '<g id="p-unterarm-form">')) +
      '</defs>';

    s += '<g id="p-koerper" filter="url(#p-koerper-f)">';
    /* Haare hinten */
    s += '<path d="M1010 300 C 1000 196, 1064 190, 1104 190 C 1156 190, 1212 206, 1202 300 L1208 396 C 1186 410, 1156 406, 1146 394 L1062 394 C 1052 406, 1022 410, 1002 396 Z" fill="#4b2e22"/>';
    /* Hals, Beine, Pulli */
    s += '<rect x="1078" y="366" width="48" height="62" rx="12" fill="' + HAUT2 + '"/>';
    s += '<path d="M972 790 L1236 790 L1244 940 L964 940 Z" fill="#34435a"/><path d="M1104 800 L1104 940" stroke="#2a3649" stroke-width="4"/>';
    s += '<path d="M962 474 C 962 442, 992 426, 1034 422 L1170 422 C 1212 426, 1242 442, 1242 474 L1250 764 C 1250 782, 1236 792, 1220 792 L984 792 C 968 792, 954 782, 954 764 Z" fill="' + PULLI + '"/>';
    s += '<path d="M1204 440 C 1232 456, 1242 474, 1242 500 L1250 764 C 1250 782, 1236 792, 1220 792 L1196 792 C 1214 700, 1218 560, 1204 440 Z" fill="' + PULLI2 + '" opacity=".55"/>';
    s += '<rect x="956" y="764" width="292" height="28" rx="12" fill="' + PULLI2 + '"/>';
    s += '<path d="M1068 422 L1102 478 L1136 422 Z" fill="#fbf6ee"/><path d="M1060 420 L1102 486 L1144 420" fill="none" stroke="' + PULLI2 + '" stroke-width="8" stroke-linejoin="round"/>';
    if (video) {
      /* Ansteckmikrofon am Kragen */
      s += '<path d="M1134 452 C 1150 520, 1170 600, 1180 700" fill="none" stroke="#1d2127" stroke-width="2.4" opacity=".35"/>';
      s += '<rect x="1126" y="440" width="16" height="22" rx="5" fill="#1d2127"/><rect x="1128" y="436" width="12" height="8" rx="2" fill="#6a7380"/>';
    }
    /* hängender Arm rechts im Bild */
    s += '<path d="M1226 462 C 1262 540, 1270 620, 1256 698" stroke="' + PULLI + '" stroke-width="62" stroke-linecap="round" fill="none"/>';
    s += '<path d="M1257 690 L1256 708" stroke="' + PULLI2 + '" stroke-width="64" stroke-linecap="round"/>';
    s += '<ellipse cx="1254" cy="742" rx="27" ry="30" fill="' + HAUT + '"/>';

    /* Kopf */
    s += '<g id="p-kopf">';
    s += '<circle cx="1104" cy="300" r="86" fill="' + HAUT + '"/>';
    s += '<path d="M1020 318 C 1030 372, 1070 392, 1104 392 C 1140 392, 1178 372, 1188 318 C 1176 360, 1140 380, 1104 380 C 1068 380, 1032 360, 1020 318 Z" fill="' + HAUT2 + '" opacity=".45"/>';
    s += '<ellipse cx="1054" cy="342" rx="15" ry="9" fill="#f29c8a" opacity=".55"/><ellipse cx="1154" cy="342" rx="15" ry="9" fill="#f29c8a" opacity=".55"/>';
    s += '<g id="p-augen"><ellipse cx="1074" cy="312" rx="8.5" ry="11.5" fill="#2b2420"/><ellipse cx="1134" cy="312" rx="8.5" ry="11.5" fill="#2b2420"/>' +
         '<circle cx="1077" cy="307" r="3.2" fill="#ffffff"/><circle cx="1137" cy="307" r="3.2" fill="#ffffff"/></g>';
    s += '<path d="M1060 286 Q 1074 278 1088 284 M1120 284 Q 1134 278 1148 286" fill="none" stroke="#4b2e22" stroke-width="5" stroke-linecap="round"/>';
    s += '<path d="M1104 322 q -7 14 4 17" fill="none" stroke="#d99c78" stroke-width="4" stroke-linecap="round"/>';
    if (video) {
      s += '<g id="p-mund"><ellipse cx="1104" cy="356" rx="15" ry="9" fill="#8f3a2e"/><ellipse cx="1104" cy="361" rx="8" ry="4" fill="#e0776b"/></g>';
    } else {
      s += '<path d="M1078 346 Q 1104 380 1130 346 Z" fill="#8f3a2e"/><path d="M1090 360 Q 1104 370 1118 360 Q 1104 356 1090 360 Z" fill="#e0776b"/><path d="M1080 347 L1128 347" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>';
    }
    /* Pony */
    s += '<path d="M1016 296 C 1018 222, 1072 204, 1114 206 C 1166 208, 1196 240, 1192 298 C 1166 262, 1134 250, 1100 264 C 1080 244, 1040 256, 1016 296 Z" fill="#5a3627"/>';
    s += '<path d="M1066 222 C 1090 214, 1124 214, 1150 226" fill="none" stroke="#7a4c37" stroke-width="6" stroke-linecap="round" opacity=".7"/>';
    s += '</g>';
    s += '</g>';

    if (video) {
      /* Gestik beim Sprechen: Oberarm hängt, Unterarm vor dem Körper */
      s += '<path d="M982 462 C 956 520, 948 570, 952 612" stroke="' + PULLI + '" stroke-width="60" stroke-linecap="round" fill="none"/>';
      s += '<g id="p-geste" filter="url(#p-wisch)">' +
             '<path d="M952 612 L1030 640" stroke="' + PULLI + '" stroke-width="54" stroke-linecap="round"/>' +
             '<path d="M1022 637 L1036 642" stroke="' + PULLI2 + '" stroke-width="58" stroke-linecap="round"/>' +
             '<ellipse cx="1066" cy="646" rx="30" ry="26" fill="' + HAUT + '"/>' +
             '<rect x="1070" y="612" width="14" height="40" rx="7" fill="' + HAUT + '" transform="rotate(35 1077 632)"/>' +
           '</g>';
    } else {
      /* Winken: Oberarm fest, Unterarm mit Nachziehern */
      s += '<path d="M984 460 C 944 490, 902 526, 872 560" stroke="' + PULLI + '" stroke-width="60" stroke-linecap="round" fill="none"/>';
      s += '<g id="p-nachzieher"></g>';
      s += '<g filter="url(#p-wisch)"><use href="#p-unterarm-form"/></g>';
    }
    s += '</svg>';
    return s;
  }

  var SZENEN = {
    see: { fern: seeFern, mitte: seeMitte, vorn: seeVorn, bokeh: seeBokeh },
    studio: { fern: studioFern, mitte: studioMitte, vorn: studioVorn, bokeh: studioBokeh }
  };

  root.SZENE = {
    SZENEN: SZENEN,
    person: person,
    ELLBOGEN: { x: 870, y: 560 },
    GESICHT: { x: 1104, y: 300, r: 86 }
  };
})(this);
