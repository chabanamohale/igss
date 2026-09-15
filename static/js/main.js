/* Progressive enhancement only — every page works with JavaScript off. */
(function () {
  "use strict";

  // Mobile sidebar toggle
  var toggle = document.querySelector("[data-menu-toggle]");
  var sidebar = document.querySelector(".sidebar");
  if (toggle && sidebar) {
    sidebar.classList.add("collapsed");
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded",
        sidebar.classList.contains("collapsed") ? "false" : "true");
    });
  }

  // Confirm destructive actions
  document.querySelectorAll("form[data-confirm]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (!window.confirm(form.getAttribute("data-confirm"))) e.preventDefault();
    });
  });

  // Client-side table filter
  document.querySelectorAll("[data-filter-table]").forEach(function (input) {
    var table = document.querySelector(input.getAttribute("data-filter-table"));
    if (!table) return;
    input.addEventListener("input", function () {
      var term = input.value.toLowerCase();
      table.querySelectorAll("tbody tr").forEach(function (row) {
        row.style.display =
          row.textContent.toLowerCase().indexOf(term) > -1 ? "" : "none";
      });
    });
  });

  // Password match feedback on the registration form
  var pw = document.getElementById("password");
  var confirmField = document.getElementById("confirm");
  if (pw && confirmField) {
    var report = function () {
      confirmField.setCustomValidity(
        confirmField.value && pw.value !== confirmField.value
          ? "The two passwords do not match." : "");
    };
    pw.addEventListener("input", report);
    confirmField.addEventListener("input", report);
  }

  // Clear flash messages once they have had time to be read
  document.querySelectorAll(".alert[data-dismissable]").forEach(function (el) {
    setTimeout(function () { el.remove(); }, 9000);
  });

  // Live unread notification count
  var bell = document.querySelector("[data-bell]");
  if (bell) {
    setInterval(function () {
      fetch("/citizen/notifications/count")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d) return;
          var dot = bell.querySelector(".dot");
          if (d.unread > 0) {
            if (!dot) {
              dot = document.createElement("span");
              dot.className = "dot";
              bell.appendChild(dot);
            }
            dot.textContent = d.unread;
          } else if (dot) {
            dot.remove();
          }
        })
        .catch(function () { /* offline: leave the rendered count alone */ });
    }, 60000);
  }

  // Show the chosen filename on file inputs
  document.querySelectorAll("input[type=file]").forEach(function (input) {
    input.addEventListener("change", function () {
      var hint = input.parentElement.querySelector(".hint");
      if (hint && input.files.length) {
        hint.textContent = input.files.length === 1
          ? input.files[0].name
          : input.files.length + " files selected";
      }
    });
  });
})();
