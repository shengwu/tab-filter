function DownloadLink(props) {
  return (
    <p><a href={props.link}>{props.type}</a></p>
  );
}



// TODO: we're not passing props in correctly
// (strings work but subobjects don't work)
function Tab(props) {
  var downloads = [];
  for (var type in props.download) {
    if (props.download.hasOwnProperty(type)) {
      for (var i = 0; i < props.download[type].length; i++) {
        var link = props.download[type][i];
        downloads.push(<DownloadLink link={link} type={type} />);
      }
    }
  }
  return (
    <div className="tab">
      <h3>{props.name}</h3>
      {downloads}
      <p>{props.desc}</p>
    </div>
  );
      //<Linkify tagName="p">{props.desc}</Linkify>
}

class TabFilter extends React.Component {
  constructor() {
    super();
    this.state = {
      tabs: TABS
    }
  }

  render() {
    return (
      <div>
      <input
        type="text"
        className="form-control"
        placeholder="Filter by tab name" />
      {this.state.tabs.map(function(tab, i) {
        return <Tab
          name={tab.title}
          desc={tab.desc}
          download={tab.download}
          />;
      })}
      </div>
    );
  }
}


 ReactDOM.render(
  <TabFilter />,
  document.getElementById('tabs')
);
