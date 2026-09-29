(function () {
  "use strict";

  document.getElementById("stats").innerHTML =
    '<div class="stat"><div class="n">' + window.entries.length + '</div>' +
    '<div class="l">entries</div></div>' +
    window.LEVELS.map(function (lv) {
      return '<div class="stat ' + lv + '"><div class="n">' + window.countBy(lv) + "</div>" +
             '<div class="l">' + lv + "</div></div>";
    }).join("");

  var featured = window.GRAIL_FEATURED.map(window.byId).filter(Boolean);
  document.getElementById("featured").innerHTML = featured.map(window.entryCard).join("");
})();
