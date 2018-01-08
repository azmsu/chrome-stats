/**
 * Save the domain category in storage.
 * @param {string} domain 
 * @param {string} category 
 */
function setDomainCategory(domain, category) {
  domainCategory = {};
  domainCategoryKey = domain + "_cat";
  domainCategory[domainCategoryKey] = category;
  chrome.storage.sync.set();
}

/**
 * Get the domain category by sending an ajax request.
 * @param {string} domain 
 * @param {function} callback 
 */
function getDomiainCategoryAjax(domain, callback) {
  $.ajax({
    url: "http://sitereview.bluecoat.com/rest/categorization",
    type: "POST",
    contentType: "application/json", // send as JSON
    data: { url: domain },
    success: function(response) {
      //called when successful
      raw_categories = response.categorization;
      categories = extractContent(raw_categories);
      category = categories; // @todo do something to get a single category here
      console.log(category);
      callback(domain, category);
    },
    error: function(error) {
      //called when there is an error
      console.log(error);
    }
  });
}

/**
 * Look up domain category in storage or request for it.
 * @param {string} domain
 */
function getDomainCategory(domain) {
  console.log("Getting domain category");

  domainCategoryKey = domain + "_cat";

  chrome.storage.sync.get(domainCategoryKey, function(items) {
    console.log(`Got domain categories: ${items}`);

    // if domain category is not in storage
    if (Object.keys(items).length === 0 && items.constructor === Object) {
      getDomainCategoryAjax(domain, setDomainCategory);
    }
  });
}

/**
 * Update domains.
 */
function updateDomains() {
  console.log("Updating domains");
  // get currently active chrome tab
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    console.log(`Found ${tabs.length} tabs.length tabs: ${tabs}`);

    // return if no tabs found
    if (tabs.length === 0) {
      return;
    }

    var url = new URL(tabs[0].url);
    var domain = url.hostname;

    console.log(`Got domain: ${domain}`);

    // return if on newtab
    if (domain === "newtab") {
      return;
    }

    // @todo get the domains category
    // getDomainCategory(domain)

    // get domain data from chrome storage
    chrome.storage.sync.get(domain, function(items) {
      console.log(`Got items: ${items}`);
      var domains = {};
      var domainMinutes;

      // if domain is not in storage
      if (Object.keys(items).length === 0 && items.constructor === Object) {
        domainMinutes = 0;
      } else {
        domainMinutes = items[domain];
      }

      domains[domain] = domainMinutes += 1;
      console.log(`Updating domain data to: ${domains}`);

      // update domain data
      chrome.storage.sync.set(domains);
    });
  });
  console.log("Updating domains completed.");
}

// Update domains every 30 seconds.
setInterval(updateDomains, 30000);
