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
        "</span>" +
        right +
      "</a>";
    }).join("") + "</div>";
  }

  /* ---------- one topic: straight to the problems ---------- */
  function topicPage(t) {
    document.title = t.title + " — DSA — python-grail";

    var head =
      '<p class="crumb-line"><a href="dsa.html">DSA</a> / ' + esc(t.title) + "</p>" +
      '<h2 class="topic-title">' + esc(t.title) + "</h2>";

    if (!t.problems.length) {
      root.innerHTML = head +
        '<div class="stub-note"><p>Not written up yet.</p>' +
        '<p><a href="dsa.html">&larr; Back to topics</a></p></div>';
      return;
    }

    var rows = t.problems.map(function (p) {
      return '<a class="entry-card" href="problem.html?id=' +
        encodeURIComponent(p.id) + '">' +
        '<span class="num">' + (p.lc || "—") + "</span>" +
        '<span class="body">' +
          '<span class="title">' + esc(p.name) + "</span>" +
          '<span class="tags">' +
            p.tags.slice(0, 4).map(function (tag) {
              return '<span class="tag">' + esc(tag) + "</span>";
            }).join("") +
          "</span>" +
        "</span>" +
        '<span class="badge ' + p.difficulty + '">' + p.difficulty + "</span>" +
      "</a>";
    }).join("");

    root.innerHTML = head + '<div class="entry-list">' + rows + "</div>";
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
