var PostMessage;
var iconInfo;
function postOpen()
{
  PostMessage({ message : "Open" , "openInfo" : { "extensionDir" : chrome.extension.getURL("/") } });
}
function postPutOnDeck(iconInfo)
{
  PostMessage({ message : "PutOnDeck" , "iconInfo" : iconInfo });
}
function postDisplayFrame(iconInfo,frameInfo)
{
  PostMessage({ message : "DisplayFrame", "iconInfo" : iconInfo, "frameInfo" : frameInfo });
}
function postHideFrame(iconInfo)
{
  PostMessage({ message : "HideFrame" , "iconInfo" : iconInfo });
}

chrome.extension.onConnect.addListener(function(port) {
  var emptyFunction = function() {};
  function postMessage(msg)
  {
    port.postMessage(JSON.stringify(msg));
  }
  PostMessage = postMessage;
  function onMessage(msg)
  {
  //  alert("onMessage:"+JSON.stringify(msg));
    if("message" in msg)
      switch(msg.message)
      {
        case "init" : postOpen();
        break;
        case "Opened" : onOpened(msg.openInfo);
        break;
        case "PlacedOnDeck" : onPlacedOnDeck(msg.iconInfo);
        break;
        case "DeckToBoard" : onDeckToBoard(msg.iconInfo,msg.destination);
        break;
        case "BoardToBoard" : onBoardToBoard(msg.iconInfo,msg.destination);
        break;
        case "ToExit" : onToExit(msg.iconInfo);
        break;
        case "StartedHovering" : onStartedHovering(msg.iconInfo);
        break;
        case "StoppedHovering" : onStoppedHovering();
        break;
        case "LockFrame" : onLockFrame(msg.iconInfo,msg.frameInfo);
        break;
        case "UnlockFrame" : onMoveFrame(msg.iconinfo);
        break;
      }
  }
  port.onMessage.addListener(function (msg){
    msg = JSON.parse(msg);
    onMessage(msg);
  });
  var onOpened = function(openInfo) {
    if(!(iconInfo === undefined))
    {
      postPutOnDeck(iconInfo);
    }
  };
  var onPlacedOnDeck = function(iconInfo)
  {
//    alert("onPlacedOnDeck");
  }
  var onDeckToBoard = emptyFunction;
  var onBoardToBoard = emptyFunction;
  var onDeckToExit = emptyFunction;
  var onBoardToExit = emptyFunction;
  var onStartedHovering = emptyFunction;
  var onStoppedHovering = emptyFunction;
  var onLockFrame = emptyFunction;
  var onUnlockFrame = emptyFunction;
});

function getGuid()
{
  return "1ebb96f1-058d-4a84-8fdb-eb4abda53f0a";
}
/*

http://www.joezimjs.com/javascript/the-lazy-mans-url-parsing/

var parser = document.createElement('a');
parser.href = "http://example.com:3000/pathname/?search=test#hash";
 
parser.protocol; // => "http:"
parser.hostname; // => "example.com"
parser.port;     // => "3000"
parser.pathname; // => "/pathname/"
parser.search;   // => "?search=test"
parser.hash;     // => "#hash"
parser.host;     // => "example.com:3000"

*/
function parseUrl(url)
{
  var div = $("<div />");
  $(div).prepend("<a />");
  var first_child = $(":first-child",div);
  first_child[0].href = url;
  $(div).html($(div).html());
  var a = $(":first-child",div)[0];
  var ret = {
    protocol: a.protocol,
    hostname: a.hostname,
    port: a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    host: a.host
  };
  return ret;
}

function isiDesked(tabExtra)
{
  return tabExtra.urlInfo.hostname in icons;
}

function iDeskable(tabExtra)
{
  if(/google.com/.test(tabExtra.urlInfo.hostname)) return true;
  if(/ebay.com/.test(tabExtra.urlInfo.hostname)) return true;
  if(/twitter.com/.test(tabExtra.urlInfo.hostname)) return true;
  if(/facebook.com/.test(tabExtra.urlInfo.hostname)) return true;
  if(/nytimes.com/.test(tabExtra.urlInfo.hostname)) return true;
  return false;
}

function iconURL(fileName)
{
  return "file://x:/abc/icons/"+fileName;
}

function getIconInfo(tabExtra)
{
  var icon = {};
  icon.frame = {};
  var hostname = tabExtra.urlInfo.hostname;
  if(/nytimes.com/.test(hostname))
  {
    icon.url = iconURL("nytimes.png");
    icon.frame.url = "nytimes.com";
    icon.id = "nytimes";
  }
  else if(/ebay.com/.test(hostname))
  {
    icon.url = iconURL("ebay.png");
    icon.frame.url = "ebay.com";
    icon.id = "ebay";
  }
  else if(/twitter.com/.test(hostname))
  {
    icon.url = iconURL("twitter.png");
    icon.frame.url = "twitter.com";
    icon.id = "twitter";
  }
  else if(/facebook.com/.test(hostname))
  {
    icon.url = iconURL("facebook.png");
    icon.frame.url = "facebook.com";
    icon.id = "facebook";
  }
  else if(/google.com/.test(hostname))
  {
    icon.url = iconURL("google.png");
    icon.frame.url = "google.com";
    icon.id = "google";
  }
  return icon;
}

var icons = {};
var popups = [];
var areas = [];
var rows = [];

function createGrid(options)
{
  rows = [];
}

function createNewiDesktop()
{
  createGrid();
}

function getOnDeck()
{
	var list = [];
	for(idx in icons)
	{
		if(z in icons[idx])
			list.push(z);
	}
	return list.sort(function(a,b) { return (a.z >= b.z); });	 
}

