(function () {
  "use strict";

  var esc = window.esc;
  var hl = window.highlight;

  /* Hand-drawn approximation of the LeetCode mark. Swap in the official
     asset if you want it exact - this is here so the link is recognisable
     without shipping a trademarked file. */
  var LC_MARK =
    '<svg class="lc-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M14.6 1.9 7.1 9.4a3.7 3.7 0 0 0 0 5.2l7.5 7.5" ' +
        'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" ' +
        'stroke-linejoin="round" opacity=".55"/>' +
      '<path d="M10.4 12h11.2" stroke="#ffa116" stroke-width="2.6" ' +
        'stroke-linecap="round"/>' +
      '<path d="M4.4 12h2.9" stroke="currentColor" stroke-width="2.6" ' +
        'stroke-linecap="round" opacity=".55"/>' +
    "</svg>";

  function lcLink(p) {
    return '<a class="lc-link" href="' + p.url + '" target="_blank" rel="noopener">' +
      LC_MARK + "<span>Solve " + p.lc + " on LeetCode</span>" +
      '<span aria-hidden="true">&#8599;</span></a>';
  }
  window.LC_MARK = LC_MARK;
  window.lcLink = lcLink;

  /* ---------- locate the problem ---------- */
  var flat = [];
  (window.GRAIL_DSA || []).forEach(function (t) {
    t.sections.forEach(function (s) {
      s.problems.forEach(function (p) { flat.push(p); });
    });
  });

  var id = new URLSearchParams(location.search).get("id");
  var idx = flat.findIndex(function (p) { return p.id === id; });
  var root = document.getElementById("problem");

  if (idx === -1) {
    root.innerHTML =
      '<div class="prob-head"><h1>Problem not found</h1></div>' +
      '<div class="entry-body"><p><a href="dsa.html">&larr; Back to DSA</a></p></div>';
    return;
  }

  var p = flat[idx];
  document.title = p.lc + ". " + p.name + " — python-grail";

  var html = "";

  /* ---------- head ---------- */
  html +=
    '<div class="prob-head">' +
      '<p class="crumb"><a href="dsa.html">DSA</a> / ' +
        '<a href="dsa.html?topic=' + encodeURIComponent(p.topic) + '">' +
          esc(p.topicTitle) + "</a> / " + esc(p.sectionTitle) + "</p>" +
      '<div class="meta">' +
        '<span class="crumb">LeetCode ' + p.lc + "</span>" +
        '<span class="badge ' + p.difficulty + '">' + p.difficulty + "</span>" +
      "</div>" +
      "<h1>" + esc(p.name) + "</h1>" +
      '<div class="actions">' + lcLink(p) + "</div>" +
    "</div>";

  html += '<div class="entry-body">';

  /* ---------- framing ---------- */
  html += '<div class="framing">' +
    p.framing.map(function (t) { return "<p>" + t + "</p>"; }).join("") + "</div>";

  if (p.pitfall) {
    html += '<div class="pitfall"><strong>Common mistake.</strong> ' + p.pitfall + "</div>";
  }

  /* ---------- complexity summary ---------- */
  html += "<h2>At a glance</h2>" +
    '<table class="cx-table"><thead><tr>' +
      "<th>Approach</th><th>Time</th><th>Auxiliary space</th>" +
    "</tr></thead><tbody>" +
    p.approaches.map(function (a) {
      return '<tr class="' + (a.best ? "is-best" : "") + '">' +
        "<td>" + esc(a.name) + "</td>" +
        '<td class="cx">' + a.time + "</td>" +
        '<td class="cx">' + a.space + "</td>" +
      "</tr>";
    }).join("") +
    "</tbody></table>";

  /* ---------- each approach ---------- */
  html += "<h2>Approaches</h2>";
  html += p.approaches.map(function (a) {
    return '<div class="approach' + (a.best ? " is-best" : "") + '">' +
      '<div class="approach-head"><h3>' + esc(a.name) + "</h3>" +
        (a.best ? '<span class="pill star">pick this</span>' : "") +
        (a.tag ? '<span class="pill">' + esc(a.tag) + "</span>" : "") +
      "</div>" +
      '<div class="cx-inline">' +
        "<div><b>time</b><span>" + a.time + "</span></div>" +
        "<div><b>aux space</b><span>" + a.space + "</span></div>" +
      "</div>" +
      '<pre class="code"><code>' + hl(a.code) + "</code></pre>" +
      '<div class="why">' +
        a.why.map(function (t) { return "<p>" + t + "</p>"; }).join("") +
      "</div>" +
    "</div>";
  }).join("");

  /* ---------- the assertions the build ran ---------- */
  html +=
    '<details class="reveal" style="margin-top:22px">' +
      "<summary>What the build checked</summary>" +
      '<div class="reveal-inner">' +
        '<p class="code-label">every approach above was run against these</p>' +
        '<pre class="code"><code>' + hl(p.tests) + "</code></pre>" +
        '<p style="font-size:.9rem;color:var(--text-faint)">Shared helpers ' +
        "(<code>TreeNode</code>, <code>build</code>, <code>level_order</code>) come from a " +
        "prelude; see <code>content/dsa.py</code>.</p>" +
      "</div>" +
    "</details>";

  /* ---------- prev / next ---------- */
  var prev = flat[idx - 1], next = flat[idx + 1];
  html += '<div class="entry-nav">' +
    (prev ? '<a href="problem.html?id=' + encodeURIComponent(prev.id) + '">&larr; ' +
            esc(prev.name) + "</a>" : "<span></span>") +
    (next ? '<a href="problem.html?id=' + encodeURIComponent(next.id) + '">' +
            esc(next.name) + " &rarr;</a>" : "<span></span>") +
    "</div>";

  html += "</div>";
  root.innerHTML = html;
})();
