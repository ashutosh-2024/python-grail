(function () {
  "use strict";

  var esc = window.esc;
  var hl = window.highlight;

  var LC_MARK =
    '<img class="lc-mark" src="assets/img/leetcode.png" alt="" aria-hidden="true">';

  function lcLink(p) {
    if (!p.url) return "";
    return '<a class="lc-link" href="' + p.url + '" target="_blank" rel="noopener">' +
      LC_MARK + "<span>Solve " + p.lc + " on LeetCode</span>" +
      '<span aria-hidden="true">&#8599;</span></a>';
  }

  function refLink(p) {
    if (!p.ref) return "";
    return '<a class="ref-link" href="' + p.ref.url + '" target="_blank" rel="noopener">' +
      "<span>" + esc(p.ref.label) + "</span>" +
      '<span aria-hidden="true">&#8599;</span></a>';
  }

  /* ---------- locate the problem ---------- */
  var flat = [];
  (window.GRAIL_DSA || []).forEach(function (t) {
    (t.problems || []).forEach(function (p) { flat.push(p); });
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
  var topicObj = (window.GRAIL_DSA || []).filter(function (t) {
    return t.id === p.topic;
  })[0] || {};
  var patternCrumb = topicObj.layout === "patterns"
    ? ' / <a href="dsa.html?topic=' + encodeURIComponent(p.topic) + "&amp;pattern=" +
        encodeURIComponent(p.section) + '">' + esc(p.sectionTitle) + "</a>"
    : "";
  document.title = (p.lc ? p.lc + ". " : "") + p.name + " — python-grail";

  var html = "";

  /* ---------- head ---------- */
  html +=
    '<div class="prob-head">' +
      '<p class="crumb"><a href="dsa.html">DSA</a> / ' +
        '<a href="dsa.html?topic=' + encodeURIComponent(p.topic) + '">' +
          esc(p.topicTitle) + "</a>" + patternCrumb + "</p>" +
      '<div class="meta">' +
        (p.lc ? '<span class="crumb">LeetCode ' + p.lc + "</span>" : "") +
        '<span class="badge ' + p.difficulty + '">' + p.difficulty + "</span>" +
        (p.premium ? '<span class="badge premium">premium</span>' : "") +
      "</div>" +
      "<h1>" + esc(p.name) + "</h1>" +
      (p.tags.length
        ? '<div class="tags">' + p.tags.map(function (t) {
            return '<span class="tag">' + esc(t) + "</span>";
          }).join("") + "</div>"
        : "") +
      (p.url || p.ref
        ? '<div class="actions">' + lcLink(p) + refLink(p) + "</div>"
        : "") +
    "</div>";

  html += '<div class="entry-body">';

  /* ---------- problem statement ---------- */
  html += "<h2>Problem</h2>";
  html += '<div class="statement">' +
    p.statement.map(function (t) { return "<p>" + t + "</p>"; }).join("") + "</div>";

  if (p.note) {
    html += '<div class="dsa-callout"><p>' + p.note + "</p></div>";
  }

  /* ---------- examples ---------- */
  if (p.examples.length) {
    html += "<h2>Examples</h2>";
    html += p.examples.map(function (ex, i) {
      var rows = "";
      if (ex.input) {
        rows += '<div class="io"><b>Input</b><code>' + esc(ex.input) + "</code></div>";
      }
      if (ex.output) {
        rows += '<div class="io"><b>Output</b><code>' + esc(ex.output) + "</code></div>";
      }
      if (ex.explanation) {
        rows += '<div class="io"><b>Why</b><span>' + esc(ex.explanation) + "</span></div>";
      }
      return '<div class="example"><span class="ex-n">Example ' + (i + 1) + "</span>" +
             rows + "</div>";
    }).join("");
  }

  /* ---------- constraints ---------- */
  if (p.constraints.length) {
    html += "<h2>Constraints</h2><ul class=\"constraints\">" +
      p.constraints.map(function (c) { return "<li>" + c + "</li>"; }).join("") +
      "</ul>";
  }

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
  // A DP problem carries a recurrence and is written as a ladder: plain
  // recursion first, then the recurrence it encodes, then each step that
  // makes it faster or smaller. Its explanations are short points.
  var ladder = !!p.recurrence;

  function points(list) {
    return ladder
      ? "<ul>" + list.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>"
      : list.map(function (t) { return "<p>" + t + "</p>"; }).join("");
  }

  function recurrenceBlock(r) {
    return '<div class="recurrence">' +
      "<h3>The recurrence</h3>" +
      '<p class="rec-label">State</p>' +
      '<p class="rec-state">' + r.state + "</p>" +
      ((r.derive || []).length
        ? '<p class="rec-label">How to derive it</p><ul>' +
            r.derive.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>"
        : "") +
      '<p class="rec-label">Recurrence relation</p>' +
      '<pre class="code rec-formula"><code>' + esc(r.formula) + "</code></pre>" +
      ((r.notes || []).length
        ? "<ul>" + r.notes.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>"
        : "") +
    "</div>";
  }

  html += "<h2>" + (ladder ? "From recursion to optimal" : "Solutions") + "</h2>";
  html += p.approaches.map(function (a, i) {
    var card = '<div class="approach' + (a.best ? " is-best" : "") + '">' +
      '<div class="approach-head">' +
        (ladder ? '<span class="step-no">Step ' + (i + 1) + "</span>" : "") +
        "<h3>" + esc(a.name) + "</h3>" +
        (a.best ? '<span class="pill star">pick this</span>' : "") +
        (a.tag ? '<span class="pill">' + esc(a.tag) + "</span>" : "") +
      "</div>" +
      (a.change
        ? '<div class="step-change"><b>What changed</b><span>' + a.change + "</span></div>"
        : "") +
      '<div class="cx-inline">' +
        "<div><b>time</b><span>" + a.time + "</span></div>" +
        "<div><b>aux space</b><span>" + a.space + "</span></div>" +
      "</div>" +
      '<pre class="code"><code>' + hl(a.code) + "</code></pre>" +
      '<div class="why">' + points(a.why) + "</div>" +
    "</div>";
    return card + (ladder && i === 0 ? recurrenceBlock(p.recurrence) : "");
  }).join("");

  /* ---------- the assertions the build ran ---------- */
  html +=
    '<details class="reveal" style="margin-top:22px">' +
      "<summary>What the build checked</summary>" +
      '<div class="reveal-inner">' +
        '<pre class="code"><code>' + hl(p.tests) + "</code></pre>" +
        (p.smallTests
          ? "<p>Plain recursion is exponential, so it is checked against this smaller set:</p>" +
            '<pre class="code"><code>' + hl(p.smallTests) + "</code></pre>"
          : "") +
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