function putOnDeck(icon)
{
	var list = getOnDeck();
	icon.z = list[0].z+1;
	icons[icon.urlInfo.hostname] = {};
	// todo: tell client
	port.postMessage({ msg : "putOnDock", "icon" : icon });
}

function getDimensions()
{
	var ret = {};
	ret.rows = rows.length;
	var maxColumn = -1;
	for(row in rows)
	{
		var theRow = rows[row];
		if(theRow.length > 0)
		  maxColumn = Math.max(theRow[theRow.length-1],maxColumn);
	}
	return { rows : rows.length, columns : maxColumn+1 };
}

function unplace(options)
{
	var row = rows[options.row];
	for(i = 0;i < row.length;i++)
		if(row[i].column == options.column)
		{
			row.splice(i,1);
			if(row.length == 0)
			{
				rows.splice(options.row,1);
			}
		}
}

function growRowsUntil(numberOfRows)
{
	while(rows.length <= numberOfRows)
		rows.push([]);
}

function trimGrid()
{
	for(row = rows.length-1;;row--)
	{
		if(rows[row].length > 0)
			break;
	}
	if(rows[row].length == 0)
	{
		rows.splice(row,rows.length-row);
	}
}

function place(icon,options)
{
	var dim1 = getDimensions();
	if(trash in options && options.trash)
	{
		if(row in icon)
			unplace(icon);
		delete icon.row;
		delete icon.column;
		delete icons[icon.urlInfo.hostname];
	}
	else
	{
		unplace(icon);
		growRowsUntil(options.row);
		rows[options.row][options.column] = icon;
		icon.row = options.row;
		icon.column = options.column;
	}
	trimGrid();
	var dim2 = getDimensions();
	if(dim1 != dim2)
		;  // tell client of resize
}

function onMoveIcon(options)
{
}

function onMoveOffDeck(options)
{
	if(trash in options && options.trash)
	{
		var icon = removeOnDeck();
		// todo:tell client
		port.postMessage({ msg : "removeOnDeck" });
		place(icon,{ trash: true });
		port.postMessage({ msg : "place" });
		// todo:tell client
	}
	else
	{
		var icon = removeOnDeck();
		// todo:tell client
		place(icon,{ row : options.row, column : options.column });
		// todo:tell client		
	}
}

// what should we track?
// a list of icons
//   its associated popup
//   z-level
// a list of popups.
//   its location
//   is locked?
//   its associated icon
//   cached representation
// a list of rows
//   a list of positions   
//     a list of who is on it

function TabExtra(tab)
{
  $.extend(true,this,tab);
  this.urlInfo = parseUrl(tab.url);
}

function isTabiDesktop(tab)
{
  var regexp = new RegExp("/"+getGuid()+"/");
  return regexp.test(tab.url);
}

function iDesktopUrl()
{
  return "file://x:/abc/idesktop.html"+"?guid=" + getGuid() + "&eid=" + chrome.i18n.getMessage("@@extension_id");
}

var port;

function openiDesktop(options)
{
  // first find an existing one
  chrome.tabs.query(
  {
    windowType: 'normal',
    url: iDesktopUrl()
  }, function (tabs)
  {
    function handleIcon()
    {
      if(!(typeof iconInfo === undefined))
        delete iconInfo;
      if("newicon" in options)
      {
        var tabExtra = options.newicon;
        if(iDeskable(tabExtra))
        {
          iconInfo = getIconInfo(tabExtra);
        }
      }
    }
    if(tabs.length == 0)
    {
      if(rows.length == 0)
        createNewiDesktop();
      chrome.tabs.create({ url: iDesktopUrl() },function(tab) {

           
        /*mport = chrome.tabs.connect(tab.id);
        port.onMessage(function(msg) {
          if(msg.message == "start")
          {
            // todo: response to startup
          }
          else if(msg.message == "MoveOffDeck")
          {
            onMoveOffDeck(msg.options);
          }
        });*/
        handleIcon();
      });
    }
    else
    {
      chrome.tabs.move([tabs[0].id], // move the existing tab here
      {
        windowId: chrome.wndows.WINDOW_ID_CURRENT,
        index: 0
      });
      handleIcon();
    }
  });
}

function onPageActionClicked(tabExtra)
{
  if(isiDesked(tabExtra))
    openiDesktop({ openicon : tabExtra }); // open iDesktop with no action
  else
    openiDesktop({ newicon : tabExtra }); // open iDesktop with new Icon
}

function updatePageAction(tabExtra)
{
  if(tabExtra.status == "loading")
    chrome.pageAction.hide(tabExtra.id);
  else
  {
    if(isTabiDesktop(tabExtra)) chrome.pageAction.hide(tabExtra.id);
    else
    {
      if(iDeskable(tabExtra))
      {
        if(isiDesked(tabExtra))
          chrome.pageAction.setIcon({ tabId : tabExtra.id, path: "sysicons/icon.png" });
        else
          chrome.pageAction.setIcon({ tabId : tabExtra.id, path: "sysicons/iconred.png" });
        chrome.pageAction.show(tabExtra.id);
      }
      else
        chrome.pageAction.hide(tabExtra.id);
    }
  }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)
{
  updatePageAction(new TabExtra(tab));
});

chrome.pageAction.onClicked.addListener(function (tab)
{
  onPageActionClicked(new TabExtra(tab));
});

chrome.tabs.query(
{
  windowType: "normal"
}, function (tabs)
{
  for(var idx in tabs)
  {
    updatePageAction(new TabExtra(tabs[idx]));
  }
});


