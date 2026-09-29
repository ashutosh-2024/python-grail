(function () {
  "use strict";

  var levels = ["beginner", "intermediate", "advanced"];

  document.getElementById("stats").innerHTML =
    '<div class="stat"><div class="n">' + window.entries.length + '</div>' +
    '<div class="l">entries</div></div>' +
    levels.map(function (lv) {
      return '<div class="stat ' + lv + '"><div class="n">' + window.countBy(lv) + "</div>" +
             '<div class="l">' + lv + "</div></div>";
    }).join("");

  document.getElementById("featured").innerHTML =
    window.entries.map(window.entryCard).join("");
})();
