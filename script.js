function DownloadLink(link, type) {
  return '<a href="' + link + '">' + type + '</a>';
}

function PostedBy(posted_by) {
  const link = "http://www.banjohangout.org/my/" + posted_by;
  return 'Posted by <a href="' + link + '" target="_blank">' + posted_by + '</a>.';
}

function LastUpdated(last_updated) {
  const date = new String(new Date(last_updated));
  return 'Last updated ' + date + '.';
}

function Tab(id, props) {
  var downloads = [];
  for (var type in props.download) {
    if (props.download.hasOwnProperty(type)) {
      for (var i = 0; i < props.download[type].length; i++) {
        var link = props.download[type][i];
        downloads.push(DownloadLink(link, type));
      }
    }
  }
  var downloadElem =
    '<p><strong>Downloads: </strong>' + downloads.join(', ') + '</p>';

  var tab = document.createElement('div');
  tab.classList = 'tab';
  tab.setAttribute('data-id', id);
  var internals = '<h3>' + props.title + '</h3>' +
    downloadElem +
    '<p>' + LastUpdated(props.last_updated) + ' ' +
      PostedBy(props.posted_by) + '</p>';
  if (props.desc) {
    internals += '<p>' + props.desc + '</p>';
  }
  tab.innerHTML = internals;
  return tab;
}




var debounceMs = 200;
var doFilterId = -1;

function onFilterChange(e) {
  clearTimeout(doFilterId);
  doFilterId = setTimeout(render, debounceMs);
}

function filterTabs(filter) {
  return function(tab) {
    return tab.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
  }
}



var tabCache = {};

function preRenderTabs() {
  for (var i = 0; i < TABS.length; i++) {
    tabCache[i] = Tab(i, TABS[i]);
    TABS[i].id = i;
  }
}

function getTabId(tab) {
  return tab.id;
}

function getTabsToAdd(old, next) {
  var tabsToAdd = [];
  for (id in next) {
    if (!old[id]) {
      tabsToAdd.push(id);
    }
  }
  tabsToAdd.sort(function(a, b) { return a - b; });
  return tabsToAdd.map(function(str) { return parseInt(str); });
}

function getTabsToDelete(old, next) {
  var tabsToDelete = {};
  for (id in old) {
    if (!next[id]) {
      tabsToDelete[id] = true;
    }
  }
  return tabsToDelete;
}

// TODO: there's a bug somewhere!
function updateTabs(nextTabs) {
  var tabContainer = document.getElementById('tabs');
  var tabObjs = tabContainer.children;
  var it = 0;
  for (var i = 0; i < tabObjs.length; i++) {
    var currTab = tabObjs[i];
    var currId = parseInt(currTab.getAttribute('data-id'));
    while (it < currId) {
      if (nextTabs[it]) {
        tabContainer.insertBefore(tabCache[it], currTab);
      }
      it += 1;
    }
    console.log(currTab);
    if (!nextTabs[currId]) {
      tabContainer.removeChild(currTab);
      i -= 1;
    }
  }

  while (it < TABS.length) {
    if (nextTabs[it]) {
      // passing in null appends the new element at the end
      tabContainer.insertBefore(tabCache[it], null);
    }
    it += 1;
  }
}

function listToDict(list) {
  var dict = {};
  for (var i = 0; i < list.length; i++) {
    dict[i] = true;
  }
  return dict;
}

function render() {
  var filterVal = document.getElementById('tab-filter').value.trim();
  if (filterVal !== '') {
    var nextTabs = TABS.filter(filterTabs(filterVal)).map(getTabId);
  } else {
    var nextTabs = TABS.map(getTabId);
  }
  console.log(nextTabs);
  updateTabs(listToDict(nextTabs));
}

preRenderTabs();
render();
