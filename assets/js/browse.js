(function () {
  "use strict";

  var entries = window.entries;
  var state = { difficulty: "any", tag: "any", q: "" };

  var allTags = Array.from(new Set(entries.reduce(function (acc, e) {
    return acc.concat(e.tags);
  }, []))).sort();

  function chipHtml(value, label) {
    return '<button class="chip" type="button" data-value="' + window.esc(value) +
           '" aria-pressed="false">' + window.esc(label) + "</button>";
  }

  document.getElementById("difficulty-chips").innerHTML =
    [["any", "Any"], ["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]]
      .map(function (p) { return chipHtml(p[0], p[1]); }).join("");

  document.getElementById("tag-chips").innerHTML =
    chipHtml("any", "Any") + allTags.map(function (t) { return chipHtml(t, t); }).join("");

  function bind(containerId, key) {
    var box = document.getElementById(containerId);
    box.addEventListener("click", function (ev) {
      var chip = ev.target.closest(".chip");
      if (!chip) return;
      state[key] = chip.dataset.value;
      box.querySelectorAll(".chip").forEach(function (c) {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      render();
    });
    box.querySelector('.chip[data-value="any"]').setAttribute("aria-pressed", "true");
  }
  bind("difficulty-chips", "difficulty");
  bind("tag-chips", "tag");

  document.getElementById("q").addEventListener("input", function (ev) {
    state.q = ev.target.value.trim().toLowerCase();
    render();
  });

  function haystack(e) {
    return [e.title, e.subtitle, e.tags.join(" "), e.code, e.output, e.takeaway]
      .join(" ").toLowerCase();
  }

  function render() {
    var matches = entries.filter(function (e) {
      if (state.difficulty !== "any" && e.difficulty !== state.difficulty) return false;
      if (state.tag !== "any" && e.tags.indexOf(state.tag) === -1) return false;
      if (state.q && haystack(e).indexOf(state.q) === -1) return false;
      return true;
    });

    document.getElementById("count").textContent =
      matches.length + (matches.length === 1 ? " entry" : " entries");

    document.getElementById("list").innerHTML = matches.length
      ? matches.map(window.entryCard).join("")
      : '<p class="empty">Nothing matches those filters.</p>';
  }

  render();
})();
