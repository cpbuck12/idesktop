function scale(val,num,den){
//		val *= num;
//		val /= den;
		return val;
	}
	
var foofoofoo = 'fdsaf';

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	
	var tab = sender.tab;
	var windowId = tab.windowId;
	var views = chrome.extension.getViews({ "windowId" : windowId });
	var view0;
	for(i = 0;i < views.length;i++)
		if(views[i].window != window)
		{
			view0 = views[i];
			break;
		}/*
	var innerWidth = $(window).innerWidth();
	var innerHeight = $(window).innerHeight();
	innerWidth = innerHeight = 100;*/
//	$(view.document).width(scale(innerWidth,9,10));
//	$(view.document).height(scale(innerHeight,9,10));*/
   if(request.message == "getSize")
	   chrome.windows.getCurrent({ populate: true },function(tab) {
			var views = chrome.extension.getViews({'windowId':tab.windowId});
			var view = views[0];
			var innerWidth = tab.width;
			var innerHeight = tab.height;
		   sendResponse({ 'innerWidth' : innerWidth, 'innerHeight' : innerHeight });
		   console.log(innerWidth+" X "+ innerHeight);
		   $('body',views[0]).text(innerWidth+" X "+ innerHeight);
		 });	
});
	
chrome.browserAction.onClicked.addListener(function onPopup(tab) {
	var views = chrome.extension.getViews(); 
	var view = chrome.extension.getViews({
		"type" : "popup",
		"windowId": tab.windowId
		})[0];
	$(view.document).width(scale($(window).innerWidth(),9,10));
	$(view.document).height(scale($(window).innerHeight(),9,10));
});

