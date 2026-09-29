(function () {
  "use strict";

  var esc = window.esc;
  var topics = window.GRAIL_DSA || [];
  var root = document.getElementById("dsa");
  var wanted = new URLSearchParams(location.search).get("topic");

  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }

  /* ---------- topic index ---------- */
  function topicIndex() {
    document.title = "DSA — python-grail";

    var cards = topics.map(function (t) {
      var stub = t.status === "stub" || t.count === 0;
      var href = stub ? "dsa.html?topic=" + encodeURIComponent(t.id)
                      : "dsa.html?topic=" + encodeURIComponent(t.id);
      var sections = t.sections.length;
      return '<a class="topic-card' + (stub ? " stub" : "") + '" href="' + href + '">' +
        "<h3>" + esc(t.title) + "</h3>" +
        '<span class="subtitle">' + esc(t.subtitle) + "</span>" +
        '<div class="meta">' +
          (stub
            ? '<span class="badge medium">not yet written</span>'
            : '<span class="big">' + t.count + "</span>" +
              "<span>" + (t.target ? t.count + " of " + plural(t.target, "problem")
                                   : plural(t.count, "problem")) + " &middot; " +
              plural(sections, "section") + "</span>") +
        "</div></a>";
    }).join("");

    var ready = topics.filter(function (t) { return t.count > 0; });
    var problems = ready.reduce(function (a, t) { return a + t.count; }, 0);
    var solutions = ready.reduce(function (a, t) {
      return a + t.sections.reduce(function (b, s) {
        return b + s.problems.reduce(function (c, p) {
          return c + p.approaches.length;
        }, 0);
      }, 0);
    }, 0);

    root.innerHTML =
      '<p class="dsa-intro">A topic-by-topic path through the problems that teach each other, ' +
      'in that order rather than in difficulty order. Every problem lists each worthwhile ' +
      'approach with its time and auxiliary space cost and the reason that bound holds.</p>' +

      '<div class="dsa-callout"><p>All ' + solutions + ' solutions across ' + problems +
      ' problems are <strong>executed against assertions by the build</strong>, the same as ' +
      'every snippet in <a href="browse.html">Browse</a>. A solution that stops passing ' +
      'fails the build rather than sitting here quietly wrong.</p></div>' +

      '<div class="topic-grid">' + cards + "</div>";
  }

  /* ---------- one topic ---------- */
  function topicPage(t) {
    document.title = t.title + " — DSA — python-grail";

    var head =
      '<p class="prob-head crumb" style="padding:0 0 18px">' +
      '<a href="dsa.html">DSA</a> / ' + esc(t.title) + "</p>" +
      "<h2 style=\"font-size:1.5rem;letter-spacing:-.025em;margin-bottom:6px\">" +
      esc(t.title) + "</h2>" +
      '<p class="section-sub" style="margin-bottom:20px">' + esc(t.subtitle) + "</p>" +
      (t.blurb || []).map(function (p) {
        return '<p class="dsa-intro">' + p + "</p>";
      }).join("");

    if (!t.sections.length) {
      root.innerHTML = head +
        '<div class="stub-note"><p><strong>Nothing here yet.</strong></p>' +
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
        return '<a class="prob-card" href="problem.html?id=' +
          encodeURIComponent(p.id) + '">' +
          '<span class="lc-num">' + p.lc + "</span>" +
          '<span class="name">' + esc(p.name) + "</span>" +
          '<span class="n-approaches">' + p.approaches.length + " approaches</span>" +
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
        '<div class="prob-list">' + rows + "</div>" +
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
