(function () {
  "use strict";
  var BM = window.BM, SZ = window.SZENE;

  function $(id) { return document.getElementById(id); }
  function klemme(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------------- SCORM 1.2 (optional) + postMessage ---------------- */
  var API = null;
  function findeAPI(w) { var n = 0; while (w.API == null && w.parent != null && w.parent != w && n < 10) { n++; w = w.parent; } return w.API; }
  function scormStart() { try { API = findeAPI(window) || (window.opener ? findeAPI(window.opener) : null); if (API) API.LMSInitialize(""); } catch (e) { API = null; } }
  function melde(score, status) {
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: "belichtung:progress", score: score, status: status }, "*"); } catch (e) {}
    if (!API) return;
    try {
      API.LMSSetValue("cmi.core.score.raw", String(score)); API.LMSSetValue("cmi.core.score.min", "0");
      API.LMSSetValue("cmi.core.score.max", "100"); API.LMSSetValue("cmi.core.lesson_status", status); API.LMSCommit("");
    } catch (e) {}
  }
  window.addEventListener("load", scormStart);
  window.addEventListener("unload", function () { if (API) { try { API.LMSFinish(""); } catch (e) {} } });

  /* ---------------- Icons ---------------- */
  var I = {
    foto: '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.1-1.8a1 1 0 0 1 .86-.48h5.68a1 1 0 0 1 .86.48L16.8 6h1.7A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/><circle cx="12" cy="12.5" r="3.6"/>',
    video: '<rect x="2.5" y="7" width="13" height="10" rx="2.2"/><path d="M15.5 11.2l5-2.8v7.2l-5-2.8z"/><circle cx="8" cy="12" r="2.3"/>',
    sonne: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.3M12 19.2v2.3M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
    studio: '<path d="M6.6 3.6h10.8l2.1 7.2H4.5z"/><path d="M12 10.8V20"/><path d="M8.6 20h6.8"/>',
    haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    schloss: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
    links: '<path d="M15 6l-6 6 6 6"/>',
    rechts: '<path d="M9 6l6 6-6 6"/>',
    weiter: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    tipp: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    blende: '<circle cx="12" cy="12" r="9.5"/><path d="M14.31 8l5.36 9.28M9.69 8h10.72M7.38 12l5.36-9.28M9.69 16L4.33 6.72M14.31 16H3.59M16.62 12l-5.36 9.28"/>',
    hand: '<path d="M8.5 12.5V6.8a1.4 1.4 0 0 1 2.8 0v4.7M11.3 11V5.4a1.4 1.4 0 0 1 2.8 0V11M14.1 11V6.6a1.4 1.4 0 0 1 2.8 0v6.6c0 4.1-2.4 6.8-5.6 6.8-2.3 0-3.7-1.1-4.8-3l-1.8-3.2a1.4 1.4 0 0 1 2.4-1.4l1.1 1.6"/>'
  };
  function ikon(p, extra) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + (extra ? " " + extra : "") + ">" + p + "</svg>";
  }

  /* Dreieck (Foto) und Fünfeck (Video) als kleine Karte der Stellschrauben */
  function poly(kamera, mitText) {
    var foto = kamera === "foto";
    var pts = foto ? [[60, 16], [18, 92], [102, 92]]
                   : [[60, 18], [98, 45.6], [83.5, 90.4], [36.5, 90.4], [22, 45.6]];
    var namen = foto ? ["Blende", "Zeit", "ISO"] : ["Licht", "ND", "Blende", "Zeit", "ISO"];
    var lage = foto ? [[60, 7, "middle"], [18, 112, "middle"], [102, 112, "middle"]]
                    : [[60, 8, "middle"], [107, 51, "start"], [90, 110, "start"], [30, 110, "end"], [13, 51, "end"]];
    var zeitIdx = foto ? 1 : 3;
    var vb = mitText ? "-24 -10 168 128" : "8 6 104 96";
    var s = '<svg viewBox="' + vb + '" aria-hidden="true">';
    s += '<polygon points="' + pts.map(function (p) { return p.join(","); }).join(" ") + '" fill="#fbeada" stroke="#c1651f" stroke-width="' + (mitText ? 2.5 : 5) + '" stroke-linejoin="round"/>';
    pts.forEach(function (p, i) {
      var fest = !foto && i === zeitIdx;
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (mitText ? 6 : 9) + '" fill="' + (fest ? "#9aa2ad" : "#fff") + '" stroke="' + (fest ? "#9aa2ad" : "#c1651f") + '" stroke-width="' + (mitText ? 2.5 : 4) + '"/>';
      if (mitText) {
        s += '<text x="' + lage[i][0] + '" y="' + lage[i][1] + '" text-anchor="' + lage[i][2] + '" font-family="-apple-system,Segoe UI,Roboto,sans-serif" font-size="15" font-weight="650" fill="' + (fest ? "#6b7584" : "#1e2530") + '">' + namen[i] + "</text>";
      }
    });
    return s + "</svg>";
  }

  /* ---------------- Texte der Aufträge ---------------- */
  var TEXT = {
    "foto-studio": {
      titel: "Porträt im Studio", tab: "Im Studio", klein: "Porträt",
      text: "Sie winkt dir zu – mach ein Foto, auf dem sie sich vom Hintergrund abhebt und die Hand nicht verwischt. Das Studiolicht ist fest eingerichtet, du arbeitest nur mit den drei Stellschrauben der Kamera."
    },
    "foto-see": {
      titel: "Porträt am See", tab: "Am See", klein: "Porträt",
      text: "Dasselbe Foto draußen in der prallen Sonne. Jetzt ist Licht im Überfluss da – und die Sonne kannst du nicht dimmen."
    },
    "video-studio": {
      titel: "Interview im Studio", tab: "Im Studio", klein: "Interview",
      text: "Jetzt filmst du. Bei 25 Bildern pro Sekunde bleibt die Belichtungszeit fest auf 1/50 s. Dafür kannst du das Studiolicht regeln und einen ND-Filter vor das Objektiv setzen."
    },
    "video-see": {
      titel: "Interview am See", tab: "Am See", klein: "Interview",
      text: "Das Interview draußen in der Sonne. Die Zeit ist fest, die Sonne nicht zu dimmen, und für den weichen Hintergrund brauchst du eine offene Blende. Was bleibt dir?"
    }
  };

  /* ---------------- Regler ---------------- */
  var REGLER = {
    li: { name: "Studiolicht", n: BM.LICHT.length, wert: BM.lichtText, voll: [0, 1, 2, 3, 4, 5, 6],
          marke: function (i) { var l = BM.LICHT[i]; return l === 0 ? "0" : (l > 0 ? "+" : "−") + Math.abs(l); },
          heller: 1, weniger: "Licht dimmen", mehr: "Licht heller" },
    nd: { name: "ND-Filter", n: BM.ND.length, wert: BM.ndText, voll: [0, 1, 2, 3, 4, 5, 6],
          marke: function (i) { return i === 0 ? "aus" : BM.ND_DICHTE[i]; },
          heller: -1, weniger: "schwächerer Filter", mehr: "stärkerer Filter" },
    ap: { name: "Blende", n: BM.AP.length, wert: BM.blendeText, voll: [0, 3, 6, 9, 12, 15],
          marke: function (i) { return String(BM.AP[i]); },
          heller: -1, weniger: "Blende öffnen", mehr: "Blende schließen" },
    sh: { name: "Belichtungszeit", n: BM.SH.length, wert: BM.zeitText, voll: [0, 3, 6, 9, 12, 15, 18, 21], kurz: [0, 6, 12, 21],
          marke: function (i) { return String(BM.SH[i]); },
          heller: -1, weniger: "längere Zeit", mehr: "kürzere Zeit" },
    is: { name: "ISO", n: BM.IS.length, wert: function (k) { return String(BM.IS[k]); }, voll: [0, 3, 6, 9, 12, 15],
          marke: function (i) { return String(BM.IS[i]); },
          heller: 1, weniger: "weniger ISO", mehr: "mehr ISO" }
  };

  function reglerFuer(a) {
    if (a.kamera === "foto") return { vor: [], kamera: ["ap", "sh", "is"] };
    return { vor: a.ort === "studio" ? ["li", "nd"] : ["nd"], kamera: ["ap", "sh", "is"] };
  }
  function verstellbar(a) {
    var r = reglerFuer(a);
    return r.vor.concat(r.kamera).filter(function (k) { return !(a.kamera === "video" && k === "sh"); });
  }

  /* ---------------- Zustand ---------------- */
  var z = {
    auftrag: BM.AUFTRAEGE[0].id,
    einst: {}, geloest: {}, loesungen: {}, cache: {},
    info: null, szene: null, tcStart: 0, warGeloest: false
  };
  BM.AUFTRAEGE.forEach(function (a) {
    z.einst[a.id] = Object.assign({}, a.start);
    z.loesungen[a.id] = [];
  });
  function auftrag() { return BM.AUFTRAEGE.filter(function (a) { return a.id === z.auftrag; })[0]; }
  function einst() { return z.einst[z.auftrag]; }
  function loesungenVon(a) { return z.cache[a.id] || (z.cache[a.id] = BM.alleLoesungen(a)); }

  /* ---------------- Auftragsleiste ---------------- */
  function baueLeiste() {
    var html = "";
    ["foto", "video"].forEach(function (kamera) {
      html += '<div class="gruppe" role="group" aria-label="' + (kamera === "foto" ? "Fotokamera" : "Videokamera") + '">' +
        '<div class="gruppe-kopf">' + poly(kamera, false) + (kamera === "foto" ? "Fotokamera" : "Videokamera") +
        '<span class="form">· ' + (kamera === "foto" ? "Dreieck" : "Fünfeck") + "</span></div>" +
        '<div class="gruppe-knoepfe">';
      BM.AUFTRAEGE.filter(function (a) { return a.kamera === kamera; }).forEach(function (a) {
        var t = TEXT[a.id];
        html += '<button type="button" class="tab" data-auftrag="' + a.id + '" aria-current="false">' +
          '<span class="nr">' + a.nr + "</span>" +
          ikon(a.ort === "see" ? I.sonne : I.studio, 'class="ort-icon"') +
          '<span class="tab-text">' + t.tab + "<small>" + t.klein + "</small></span>" +
          '<span class="erledigt" title="geschafft">' + ikon(I.haken) + "</span></button>";
      });
      html += "</div></div>";
    });
    $("auftraege").innerHTML = html;
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (b) {
      b.addEventListener("click", function () { setzeAuftrag(b.getAttribute("data-auftrag")); });
    });
  }
  function aktualisiereLeiste() {
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (b) {
      var id = b.getAttribute("data-auftrag");
      b.setAttribute("aria-current", String(id === z.auftrag));
      b.classList.toggle("ist-geloest", !!z.geloest[id]);
      var t = TEXT[id], nr = BM.AUFTRAEGE.filter(function (a) { return a.id === id; })[0].nr;
      b.setAttribute("aria-label", "Auftrag " + nr + ": " + t.titel + (z.geloest[id] ? " – geschafft" : ""));
    });
  }

  /* ---------------- Szene aufbauen ---------------- */
  var kornUrl = (function () {
    try {
      var c = document.createElement("canvas"); c.width = c.height = 180;
      var x = c.getContext("2d"), d = x.createImageData(180, 180);
      for (var i = 0; i < d.data.length; i += 4) {
        var v = 128 + (Math.random() - 0.5) * 230, ch = (Math.random() - 0.5) * 50;
        d.data[i] = klemme(v + ch, 0, 255); d.data[i + 1] = klemme(v, 0, 255); d.data[i + 2] = klemme(v - ch, 0, 255); d.data[i + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      return c.toDataURL();
    } catch (e) { return ""; }
  })();

  function baueSzene(a) {
    var key = a.ort + "/" + a.kamera;
    if (z.szene === key) return;
    z.szene = key;
    var sz = SZ.SZENEN[a.ort];
    $("eFern").innerHTML = sz.fern;
    $("eMitte").innerHTML = sz.mitte;
    $("eVorn").innerHTML = sz.vorn;
    $("ePerson").innerHTML = SZ.person(a.kamera);
    $("eBokeh").innerHTML = sz.bokeh.map(function (b, i) {
      return '<circle data-i="' + i + '" cx="' + b.x + '" cy="' + b.y + '" r="1" fill="' + b.farbe + '" fill-opacity=".42" stroke="' + b.farbe + '" stroke-opacity=".7" stroke-width="2" opacity="0"/>';
    }).join("");
    if (a.kamera === "foto") {
      var n = "";
      for (var k = 0; k < 6; k++) n += '<use href="#p-unterarm-form" opacity="0"/>';
      $("p-nachzieher").innerHTML = n;
    }
    $("bild").setAttribute("data-kamera", a.kamera);
    $("korn").style.backgroundImage = kornUrl ? "url(" + kornUrl + ")" : "none";
    var g = SZ.GESICHT, af = $("af");
    af.style.left = ((g.x - g.r - 16) / 16) + "%";
    af.style.top = ((g.y - g.r - 18) / 9) + "%";
    af.style.width = ((2 * g.r + 32) / 16) + "%";
    af.style.height = ((2 * g.r + 36) / 9) + "%";
  }

  /* MM-Skala einmal bauen: −2 … +2 in Drittelschritten */
  (function () {
    var h = "";
    for (var t = -6; t <= 6; t++) {
      h += '<i class="t' + (t % 3 === 0 ? " gross" : "") + (t === 0 ? " null" : "") + '" style="left:' + ((t + 6) / 12 * 100) + '%"></i>';
    }
    $("mmSkala").innerHTML = h + '<i class="zeiger" id="mmZeiger"></i>';
  })();

  /* ---------------- Bild zeichnen ---------------- */
  function zeichne(a, s, r) {
    var breite = $("bild").clientWidth || 800;
    var k = breite / 1600 * 3.2;
    $("eFern").style.filter = "blur(" + (r.dof * k).toFixed(2) + "px)";
    $("eMitte").style.filter = "blur(" + (r.dof * 0.6 * k).toFixed(2) + "px)";
    $("eVorn").style.filter = "blur(" + (r.dof * 0.5 * k + breite / 1600 * 2.5).toFixed(2) + "px)";

    /* Bokeh: Lichtpunkte werden mit offener Blende zu Scheiben */
    var pts = SZ.SZENEN[a.ort].bokeh;
    var sicht = klemme((r.dof - 1) / 5, 0, 1);
    Array.prototype.forEach.call($("eBokeh").querySelectorAll("circle"), function (c) {
      var b = pts[+c.getAttribute("data-i")];
      c.setAttribute("r", (b.r * (0.35 + r.dof / 7 * 1.9)).toFixed(1));
      c.setAttribute("opacity", (b.staerke * sicht).toFixed(2));
    });

    /* Bewegung – dieselbe Zahl, aus der auch die Marke „Hand eingefroren" folgt */
    var wisch = $("p-wisch-b");
    if (a.kamera === "foto") {
      if (wisch) wisch.setAttribute("stdDeviation", (r.bew * 2.6).toFixed(2) + " " + (r.bew * 0.8).toFixed(2));
      var kb = $("p-koerper-b"); if (kb) kb.setAttribute("stdDeviation", (r.bew * 0.35).toFixed(2) + " 0");
      var uses = $("p-nachzieher") ? $("p-nachzieher").querySelectorAll("use") : [];
      var stufen = [-3, -2, -1, 1, 2, 3];
      Array.prototype.forEach.call(uses, function (u, i) {
        var n = stufen[i], w = n * r.bew * 1.25;
        u.setAttribute("transform", "rotate(" + w.toFixed(2) + " " + SZ.ELLBOGEN.x + " " + SZ.ELLBOGEN.y + ")");
        u.setAttribute("opacity", r.bew < 0.5 ? "0" : (0.3 - Math.abs(n) * 0.06).toFixed(2));
      });
    } else if (wisch) {
      wisch.setAttribute("stdDeviation", (r.bew * 2.6).toFixed(2) + " 0");
    }

    /* Belichtung: Helligkeit in Blendenstufen, Lichter laufen aus */
    var f = r.fehler;
    var hell = Math.pow(2, f / 2.8), sat = 1, kon = 1;
    if (f > 0) { sat = Math.max(0.55, 1 - f * 0.08); kon = Math.max(0.82, 1 - f * 0.04); }
    if (f < 0) { sat = Math.max(0.7, 1 + f * 0.06); kon = Math.min(1.15, 1 - f * 0.03); }
    $("belichtung").style.filter = "brightness(" + hell.toFixed(3) + ") contrast(" + kon.toFixed(3) + ") saturate(" + sat.toFixed(3) + ")";

    $("korn").style.opacity = (r.rausch * r.rausch * 0.35).toFixed(3);
  }

  function hudBlende(i) { var n = BM.AP[i]; return "F" + (n < 10 ? n.toFixed(1) : String(n)); }

  function timecode() {
    if (!z.tcStart) return "00:00:00:00";
    var ms = performance.now() - z.tcStart, fr = Math.floor(ms / 40);
    var ff = fr % 25, ss = Math.floor(fr / 25) % 60, mm = Math.floor(fr / 1500) % 60;
    function p(x) { return (x < 10 ? "0" : "") + x; }
    return "00:" + p(mm) + ":" + p(ss) + ":" + p(ff);
  }

  function hud(a, s, r) {
    var video = a.kamera === "video";
    var modus = '<span class="m">M</span>' + (video ? "4K 25p" : "FOTO");
    if (video) modus += r.geloest ? ' <span class="rec"><i></i>REC <span id="tc">' + timecode() + "</span></span>" : ' <span class="stby">STBY</span>';
    if ($("hudModus").getAttribute("data-m") !== modus.replace(/<span id="tc">.*?<\/span>/, "")) {
      $("hudModus").innerHTML = modus;
      $("hudModus").setAttribute("data-m", modus.replace(/<span id="tc">.*?<\/span>/, ""));
    }
    $("hudZeit").textContent = "1/" + BM.SH[r.j];
    $("hudBlende").textContent = hudBlende(s.ap);
    $("hudIso").textContent = "ISO " + BM.IS[s.is];
    $("mmWert").textContent = "MM " + BM.mmText(r.fehler3);
    $("mmZeiger").style.left = ((klemme(r.fehler3, -6, 6) + 6) / 12 * 100) + "%";
    document.querySelector(".hud").classList.toggle("blinkt", Math.abs(r.fehler3) > 6);

    var ziele = [[r.expoOK, I.sonne], [r.dofOK, I.blende], [r.bewOK, video ? I.schloss : I.hand]];
    $("hudZiele").innerHTML = ziele.map(function (x) { return '<b class="' + (x[0] ? "ok" : "") + '">' + ikon(x[1]) + "</b>"; }).join("");
    $("bild").classList.toggle("ist-geloest", r.geloest);
  }

  /* Laufender Timecode im Videomodus, sobald aufgenommen wird */
  setInterval(function () { var tc = $("tc"); if (tc) tc.textContent = timecode(); }, 40);

  /* Bildrauschen „lebt" im Video */
  setInterval(function () {
    if (z.szene && z.szene.indexOf("video") > 0 && +$("korn").style.opacity > 0.02) {
      $("korn").style.backgroundPosition = Math.floor(Math.random() * 180) + "px " + Math.floor(Math.random() * 180) + "px";
    }
  }, 70);

  /* ---------------- Regler bauen ---------------- */
  function reglerHTML(key, a) {
    var R = REGLER[key], s = einst();
    var fest = a.kamera === "video" && key === "sh";
    var marken = "";
    for (var i = 0; i < R.n; i++) {
      var voll = R.voll.indexOf(i) >= 0;
      marken += '<i class="' + (voll ? "voll" : "") + '" style="--p:' + (i / (R.n - 1)) + '"></i>';
      if (voll) marken += '<span class="' + (R.kurz && R.kurz.indexOf(i) < 0 ? "lang" : "") + '" style="--p:' + (i / (R.n - 1)) + '">' + R.marke(i) + "</span>";
    }
    return '<div class="regler" data-regler="' + key + '">' +
      '<div class="regler-kopf">' +
        '<label for="r-' + key + '">' + R.name + (fest ? ' <span class="fest-etikett">fest</span>' : "") + "</label>" +
        '<output id="o-' + key + '" for="r-' + key + '"></output>' +
        '<button type="button" class="info-knopf" data-info="' + key + '" aria-expanded="false" aria-controls="w-' + key + '" aria-label="Was macht ' + (key === "is" ? "der ISO-Wert" : key === "nd" ? "der ND-Filter" : key === "li" ? "das Studiolicht" : "die " + R.name) + '?">i</button>' +
      "</div>" +
      '<div class="regler-zeile">' +
        (fest ? '<span class="schritt-platz" aria-hidden="true">' + ikon(I.schloss) + "</span>" : '<button type="button" class="schritt" data-regler="' + key + '" data-d="-1" aria-label="' + R.weniger + '">' + ikon(I.links) + "</button>") +
        '<div class="spur ' + (R.heller > 0 ? "heller-rechts" : "dunkler-rechts") + '">' +
          '<input type="range" id="r-' + key + '" min="0" max="' + (R.n - 1) + '" step="1" value="' + (fest ? BM.SH_VIDEO : s[key]) + '"' + (fest ? " disabled" : "") + ">" +
          '<div class="marken" aria-hidden="true">' + marken + "</div>" +
        "</div>" +
        (fest ? '<span class="schritt-platz" aria-hidden="true"></span>' : '<button type="button" class="schritt" data-regler="' + key + '" data-d="1" aria-label="' + R.mehr + '">' + ikon(I.rechts) + "</button>") +
      "</div>" +
      (fest ? '<div class="gesperrt">Fest bei 25 Bildern pro Sekunde – warum, steht hinter dem <b>i</b>.</div>' : "") +
      '<div class="wissen" id="w-' + key + '" hidden></div>' +
      "</div>";
  }

  function baueRegler(a) {
    var r = reglerFuer(a);
    $("slotVor").innerHTML = r.vor.map(function (k) { return reglerHTML(k, a); }).join("");
    $("slotKamera").innerHTML = r.kamera.map(function (k) { return reglerHTML(k, a); }).join("");
    $("gVor").hidden = a.kamera === "foto";
    $("sonneFest").hidden = !(a.kamera === "video" && a.ort === "see");
    $("gKameraH").hidden = a.kamera === "foto";

    $("rPoly").innerHTML = poly(a.kamera, false);
    if (a.kamera === "foto") {
      $("rTitel").textContent = "Das Belichtungsdreieck";
      $("rSub").textContent = "Drei Stellschrauben, alle frei.";
    } else {
      $("rTitel").textContent = "Das Belichtungsfünfeck";
      $("rSub").textContent = a.ort === "studio"
        ? "Licht und ND-Filter vor dem Objektiv, Blende und ISO in der Kamera – die Zeit ist fest."
        : "Sonne und Zeit sind fest. Es bleiben ND-Filter, Blende und ISO.";
    }

    Array.prototype.forEach.call(document.querySelectorAll(".regler input[type=range]"), function (inp) {
      var key = inp.id.slice(2);
      inp.addEventListener("input", function () { aendere(key, +inp.value); });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".schritt"), function (b) {
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-regler");
        aendere(key, klemme(einst()[key] + +b.getAttribute("data-d"), 0, REGLER[key].n - 1));
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll(".info-knopf"), function (b) {
      b.addEventListener("click", function () { schalteInfo(b.getAttribute("data-info")); });
    });
  }

  function aktualisiereRegler(a, s) {
    Object.keys(REGLER).forEach(function (key) {
      var inp = $("r-" + key); if (!inp) return;
      var fest = a.kamera === "video" && key === "sh";
      var v = fest ? BM.SH_VIDEO : s[key];
      if (+inp.value !== v) inp.value = v;
      var txt = REGLER[key].wert(v);
      $("o-" + key).textContent = txt;
      inp.setAttribute("aria-valuetext", key === "is" ? "ISO " + txt : txt);
      Array.prototype.forEach.call(document.querySelectorAll('.schritt[data-regler="' + key + '"]'), function (b) {
        var d = +b.getAttribute("data-d");
        b.disabled = (d < 0 && v <= 0) || (d > 0 && v >= REGLER[key].n - 1);
      });
    });
  }

  /* ---------------- Eingabe ---------------- */
  function aendere(key, neu) {
    var s = einst();
    if (s[key] === neu) return;
    s[key] = neu;
    aktualisiere();
  }

  /* ---------------- Ziele, Hinweis, Geschafft ---------------- */
  function baueZiele(a) {
    var video = a.kamera === "video";
    var z3 = [
      { id: "expo", titel: "Richtig belichtet", info: true },
      { id: "dof", titel: "Hintergrund unscharf" },
      { id: "bew", titel: video ? "Zeit bleibt bei 1/50 s" : "Hand eingefroren" }
    ];
    $("ziele").innerHTML = z3.map(function (x) {
      return '<li class="ziel" data-ziel="' + x.id + '"><span class="zs">' + ikon(video && x.id === "bew" ? I.schloss : I.haken) + "</span>" +
        '<span class="zt"><b>' + x.titel + "</b><span></span></span>" +
        (x.info ? '<button type="button" class="info-knopf" data-info="mm" aria-expanded="false" aria-controls="wissen-mm" aria-label="Was zeigt die Belichtungsanzeige MM?">i</button>' : "") +
        "</li>";
    }).join("");
    $("ziele").querySelector(".info-knopf").addEventListener("click", function () { schalteInfo("mm"); });
  }

  function zieleAktualisieren(a, s, r) {
    var video = a.kamera === "video", mm = "MM " + BM.mmText(r.fehler3);
    var zeilen = {
      expo: [r.expoOK ? "ok" : "", r.expoOK
        ? (r.fehler3 === 0 ? mm + " – genau richtig" : mm + " – ein Klick daneben, noch im grünen Bereich")
        : (Math.abs(r.fehler3) > 6 ? "MM blinkt – viel zu " + (r.fehler3 > 0 ? "hell" : "dunkel") : mm + " – zu " + (r.fehler3 > 0 ? "hell" : "dunkel"))],
      dof: [r.dofOK ? "ok" : "", BM.blendeText(s.ap) + (r.dofOK ? " – der Hintergrund verschwimmt" : " – der Hintergrund ist noch zu deutlich")],
      bew: video ? ["fest", "fest bei 25 Bildern pro Sekunde"]
                 : [r.bewOK ? "ok" : "", BM.zeitText(s.sh) + (r.bewOK ? " – die Hand steht" : " – die Hand verwischt")]
    };
    Object.keys(zeilen).forEach(function (id) {
      var li = $("ziele").querySelector('[data-ziel="' + id + '"]');
      li.className = "ziel " + zeilen[id][0];
      li.querySelector(".zt span").textContent = zeilen[id][1];
    });
  }

  function hinweisText(a, s, r) {
    var video = a.kamera === "video", zu = BM.stufenText(r.fehler3);
    var maxSh = BM.SH.length - 1, maxIs = BM.IS.length - 1, maxNd = BM.ND.length - 1;
    function belichtung() {
      if (r.expoOK) return "";
      if (r.fehler3 > 0) {
        if (!video) {
          if (s.is > 0 && s.sh < maxSh) return "Zu hell um " + zu + ". Geh mit dem <b>ISO herunter</b> oder nimm eine noch <b>kürzere Zeit</b>.";
          if (s.is > 0) return "Zu hell um " + zu + ". Geh mit dem <b>ISO herunter</b>.";
          if (s.sh < maxSh) return "Zu hell um " + zu + ", und der ISO ist schon ganz unten. Nimm eine <b>kürzere Zeit</b>.";
          return "Zu hell, obwohl ISO und Zeit am Anschlag sind. Schließ die Blende ein Stück – aber nicht weiter als f/5.6.";
        }
        if (a.ort === "see") {
          if (s.nd < maxNd) return "Zu hell um " + zu + " – und die Sonne kannst du nicht dimmen. Nimm das Licht <b>vor dem Objektiv</b> weg: mit dem <b>ND-Filter</b>.";
          return "Zu hell, und der ND-Filter ist am Anschlag. Geh mit dem <b>ISO herunter</b>.";
        }
        return "Zu hell um " + zu + ". Die Zeit bleibt, wo sie ist – nimm Licht weg: <b>Studiolicht dimmen</b>, <b>ND-Filter</b> rein oder <b>ISO herunter</b>.";
      }
      if (!video) return "Zu dunkel um " + zu + ". <b>ISO hoch</b> oder die Blende weiter öffnen. Eine längere Zeit ginge auch – aber nur bis 1/125 s, sonst verwischt die Hand.";
      if (a.ort === "see") return "Zu dunkel um " + zu + ". <b>ND-Filter zurücknehmen</b> oder <b>ISO hoch</b>.";
      return "Zu dunkel um " + zu + ". <b>Mehr Studiolicht</b>, ND-Filter zurücknehmen oder ISO hoch.";
    }
    /* Liegt die Belichtung ganz daneben, sieht man sonst nichts: dann zuerst sie.
       Sonst erst gestalten (Blende, Zeit), dann ausgleichen. */
    if (Math.abs(r.fehler3) > 6) return "Das Bild ist so " + (r.fehler3 > 0 ? "hell" : "dunkel") + ", dass die Anzeige blinkt. " + belichtung();
    if (!r.dofOK) return "Der Hintergrund ist noch zu scharf. <b>Öffne die Blende</b> – f/5.6 oder eine kleinere Zahl. Das zusätzliche Licht gleichst du danach aus.";
    if (!r.bewOK) return "Die winkende Hand verwischt. Nimm eine <b>kürzere Belichtungszeit</b> – ab 1/125 s steht sie. Das fehlende Licht holst du danach zurück.";
    return belichtung();
  }

  function loesungsText(a, s) {
    var t = BM.blendeText(s.ap);
    if (a.kamera === "foto") return t + " · " + BM.zeitText(s.sh) + " · ISO " + BM.IS[s.is];
    t += " · ISO " + BM.IS[s.is];
    if (s.nd > 0) t += " · ND " + BM.ND_DICHTE[s.nd];
    if (a.ort === "studio" && BM.LICHT[s.li] !== 0) t += " · Licht " + (BM.LICHT[s.li] > 0 ? "+" : "−") + Math.abs(BM.LICHT[s.li]);
    return t;
  }

  /* Vorschlag für einen anderen Weg: eine Stellschraube eine ganze Stufe weiter,
     und es gibt eine gültige Lösung, die sich nur in einer zweiten unterscheidet. */
  function vorschlag(a, s, r) {
    var L = loesungenVon(a), frei = verstellbar(a);
    var gefunden = {}; z.loesungen[a.id].forEach(function (x) { gefunden[x.key] = 1; });
    var K = [];
    if (r.rausch >= 0.75) K.push({ k: "is", d: -3, t: "Bei ISO " + BM.IS[s.is] + " rauscht es sichtbar. Schaffst du dasselbe Bild mit einer ganzen Stufe <b>weniger ISO</b>?" });
    if (a.kamera === "foto") {
      K.push({ k: "ap", d: -3, t: "<b>Öffne die Blende</b> um eine ganze Stufe – drei Klicks. Womit holst du das zusätzliche Licht wieder heraus?" });
      K.push({ k: "sh", d: 3, t: "Nimm eine ganze Stufe <b>kürzere Zeit</b>. Welche Stellschraube gleicht das aus?" });
      K.push({ k: "is", d: -3, t: "<b>Senk den ISO</b> um eine ganze Stufe. Wo holst du das Licht stattdessen her?" });
      K.push({ k: "ap", d: 3, t: "<b>Schließ die Blende</b> um eine ganze Stufe – der Hintergrund soll trotzdem weich bleiben. Was gleichst du aus?" });
      K.push({ k: "sh", d: -3, t: "Nimm eine ganze Stufe <b>längere Zeit</b>, ohne dass die Hand verwischt. Was gleichst du aus?" });
      K.push({ k: "is", d: 3, t: "<b>Heb den ISO</b> um eine ganze Stufe. Wo nimmst du das Licht wieder weg?" });
    } else {
      K.push({ k: "ap", d: -3, t: "<b>Öffne die Blende</b> um eine ganze Stufe – drei Klicks. Wie bleibt das Bild trotzdem richtig belichtet?" });
      K.push({ k: "is", d: -3, t: "<b>Senk den ISO</b> um eine ganze Stufe. Wo holst du das Licht stattdessen her?" });
      K.push({ k: "nd", d: -1, t: "Nimm den <b>ND-Filter</b> eine Stufe zurück. Womit gleichst du aus?" });
      K.push({ k: "li", d: -1, t: "<b>Dimm das Studiolicht</b> um eine Stufe. Was änderst du dafür an der Kamera?" });
      K.push({ k: "nd", d: 1, t: "Setz eine Stufe <b>mehr ND-Filter</b> ein. Welche Stellschraube gleicht das aus?" });
      K.push({ k: "ap", d: 3, t: "<b>Schließ die Blende</b> um eine ganze Stufe – der Hintergrund soll trotzdem weich bleiben. Was gleichst du aus?" });
    }
    for (var i = 0; i < K.length; i++) {
      var c = K[i];
      if (frei.indexOf(c.k) < 0) continue;
      var v = s[c.k] + c.d;
      if (v < 0 || v > REGLER[c.k].n - 1) continue;
      var treffer = L.some(function (x) {
        if (x[c.k] !== v || gefunden[BM.schluessel(a, x)]) return false;
        return frei.filter(function (q) { return q !== c.k && x[q] !== s[q]; }).length === 1;
      });
      if (treffer) return c.t;
    }
    return null;
  }

  function naechsterAuftrag() {
    var ids = BM.AUFTRAEGE.map(function (a) { return a.id; }), i = ids.indexOf(z.auftrag);
    for (var n = 1; n <= ids.length; n++) {
      var id = ids[(i + n) % ids.length];
      if (!z.geloest[id]) return id;
    }
    return null;
  }

  function zeigeGeschafft(a, s, r) {
    var box = $("geschafft");
    var anzahl = z.loesungen[a.id].length;
    var schl = a.id + "|" + z.loesungen[a.id].map(function (x) { return x.key; }).join(",") + "|" + BM.schluessel(a, s);
    if (box.getAttribute("data-stand") === schl) return;
    box.setAttribute("data-stand", schl);

    var satz = a.kamera === "foto" ? "Richtig belichtet, Hintergrund weich, die Hand steht." : "Richtig belichtet, Hintergrund weich – und die Zeit ist unangetastet.";
    var vs = vorschlag(a, s, r);
    var weiter = naechsterAuftrag();
    var html = "<h3>" + ikon(I.haken) + "Geschafft</h3><p>" + satz + "</p>";
    if (vs) html += '<p class="noch">Das ist nicht die einzige richtige Einstellung. ' + vs + "</p>";
    html += '<p class="loesungen-titel">' + (anzahl === 1 ? "Deine Lösung" : "Deine " + anzahl + " Lösungen") + "</p>";
    html += '<ul class="loesungen">' + z.loesungen[a.id].map(function (x) { return "<li>" + x.text + "</li>"; }).join("") + "</ul>";
    if (weiter) {
      var n = BM.AUFTRAEGE.filter(function (x) { return x.id === weiter; })[0];
      html += '<button type="button" class="knopf" id="btnWeiter">Weiter: Auftrag ' + n.nr + " – " + TEXT[weiter].titel + ikon(I.weiter) + "</button>";
    } else {
      html += "<p><b>Alle vier Aufträge geschafft.</b> Du kannst jederzeit zurück und andere Wege ausprobieren.</p>";
    }
    box.innerHTML = html;
    if (weiter) $("btnWeiter").addEventListener("click", function () { setzeAuftrag(weiter); window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------------- Wissenskarten ---------------- */
  function schalteInfo(key) {
    z.info = z.info === key ? null : key;
    Array.prototype.forEach.call(document.querySelectorAll(".info-knopf"), function (b) {
      b.setAttribute("aria-expanded", String(b.getAttribute("data-info") === z.info));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".wissen"), function (w) { w.hidden = true; });
    if (z.info) {
      var w = $(z.info === "mm" ? "wissen-mm" : "w-" + z.info);
      if (w) { w.hidden = false; w.innerHTML = wissen(z.info); }
    }
  }

  function wissenAktualisieren() {
    if (!z.info) return;
    var w = $(z.info === "mm" ? "wissen-mm" : "w-" + z.info);
    if (w && !w.hidden) w.innerHTML = wissen(z.info);
  }

  function karte(bild, unterschrift, titel, absaetze) {
    return '<figure class="wissen-bild">' + bild + "<figcaption>" + unterschrift + "</figcaption></figure>" +
      "<div><h4>" + titel + "</h4>" + absaetze.join("") + "</div>";
  }
  function p(label, text) { return "<p>" + (label ? '<span class="label">' + label + "</span>" : "") + text + "</p>"; }
  function jetzt(text) { return '<p class="jetzt">' + text + "</p>"; }

  function wissen(key) {
    var a = auftrag(), s = einst(), r = BM.rechne(a, s), video = a.kamera === "video";

    if (key === "ap") {
      var N = BM.AP[s.ap], ro = 34 * 2.8 / N, hex = "";
      for (var i = 0; i < 6; i++) { var w = Math.PI / 3 * i + Math.PI / 6; hex += (i ? " " : "") + (55 + ro * Math.cos(w)).toFixed(1) + "," + (40 + ro * Math.sin(w)).toFixed(1); }
      var nah = 44 - 3 - s.ap * 0.9, fern = Math.min(104, 44 + 5 + Math.pow(s.ap / 15, 1.5) * 58);
      var bild = '<svg viewBox="0 0 110 104"><defs><filter id="wb-f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + (r.dof * 0.45).toFixed(2) + '"/></filter></defs>' +
        '<circle cx="55" cy="40" r="37" fill="#2b2f36"/><circle cx="55" cy="40" r="35" fill="#3a404a"/>' +
        '<polygon points="' + hex + '" fill="#ffe7ad"/>' +
        '<rect x="4" y="92" width="102" height="8" rx="4" fill="#efe9df"/>' +
        '<rect x="' + nah.toFixed(1) + '" y="92" width="' + (fern - nah).toFixed(1) + '" height="8" rx="4" fill="#9fd1ae"/>' +
        '<circle cx="44" cy="84" r="5" fill="#e8743b"/><rect x="41" y="88" width="6" height="8" rx="2" fill="#e8743b"/>' +
        '<g filter="url(#wb-f)"><circle cx="96" cy="80" r="8" fill="#4f9660"/><rect x="94.5" y="86" width="3" height="8" fill="#8a5a3b"/></g></svg>';
      return karte(bild, BM.blendeText(s.ap) + "<br>grün = scharfer Bereich",
        "Blende – die Öffnung im Objektiv", [
          p("Licht", "Kleine Zahl = große Öffnung = viel Licht. Von einer ganzen Stufe zur nächsten (f/4 → f/5.6) halbiert sich das Licht."),
          p("Nebenwirkung", "Je offener die Blende, desto schmaler der Bereich, der scharf ist. Der Hintergrund verschwimmt, die Person hebt sich ab."),
          jetzt(r.dofOK ? "Bei <b>" + BM.blendeText(s.ap) + "</b> ist der scharfe Bereich schmal – der Hintergrund ist weich."
                        : "Bei <b>" + BM.blendeText(s.ap) + "</b> reicht die Schärfe weit nach hinten. Für einen weichen Hintergrund brauchst du hier f/5.6 oder offener."),
          p("", "Zwischen den ganzen Stufen liegen Drittelstufen (f/4.5, f/5). Im Kameradisplay steht die Blende als " + hudBlende(s.ap) + ".")
        ]);
    }

    if (key === "sh" && !video) {
      var spur = 4 + r.bew * 11, geister = "";
      for (var g = 1; g <= 4; g++) geister += '<circle cx="' + (80 - spur * g / 4).toFixed(1) + '" cy="34" r="12" fill="#f6d0ae" opacity="' + (r.bew < 0.5 ? 0 : 0.5 - g * 0.1).toFixed(2) + '"/>';
      var anteil = klemme((12 - BM.tv(s.sh)) / 7, 0.02, 1);
      var bild2 = '<svg viewBox="0 0 110 92">' +
        '<rect x="0" y="0" width="110" height="68" rx="8" fill="#e6f0f7"/>' + geister +
        '<circle cx="80" cy="34" r="12" fill="#f6d0ae" stroke="#e9b892" stroke-width="2"/>' +
        '<path d="M74 24v-8M79 22v-9M84 22v-8M88 25v-6" stroke="#f6d0ae" stroke-width="4.5" stroke-linecap="round"/>' +
        '<rect x="6" y="80" width="98" height="10" rx="5" fill="#efe9df"/>' +
        '<rect x="6" y="80" width="' + (98 * anteil).toFixed(1) + '" height="10" rx="5" fill="#c1651f"/></svg>';
      return karte(bild2, BM.zeitText(s.sh) + (r.bewOK ? " · steht" : " · verwischt") + "<br>Balken = wie lange offen",
        "Belichtungszeit – wie lange der Verschluss offen ist", [
          p("Licht", "Halbe Zeit = halbes Licht = eine Blende weniger (1/125 → 1/250 s)."),
          p("Nebenwirkung", "Was sich bewegt, während der Verschluss offen ist, zieht eine Spur. Kurze Zeiten frieren Bewegung ein – die winkende Hand steht hier ab 1/125 s."),
          jetzt(s.sh > BM.SH_FRIERT ? "Bei <b>" + BM.zeitText(s.sh) + "</b> steht die Hand. Noch kürzer ändert im Bild nichts mehr – es kommt nur weniger Licht an."
              : s.sh === BM.SH_FRIERT ? "Bei <b>1/125 s</b> steht die Hand gerade so."
              : "Bei <b>" + BM.zeitText(s.sh) + "</b> legt die Hand während der Belichtung ein Stück Weg zurück – sie verwischt."),
          p("", "Im Kameradisplay steht nur der Nenner: 250 heißt 1/250 s.")
        ]);
    }

    if (key === "sh" && video) {
      var streifen = "";
      for (var f = 0; f < 4; f++) {
        var x0 = 5 + f * 25.5;
        streifen += '<rect x="' + x0 + '" y="20" width="23" height="36" rx="3" fill="#fff" stroke="#c9c1b4"/>' +
                    '<rect x="' + x0 + '" y="20" width="11.5" height="36" rx="3" fill="#c1651f" opacity=".85"/>';
      }
      var bild3 = '<svg viewBox="0 0 110 76"><rect x="0" y="10" width="110" height="56" rx="6" fill="#2b2f36"/>' +
        (function () { var h = ""; for (var q = 0; q < 9; q++) h += '<rect x="' + (4 + q * 12) + '" y="13" width="6" height="4" rx="1" fill="#6a7380"/><rect x="' + (4 + q * 12) + '" y="59" width="6" height="4" rx="1" fill="#6a7380"/>'; return h; })() +
        streifen + '</svg>';
      return karte(bild3, "je Bild 1/25 s<br>orange = belichtet, 1/50 s", "Belichtungszeit beim Film – fest auf 1/50 s", [
        p("", "Bei 25 Bildern pro Sekunde steht für jedes Bild 1/25 s zur Verfügung. Belichtet wird davon die Hälfte: <b>1/50 s</b>."),
        p("Warum fest", "Die kleine Bewegungsunschärfe, die dabei entsteht, lässt Bewegung im Film flüssig wirken. Kürzer ruckelt es, länger verschmiert es."),
        jetzt(a.ort === "studio" ? "Deshalb bleibt die Zeit, wo sie ist. Das Licht regelst du über <b>Licht im Set, ND-Filter, Blende und ISO</b>."
                                 : "Deshalb bleibt die Zeit, wo sie ist – und die Sonne kannst du nicht dimmen. Es bleiben <b>ND-Filter, Blende und ISO</b>.")
      ]);
    }

    if (key === "is") {
      var bild4 = '<div style="position:relative;height:74px;border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#f3c9a4,#8aa3b5 60%,#44505e)">' +
        '<div style="position:absolute;inset:0;mix-blend-mode:overlay;background-size:120px;background-image:' + (kornUrl ? "url(" + kornUrl + ")" : "none") + ";opacity:" + (r.rausch * 0.9).toFixed(2) + '"></div></div>';
      return karte(bild4, "ISO " + BM.IS[s.is] + (r.rausch >= 0.75 ? " · körnig" : r.rausch >= 0.25 ? " · leichtes Korn" : " · sauber"),
        "ISO – wie stark das Signal verstärkt wird", [
          p("Licht", "Doppelter ISO-Wert = doppelt so hell = eine Blende mehr (400 → 800)."),
          p("Nebenwirkung", "Mit dem Bild wird auch das Rauschen verstärkt. Hohe Werte sehen körnig aus."),
          jetzt(r.rausch < 0.25 ? "Bei <b>ISO " + BM.IS[s.is] + "</b> ist das Bild sauber."
              : r.rausch < 0.75 ? "Bei <b>ISO " + BM.IS[s.is] + "</b> ist leichtes Korn zu sehen."
              : "Bei <b>ISO " + BM.IS[s.is] + "</b> rauscht es sichtbar. Wenn du das Licht woanders herholen kannst, ist das meist die bessere Wahl.")
        ]);
    }

    if (key === "nd") {
      var durch = Math.pow(2, -s.nd);
      var bild5 = '<svg viewBox="0 0 110 80">' +
        '<circle cx="18" cy="40" r="10" fill="#ffd24a"/><path d="M18 22v-6M18 64v-6M3 40H0M36 40h-3M7 29l-4-4M29 51l4 4M7 51l-4 4M29 29l4-4" stroke="#ffd24a" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M34 32h22M34 40h22M34 48h22" stroke="#ffd24a" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="62" cy="40" rx="7" ry="28" fill="#1e2530" opacity="' + (0.08 + (1 - durch) * 0.85).toFixed(2) + '" stroke="#4a5566" stroke-width="2"/>' +
        '<path d="M72 32h30M72 40h30M72 48h30" stroke="#ffd24a" stroke-width="' + Math.max(0.6, 4 * durch).toFixed(2) + '" stroke-linecap="round" opacity="' + Math.max(0.25, durch).toFixed(2) + '"/></svg>';
      return karte(bild5, s.nd === 0 ? "kein Filter" : "ND " + BM.ND_DICHTE[s.nd] + " · " + BM.ND_FAKTOR[s.nd] + " kommt an",
        "ND-Filter – eine Sonnenbrille fürs Objektiv", [
          p("Licht", "Ein neutralgrauer Filter vor dem Objektiv. Jede Stufe halbiert das Licht: 0,3 · 0,6 · 0,9 … oder 1/2 · 1/4 · 1/8 … – je eine Blende."),
          p("Nebenwirkung", "Im Bild ändert sich nur die Helligkeit. Schärfentiefe, Bewegung und Rauschen bleiben, wie sie sind – genau das macht ihn so nützlich, wenn die Zeit fest ist."),
          jetzt(s.nd === 0 ? "Gerade ist <b>kein Filter</b> drin."
                           : "Mit <b>ND " + BM.ND_DICHTE[s.nd] + "</b> kommt nur noch " + BM.ND_FAKTOR[s.nd] + " des Lichts an – " + BM.stufenText(3 * s.nd) + " weniger.")
        ]);
    }

    if (key === "li") {
      var st = BM.LICHT[s.li], strahl = "";
      for (var q2 = 0; q2 < 5; q2++) strahl += '<path d="M' + (38 + q2 * 9) + ' 42 L' + (22 + q2 * 17) + ' 76" stroke="#ffd24a" stroke-width="4" stroke-linecap="round" opacity="' + klemme(0.25 + (st + 3) / 6 * 0.75, 0.15, 1).toFixed(2) + '"/>';
      var bild6 = '<svg viewBox="0 0 110 80">' + strahl +
        '<path d="M34 8h42l8 34H26z" fill="#fbe2a6" stroke="#e9c47a" stroke-width="2"/><rect x="52" y="0" width="6" height="9" fill="#4a4038"/></svg>';
      return karte(bild6, BM.lichtText(s.li), "Licht im Set", [
        p("Licht", "Halb so hell = eine Blende weniger, doppelt so hell = eine Blende mehr. Im Studio dimmst du die Leuchten – draußen hast du diese Stellschraube nicht."),
        p("Wozu", "Mehr Licht im Set heißt: An der Kamera kannst du sparen – zum Beispiel mit niedrigerem ISO und damit weniger Rauschen."),
        jetzt("Gerade: <b>" + BM.lichtText(s.li) + "</b>" + (st === 0 ? " – so, wie das Set eingerichtet ist." : " gegenüber dem Grundlicht."))
      ]);
    }

    if (key === "mm") {
      var tick = "";
      for (var t = -6; t <= 6; t++) tick += '<rect x="' + (10 + (t + 6) * 7.5 - 0.6).toFixed(1) + '" y="' + (t % 3 === 0 ? 20 : 24) + '" width="1.2" height="' + (t % 3 === 0 ? 10 : 6) + '" fill="#1e2530"/>';
      var zx = 10 + (klemme(r.fehler3, -6, 6) + 6) * 7.5;
      var bild7 = '<svg viewBox="0 0 110 62"><rect x="0" y="6" width="110" height="52" rx="8" fill="#2b2f36"/>' +
        tick.replace(/#1e2530/g, "#ffffff") +
        '<text x="10" y="17" font-size="7.5" fill="#fff" font-family="monospace" text-anchor="middle">−2</text><text x="55" y="17" font-size="7.5" fill="#fff" font-family="monospace" text-anchor="middle">0</text><text x="100" y="17" font-size="7.5" fill="#fff" font-family="monospace" text-anchor="middle">+2</text>' +
        '<path d="M' + zx.toFixed(1) + ' 33 l-4 7 h8 z" fill="#ffd24a"/>' +
        '<text x="55" y="52" font-size="9" fill="#fff" font-family="monospace" text-anchor="middle" font-weight="700">MM ' + BM.mmText(r.fehler3) + "</text></svg>";
      return karte(bild7, r.expoOK ? "im grünen Bereich" : (r.fehler3 > 0 ? "zu hell" : "zu dunkel"),
        "MM – die Belichtungsanzeige der Kamera", [
          p("", "Unten im Display vergleicht die Kamera deine Einstellung mit der gemessenen Helligkeit – von −2.0 bis +2.0 in Drittelschritten. Liegt es weiter daneben, blinkt die Anzeige. Dieselbe Anzeige hat die FX30."),
          p("Ziel", "In der Regel <b>MM 0.0</b>. Hier zählt ±0.3 – ein Klick daneben – noch als richtig."),
          p("Achtung", "Die Kamera misst auf ein mittleres Grau. Sie weiß nicht, was vor dem Objektiv ist: Eine weiße Wand, die du auf 0.0 stellst, wird grau."),
          jetzt("Gerade: <b>MM " + BM.mmText(r.fehler3) + "</b>" + (Math.abs(r.fehler3) > 6 ? " – die Anzeige blinkt, du liegst mehr als zwei Blenden daneben." : "."))
        ]);
    }
    return "";
  }

  /* ---------------- Hauptablauf ---------------- */
  function aktualisiere() {
    var a = auftrag(), s = einst(), r = BM.rechne(a, s);
    aktualisiereRegler(a, s);
    zeichne(a, s, r);
    zieleAktualisieren(a, s, r);

    if (r.geloest) {
      var key = BM.schluessel(a, s);
      var neu = !z.loesungen[a.id].some(function (x) { return x.key === key; });
      if (neu) z.loesungen[a.id].push({ key: key, text: loesungsText(a, s) });
      if (!z.geloest[a.id]) {
        z.geloest[a.id] = true;
        var n = Object.keys(z.geloest).length;
        melde(n * 25, n >= BM.AUFTRAEGE.length ? "completed" : "incomplete");
        aktualisiereLeiste();
      }
      if (!z.warGeloest) {
        if (a.kamera === "foto") { var b = $("blitz"); b.classList.remove("an"); void b.offsetWidth; b.classList.add("an"); }
        else z.tcStart = performance.now();
      }
    } else if (a.kamera === "video") {
      z.tcStart = 0;
    }
    z.warGeloest = r.geloest;
    hud(a, s, r);

    var tipp = r.geloest ? "" : hinweisText(a, s, r);
    $("hinweis").hidden = !tipp;
    if (tipp) $("hinweis").innerHTML = ikon(I.tipp) + "<span>" + tipp + "</span>";
    $("geschafft").hidden = !r.geloest;
    if (r.geloest) zeigeGeschafft(a, s, r);

    $("bild").setAttribute("aria-label", "Simuliertes Kamerabild, " + TEXT[a.id].titel + ": " +
      (r.expoOK ? "richtig belichtet" : r.fehler3 > 0 ? "zu hell" : "zu dunkel") + ", Hintergrund " + (r.dofOK ? "unscharf" : "scharf") +
      (a.kamera === "foto" ? ", Hand " + (r.bewOK ? "eingefroren" : "verwischt") : ""));

    wissenAktualisieren();
  }

  function setzeAuftrag(id) {
    z.auftrag = id;
    var a = auftrag();
    z.info = null; z.warGeloest = true; /* kein Blitz beim bloßen Wechsel */
    $("geschafft").removeAttribute("data-stand");
    aktualisiereLeiste();
    baueSzene(a);
    baueRegler(a);
    baueZiele(a);
    $("wissen-mm").hidden = true;
    $("aKicker").textContent = "Auftrag " + a.nr + " · " + (a.kamera === "foto" ? "Fotokamera" : "Videokamera") + " · " + (a.ort === "see" ? "draußen" : "Studio");
    $("aTitel").textContent = TEXT[id].titel;
    $("aText").textContent = TEXT[id].text;
    var r = BM.rechne(a, einst());
    z.warGeloest = r.geloest;
    if (r.geloest && a.kamera === "video") z.tcStart = performance.now();
    aktualisiere();
  }

  /* ---------------- Einführung ---------------- */
  var gestartet = false;
  function zeigeSim() {
    $("intro").hidden = true; $("sim").hidden = false; $("btnIntro").hidden = false;
    if (!gestartet) { gestartet = true; setzeAuftrag(z.auftrag); }
    else aktualisiere();
    window.scrollTo(0, 0);
  }
  function zeigeIntro() {
    $("sim").hidden = true; $("intro").hidden = false; $("btnIntro").hidden = true;
    $("btnZurueck").hidden = !gestartet;
    $("btnStart").hidden = gestartet;
    window.scrollTo(0, 0);
  }
  $("introDreieck").innerHTML = poly("foto", true);
  $("introFuenfeck").innerHTML = poly("video", true);
  $("btnStart").addEventListener("click", zeigeSim);
  $("btnZurueck").addEventListener("click", zeigeSim);
  $("btnIntro").addEventListener("click", zeigeIntro);

  baueLeiste();

  /* Unschärfe hängt an der Bildbreite */
  if (window.ResizeObserver) {
    new ResizeObserver(function () { if (gestartet) { var a = auftrag(); zeichne(a, einst(), BM.rechne(a, einst())); } }).observe($("bild"));
  }
})();
