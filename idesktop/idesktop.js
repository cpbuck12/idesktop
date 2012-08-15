var port;
var event;
var domShares = {};
var eventName = "OnData";

function InitDOM()
{

function getElementText()
{
	if("innerText" in this)
		return this.innerText;
	else if("textContent" in this)
		return this.textContent;
}

function setElementText(val)
{
	if("innerText" in this)
		this.innerText = val;
	else if("textContent" in this)
		this.textContent = val;
}

var children = document.getElementsByClassName("system")[0].children;
var idx;
for(idx = 0; idx < children.length;idx++)
{
  var child = children[idx];
  if(!("getElementText" in child))
    child.getElementText = getElementText;
  if(!("setElementText" in child))
    child.setElementText = setElementText;
  domShares[child.className] = child;
};

}// InitDOM

function InitEvents() {
  extensionPort = chrome.extension.connect();
//  assert(extensionPort.toString());
  event = document.createEvent("Event");
  event.initEvent(eventName,true,true);
  var page_data = domShares["page_data"];
  page_data.setElementText("initDOM");
  var extension_data = domShares["extension_data"];
  
  extensionPort.onMessage.addListener(function (msg) { // from background to page
    page_data.setElementText(msg);
    page_data.dispatchEvent(event);
  });
  extension_data.addEventListener(eventName,function() { // from page to background
    var val = extension_data.getElementText();
    extensionPort.postMessage(val);
  });
  extensionPort.postMessage(JSON.stringify({ message: "init" }));
  /* removed, seems to work
  page_data.setElementText("");  // initialize page
  page_data.dispatchEvent(event);*/ 
}

InitDOM();
InitEvents();

