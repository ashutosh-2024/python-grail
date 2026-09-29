(function () {
  "use strict";

  var esc = window.esc;
  var hl = window.highlight;
  var entries = window.entries;

  var id = new URLSearchParams(location.search).get("id");
  var idx = entries.findIndex(function (e) { return e.id === id; });
  var root = document.getElementById("entry");

  if (idx === -1) {
    root.innerHTML =
      '<div class="entry-head"><h1>Entry not found</h1>' +
      '<p class="subtitle">no entry with that id</p></div>' +
      '<div class="entry-body"><p><a href="browse.html">&larr; Back to browse</a></p></div>';
    return;
  }

  var e = entries[idx];
  document.title = e.title + " — python-grail";

  function codeBlock(src, label) {
    return (label ? '<p class="code-label">' + label + "</p>" : "") +
           '<pre class="code"><code>' + hl(src) + "</code></pre>";
  }

  function outputBlock(src, isErr) {
    return '<p class="code-label">' +
             (isErr ? "output (ends in a traceback)" : "output") +
           "</p>" +
           '<pre class="code output' + (isErr ? " error" : "") + '"><code>' +
           esc(src) + "</code></pre>";
  }

  var html = "";

  /* ---- head ---- */
  html +=
    '<div class="entry-head">' +
      '<div class="meta">' +
        '<span class="num">' + String(e.num).padStart(2, "0") + "</span>" +
        '<span class="badge ' + e.difficulty + '">' + e.difficulty + "</span>" +
      "</div>" +
      "<h1>" + esc(e.title) + "</h1>" +
      '<p class="subtitle">' + esc(e.subtitle) + "</p>" +
      '<div class="tags">' +
        e.tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") +
      "</div>" +
    "</div>";

  html += '<div class="entry-body">';

  /* ---- the snippet ---- */
  html += '<p class="question-line">' + esc(e.question) + "</p>";

  html += codeBlock(e.code);

  /* ---- hidden answer ---- */
  html +=
    '<details class="reveal"><summary>Reveal the output</summary>' +
      '<div class="reveal-inner">' + outputBlock(e.output, e.isError) + "</div>" +
    "</details>";

  if (e.guesses && e.guesses.length) {
    html += '<ul class="guesses"><li>Common wrong answers: ' +
      e.guesses.join("</li><li>") + "</li></ul>";
  }

  /* ---- explanation ---- */
  html += "<h2>Why</h2>";
  html += e.explanation.map(function (p) { return "<p>" + p + "</p>"; }).join("");
  if (e.extraCode) html += codeBlock(e.extraCode);

  /* ---- fix ---- */
  if (e.fixCode) {
    html += "<h2>The fix</h2>";
    if (e.fixNote) html += "<p>" + e.fixNote + "</p>";
    html += codeBlock(e.fixCode);
  }

  /* ---- caveat ---- */
  if (e.caveat) {
    html += '<div class="caveat"><strong>Not a guarantee.</strong> ' + e.caveat + "</div>";
  }

  /* ---- takeaway ---- */
  if (e.takeaway) {
    html += '<div class="takeaway"><strong>Takeaway.</strong> ' + e.takeaway + "</div>";
  }

  /* ---- references ---- */
  if (e.refs && e.refs.length) {
    html += "<h2>References</h2><ul class=\"refs\">" +
      e.refs.map(function (r) {
        return '<li><a href="' + r.url + '" target="_blank" rel="noopener">' + r.label + "</a></li>";
      }).join("") + "</ul>";
  }

  /* ---- prev / next ---- */
  var prev = entries[idx - 1];
  var next = entries[idx + 1];
  html += '<div class="entry-nav">' +
    (prev ? '<a href="entry.html?id=' + encodeURIComponent(prev.id) + '">&larr; ' + esc(prev.title) + "</a>"
          : "<span></span>") +
    (next ? '<a href="entry.html?id=' + encodeURIComponent(next.id) + '">' + esc(next.title) + " &rarr;</a>"
          : "<span></span>") +
    "</div>";

  html += "</div>";

  root.innerHTML = html;
})();
