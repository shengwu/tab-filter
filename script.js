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

function Tab(props) {
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

  var tabElem = '<div class="tab">' + 
    '<h3>' + props.title + '</h3>' +
    downloadElem +
    '<p>' + LastUpdated(props.last_updated) + ' ' +
      PostedBy(props.posted_by) + '</p>';
  if (props.desc) {
    tabElem += '<p>' + props.desc + '</p>';
  }
  tabElem += '</div>';
  return tabElem;
}

function filterTabs(filter) {
  return function(tab) {
    return tab.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
  }
}

// Index-building functions

var index = {};

function tokenize(sentence) {
  return sentence.toLowerCase().split(/[^\w]+/).filter(s => s !== '');
}

function addToIndex(key, tabIdx) {
  if (!index.hasOwnProperty(key)) {
    index[key] = [];
  }
  index[key].push(tabIdx);
}

function buildIndex() {
  TABS.forEach((tab, tabIdx) => {
    var parts = tokenize(tab.title);
    parts.forEach(part => addToIndex(part, tabIdx));
  });
}
buildIndex();
console.log(index);


var debounceMs = 200;
var doFilterId = -1;

function onFilterChange(e) {
  clearTimeout(doFilterId);
  doFilterId = setTimeout(render, debounceMs);
}

function render() {
  var filterVal = document.getElementById('tab-filter').value.trim();
  if (filterVal !== '') {
    var tabs = TABS.filter(filterTabs(filterVal)).map(Tab).join('');
  } else {
    var tabs = TABS.map(Tab).join('');
  }
  document.getElementById('tabs').innerHTML = tabs;
}

render();
