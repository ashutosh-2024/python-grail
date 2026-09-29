/* ---------- site config ---------- */
/* Used for the header + footer "GitHub" links. */
window.GRAIL_REPO = "https://github.com/ashutosh-2024/python-grail";

(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  window.esc = esc;

  /* ---------- python syntax highlighter ---------- */
  var KEYWORDS = "False|None|True|and|as|assert|async|await|break|class|continue|" +
    "def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|" +
    "nonlocal|not|or|pass|raise|return|try|while|with|yield";

  var BUILTINS = "abs|all|any|bool|bytes|callable|dict|dir|enumerate|filter|float|" +
    "frozenset|getattr|hasattr|id|int|isinstance|issubclass|iter|len|list|map|max|min|" +
    "next|object|open|print|range|repr|reversed|round|set|setattr|sorted|str|sum|super|" +
    "tuple|type|vars|zip|Exception|NameError|TypeError|ValueError|AttributeError|KeyError";

  var PY_RE = new RegExp([
    "(?<ps1>^(?:>>>|\\.\\.\\.)(?= |$))",
    "(?<com>#[^\\n]*)",
    "(?<str>[rbfuRBFU]{0,2}(?:\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'))",
    "(?<dec>@[A-Za-z_]\\w*)",
    "(?<defn>\\b(?:def|class)\\s+[A-Za-z_]\\w*)",
    "(?<num>\\b\\d[\\w.]*)",
    "(?<kw>\\b(?:" + KEYWORDS + ")\\b)",
    "(?<bi>\\b(?:" + BUILTINS + ")\\b)",
    "(?<fn>\\b[A-Za-z_]\\w*(?=\\())"
  ].join("|"), "gm");

  function highlight(src) {
    var out = "";
    var last = 0;
    var m;
    PY_RE.lastIndex = 0;
    while ((m = PY_RE.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      var g = m.groups;
      if (g.defn) {
        var parts = g.defn.split(/(\s+)/);
        out += '<span class="tok-kw">' + esc(parts[0]) + "</span>" +
               esc(parts[1]) +
               '<span class="tok-fn">' + esc(parts.slice(2).join("")) + "</span>";
      } else {
        var cls = g.ps1 ? "ps1" : g.com ? "com" : g.str ? "str" : g.dec ? "dec" :
                  g.num ? "num" : g.kw ? "kw" : g.bi ? "bi" : "fn";
        out += '<span class="tok-' + cls + '">' + esc(m[0]) + "</span>";
      }
      last = m.index + m[0].length;
    }
    out += esc(src.slice(last));
    return out;
  }
  window.highlight = highlight;

  /* ---------- entry helpers ---------- */
  window.entries = window.GRAIL_ENTRIES || [];

  window.countBy = function (level) {
    return window.entries.filter(function (e) { return e.difficulty === level; }).length;
  };

  window.entryCard = function (e) {
    return '<a class="entry-card" href="entry.html?id=' + encodeURIComponent(e.id) + '">' +
      '<span class="num">' + String(e.num).padStart(2, "0") + "</span>" +
      '<span class="body">' +
        '<span class="title">' + esc(e.title) + "</span><br>" +
        '<span class="subtitle">' + esc(e.subtitle) + "</span>" +
        '<span class="tags">' +
          e.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") +
        "</span>" +
      "</span>" +
      '<span class="badge ' + e.difficulty + '">' + e.difficulty + "</span>" +
    "</a>";
  };

  /* ---------- wire up chrome present on every page ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-repo-link]").forEach(function (a) {
      a.href = window.GRAIL_REPO;
    });
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });
})();
