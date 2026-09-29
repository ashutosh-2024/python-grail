(function () {
  "use strict";

  var esc = window.esc;
  var topics = window.GRAIL_DSA || [];
  var root = document.getElementById("dsa");
  var wanted = new URLSearchParams(location.search).get("topic");

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  /* ---------- topic index: same card as Browse ---------- */
  function topicIndex() {
    document.title = "DSA — python-grail";

    root.innerHTML = '<div class="entry-list">' + topics.map(function (t, i) {
      var ready = t.count > 0;
      var right = ready
        ? '<span class="badge count">' + plural(t.count, "problem") + "</span>"
        : '<span class="badge planned">' +
            (t.target ? t.target + " planned" : "planned") + "</span>";

      return '<a class="entry-card" href="dsa.html?topic=' +
        encodeURIComponent(t.id) + '">' +
        '<span class="num">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="body">' +
          '<span class="title">' + esc(t.title) + "</span>" +
          (ready ? "<br><span class=\"subtitle\">" + esc(t.subtitle) + "</span>" : "") +
        "</span>" +
        right +
      "</a>";
    }).join("") + "</div>";
  }

  /* ---------- one topic ---------- */
  function topicPage(t) {
    document.title = t.title + " — DSA — python-grail";

    var head =
      '<p class="crumb-line"><a href="dsa.html">DSA</a> / ' + esc(t.title) + "</p>" +
      '<h2 class="topic-title">' + esc(t.title) + "</h2>" +
      '<p class="section-sub topic-sub">' + esc(t.subtitle) + "</p>";

    if (!t.sections.length) {
      root.innerHTML = head +
        '<div class="stub-note"><p>Not written up yet.</p>' +
        '<p><a href="dsa.html">&larr; Back to topics</a></p></div>';
      return;
    }

    var convention = (t.convention || []).length
      ? '<div class="dsa-callout">' +
          t.convention.map(function (p) { return "<p>" + p + "</p>"; }).join("") +
        "</div>"
      : "";

    var sections = t.sections.map(function (s, i) {
      var rows = s.problems.map(function (p) {
        return '<a class="entry-card" href="problem.html?id=' +
          encodeURIComponent(p.id) + '">' +
          '<span class="num">' + p.lc + "</span>" +
          '<span class="body">' +
            '<span class="title">' + esc(p.name) + "</span><br>" +
            '<span class="subtitle">' + plural(p.approaches.length, "approach")
              .replace("approachs", "approaches") + "</span>" +
          "</span>" +
          '<span class="badge ' + p.difficulty + '">' + p.difficulty + "</span>" +
        "</a>";
      }).join("");

      return '<section class="dsa-section">' +
        '<div class="dsa-section-head"><span class="idx">' +
          String(i + 1).padStart(2, "0") + "</span>" +
          "<h2>" + esc(s.title) + "</h2></div>" +
        '<div class="dsa-idea">' +
          s.idea.map(function (p) { return "<p>" + p + "</p>"; }).join("") +
        "</div>" +
        '<div class="entry-list">' + rows + "</div>" +
      "</section>";
    }).join("");

    root.innerHTML = head + convention + sections;
  }

  var topic = wanted && topics.filter(function (t) { return t.id === wanted; })[0];
  if (wanted && !topic) {
    root.innerHTML = "<h2>Unknown topic</h2>" +
      '<p><a href="dsa.html">&larr; Back to topics</a></p>';
  } else if (topic) {
    topicPage(topic);
  } else {
    topicIndex();
  }
})();
