/**
 * Sorts obj by its properties.
 * @param {hash} obj 
 */
function sortProperties(obj) {
  // convert object into array
  var sortable = [];
  for (var key in obj)
    if (obj.hasOwnProperty(key)) sortable.push([key, obj[key]]); // each item is an array in format [key, value]

  // sort items by value
  sortable.sort(function(a, b) {
    return b[1] - a[1]; // compare numbers
  });
  return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

/**
 * Adds a row to the stats table.
 * @param {array} data 
 */
function addRow(data) {
  var table = document.getElementById("stats");
  var domain = data[0];
  var minutes = Math.round(data[1] / 2);
  var time = `${minutes}m`;

  // get hours if necessary
  if (minutes > 59) {
    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    time = `${hours}h ${minutes}m`;
  }

  // get days if necessary
  if (hours > 23) {
    var days = Math.floor(hours / 24);
    hours = hours % 24;
    time = `${days}d ${hours}h ${minutes}m`;
  }

  var row = table.insertRow(-1);

  var domainCell = row.insertCell(-1);
  domainCell.textContent = domain;

  var minutesCell = row.insertCell(-1);
  minutesCell.textContent = time;
}

/**
 * Populates the stats table with data.
 * @todo change null in storage get to domains only (not categories)
 */
function populateTable() {
  console.log("Populating table");
  var table = document.getElementById("stats");
  chrome.storage.sync.get(null, function(items) {
    var sortedDomains = sortProperties(items);
    sortedDomains.slice(0, 100).forEach(addRow);
  });
}

/**
 * Clear all stored data.
 * @todo When categories are added, clear only stats and not categories
 */
function clearData() {
  console.log("Clearning data...");
  chrome.storage.sync.clear(function() {
    $("#stats")
      .find("tr:not(:first)")
      .remove();
  });
}

// Execute on load.
document.addEventListener("DOMContentLoaded", () => {
  populateTable();

  document.getElementById("clear").onclick = function() {
    clearData();
  };
});
