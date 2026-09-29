(function () {
  "use strict";

  var entries = window.entries;
  var state = { difficulty: "any", tag: "any", q: "" };

  var counts = {};
  entries.forEach(function (e) {
    e.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
  });
  var allTags = Object.keys(counts).sort(function (a, b) {
    return counts[b] - counts[a] || a.localeCompare(b);
  });

  document.getElementById("difficulty-chips").innerHTML =
    [["any", "Any"]].concat(window.LEVELS.map(function (lv) {
      return [lv, lv[0].toUpperCase() + lv.slice(1) + " (" + window.countBy(lv) + ")"];
    })).map(function (p) {
      return '<button class="chip" type="button" data-value="' + p[0] +
             '" aria-pressed="' + (p[0] === "any") + '">' + window.esc(p[1]) + "</button>";
    }).join("");

  document.getElementById("tag-select").innerHTML =
    '<option value="any">All topics (' + allTags.length + ")</option>" +
    allTags.map(function (t) {
      return '<option value="' + window.esc(t) + '">' + window.esc(t) +
             " (" + counts[t] + ")</option>";
    }).join("");

  var box = document.getElementById("difficulty-chips");
  box.addEventListener("click", function (ev) {
    var chip = ev.target.closest(".chip");
    if (!chip) return;
    state.difficulty = chip.dataset.value;
    box.querySelectorAll(".chip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(c === chip));
    });
    render();
  });

  document.getElementById("tag-select").addEventListener("change", function (ev) {
    state.tag = ev.target.value;
    render();
  });

  document.getElementById("q").addEventListener("input", function (ev) {
    state.q = ev.target.value.trim().toLowerCase();
    render();
  });

  document.getElementById("reset").addEventListener("click", function () {
    state = { difficulty: "any", tag: "any", q: "" };
    document.getElementById("q").value = "";
    document.getElementById("tag-select").value = "any";
    box.querySelectorAll(".chip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.dataset.value === "any"));
    });
    render();
  });

  var hay = new Map();
  entries.forEach(function (e) {
    hay.set(e, [e.title, e.subtitle, e.tags.join(" "), e.code, e.output, e.takeaway]
      .join(" ").toLowerCase());
  });

  function render() {
    var matches = entries.filter(function (e) {
      if (state.difficulty !== "any" && e.difficulty !== state.difficulty) return false;
      if (state.tag !== "any" && e.tags.indexOf(state.tag) === -1) return false;
      if (state.q && hay.get(e).indexOf(state.q) === -1) return false;
      return true;
    });

    var per = window.LEVELS.map(function (lv) {
      var n = matches.filter(function (e) { return e.difficulty === lv; }).length;
      return n ? n + " " + lv : null;
    }).filter(Boolean).join(" / ");

    document.getElementById("count").textContent =
      matches.length + (matches.length === 1 ? " entry" : " entries") +
      (per && matches.length !== entries.length ? "  —  " + per : "");

    document.getElementById("list").innerHTML = matches.length
      ? matches.map(window.entryCard).join("")
      : '<p class="empty">Nothing matches those filters.</p>';
  }

  render();
})();
