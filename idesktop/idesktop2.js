$(document).ready(function() {
  function sendMessage(msg) {
    $(outgoing).text(JSON.stringify(msg));
    outgoing[0].dispatchEvent(event);
  }
  
  function onMessage(msg)
  {
    if("message" in msg)
      switch(msg.message)
      {        case "Open" : onOpen(msg.openInfo);
        break;
        case "PutOnDeck" : onPutOnDeck(msg.iconInfo);
        break;
        case "DisplayFrame" : onDisplayFrame(msg.iconInfo,msg.frameInfo);
        break;
        case "HideFrame" : onHideFrame(msg.iconInfo);
        break;
      }
  }
  function sendOpened(openInfo)
  {
    sendMessage({ message : "Opened", "openInfo" : openInfo });
  }
  function sendPlacedOnDeck(iconInfo)
  {
    sendMessage({ message : "PlacedOnDeck", "iconInfo" : iconInfo });
  }
  function sendDeckToBoard(iconInfo,destintion)
  {
    sendMessage({ message : "DeckToBoard", "iconInfo" : iconInfo, "destination" : destination	});
  } 
  function sendBoardToBoard(iconInfo,destination)
  {
    sendMessage({ message : "BoardToBoard", "iconInfo" : iconInfo, "destination" : destination });
  } 
  function sendToExit(iconInfo)
  {
    sendMessage({ message : "ToExit", "iconInfo" : iconInfo	});
  }
  function sendStartedHovering(iconInfo)
  {
    sendMessage({ message : "StartedHovering", "iconInfo" : iconInfo	});
  }
  function sendStoppedHovering()
  {
    sendMessage({ message : "StoppedHovering" });
  }
  function sendLockFrame(iconInfo, frameInfo)
  {
    sendMessage({ message : "LockFrame" , "iconInfo" : iconInfo	, "frameInfo" : frameInfo });
  }
  function sendUnlockFrame(iconInfo)
  {
    sendMessage({ message : "UnlockFrame" , "iconInfo" : iconInfo });
  }
  var emptyFunction = function() {};
  var extensionDir;
  function onOpen(openInfo)
  {
     extenionDir = openInfo.extensionDir;
    sendOpened(openInfo);
  }
  
  var onDeck = $("#onDeck");  
  var onPutOnDeck = function(iconInfo) {
//	  $("#ondeck"). TODO, actual jquery stuff
    var newIcon = $("<img />");
    newIcon.attr('visibility','hidden');
    newIcon.appendTo(onDeck); // TODO: make sure we're still connected through newIcon after appending
    newIcon.each(function() {
      $(this).css('z-index',onDeck.children().length-1).attr("src",iconInfo.url);
//      $(this).fadeOut(0,function() { newIcon.css('visibility','visible'); } );
     // $(this).fadeIn(1000*6,function() {sendPlacedOnDeck(iconInfo);});
     $(this).fadeOut(0);
     $(this).attr('visibility','visible');
      $(this).fadeIn();
      $(this).draggable({ zIndex: 100, revert: 'invalid' });
    });
  }
  var onDisplayFrame = emptyFunction;
  var onHideFrame = emptyFunction;
  
  var eventName = "OnData";
  var incoming = $(".system > .page_data");
  var outgoing = $(".system > .extension_data");

  var event = document.createEvent("Event");
  event.initEvent(eventName,true,true);
  
  incoming[0].addEventListener(eventName,function() {
    var msg = JSON.parse($(incoming).text());
    onMessage(msg);
  });
  var cols = Math.floor(screen.width * 1 / 128) + 2;
  var rows = Math.floor(screen.height * 1 / 128) + 2;
  var board = $("#board");
//	board.width(cols * 128);
//	board.height(rows * 128);
  board.css('overflow','auto');
  board.height(window.innerHeight-$("#header").height());
  for(irow = 0;irow < rows;irow++)
  {    board.append("<div />");
    var row = $(board).children().last();
    row.css('white-space','nowrap');
    row.width(cols*128);
    for(icol = 0;icol < cols;icol++)
    {
      var div = $("<div class='tile'/>");
      div.appendTo(row);
      var last = row.children().last();
      
      var tile = $("<div class='tilebackground' /><div class='tilecontent' /><div class='tilecover' />");
      tile.appendTo(last);
      var layers = {};
      last.children().each(function(index) {
        var klassName = this.className;
        layers[klassName.slice(4)] = this;
        $(this).addClass("subtile");
        $(this).addClass("subtile"+index);
        $(this).css('z-index',index);
      });
      $("<img src='file://x:/abc/sysicons/128gray.png' />").appendTo(layers.background);
      var altBg = ((icol + irow) % 2 == 1);
      $(layers.background).children().fadeTo(0,altBg ? .15 : .25);
      $(layers.content).droppable({
        over: function(event,ui) { 
        $(this).parent().children(".tilebackground").children("img").fadeToggle("fast");
      },
        //$(layers.background).css('background-color','red'); },
        out: function(event,ui) {
          var img = $(this).parent().children(".tilebackground").children("img")
          img.fadeToggle("fast");
        },
          //$(layers.background).css('background-color',''); },
        drop:function(event,ui) {
          $(layers.background).css('background-color','');
          var icon = ui.draggable.detach().css('top','').css('left','').addClass('placedicon');
          
          icon.appendTo(this);
          //$(this).children().last().draggable({ zIndex: 100, revert: 'invalid', start: function() { alert('start'); } });
          $(this).droppable('destroy');
          var cover = $(this).parent().children(".tilecover");
          cover.append("<img src='file://x:/abc/sysicons/cover.png' class='cover' style='display:none;'/>");
          var ii = 0;/*
          cover.children("img").on({
            mouseenter : function() {
              
              console.log("over"+ ++ii);
              var theThis = $(this);
              theThis.data('display',theThis.css('display'));
              //theThis.css('display','none');
              theThis.fadeOut(0);
            }
          });*/
          cover.on({
            mouseenter : function() {
              
              console.log("over"+ ++ii);
              var theThis = $(this);
              theThis.data('display',theThis.css('display'));
              //theThis.css('display','none');
              theThis.fadeOut(0);
            }
         });
         $(this).parent().children(".tilecontent").on({
           mouseleave : function()
           {
             $(this).parent().children(".tilecover").fadeIn(0);
           }
         });
          icon.draggable({ 
          /* helper : function(event,ui) {
              return $(this).parent().children(".tilecontent").children("img"); 
            }*/
          });
          var img = $(this).parent().children(".tilebackground").children("img");
          for(i = 0;i < 1;i++)
            img.fadeToggle(30);
          img.fadeOut("fast");
       }
        /*
      last.addClass(altBg ? "tile2":"tile").droppable({
        over: function(event,ui) { $(this).css('background-color','rgb(30,30,30)'); },
        out: function(event,ui) { $(this).css('background-color'erter,''); },
        drop: function(event,ui) {
          $(this).css('background-color','');
          var icon = ui.draggable.detach();
          
          icon.appendTo(this).css('top',32).css('left',32).css('z-index',1);*/
          /*
          var posDrag = ui.draggable.position();
          var posBoard = board.position();
          var newTop = (32 - ((posDrag.top - posBoard.top) % 128)) + posDrag.top;
          var newLeft = (32 - ((posDrag.left - posBoard.left) % 128)) + posDrag.left;
          ui.draggable.animate({ top: newTop, left: newLeft },1000);
          var theThis = $(this);
          theThis.append("<img />");
          var img = $(this).children().last();
          img.css('top',16).css('left',16).css('z-index',1);
          img.attr('src',"file://x:/abc/sysicons/cover.png");
          //ui.draggable.css('top',newTop).css('left',newLeft);
        }*/
      });/*
      if((icol + irow) % 2 == 1)
      {
        last.append("<img src="+"'file://x:/abc/sysicons/128gray.png'/>");
        last.children().last().fadeTo(0,.1).css('z-index','-1');
      }*/
    }
  }
});