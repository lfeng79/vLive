function ItemManager()
{    
	this.columnCount = 0;
	this.MAX_ITEM_NUM = 100;
}
ItemManager.prototype.GetColumnCount = function()
{
	return this.columnCount;
}
ItemManager.prototype.AddColumn = function(keyword)
{    
	// add column
	var itemManager = document.getElementById("itemManager");
	var dispKeyword = ItemManager.ReplaceAngleBrackets(keyword);
	var columnHTML = "<div class=\"column\" status=\"play\" itemcount=\"0\" keyword=\"" + keyword + "\"><div class=\"container\"><div class=\"controller\"><div class=\"controller_keyword\">" + dispKeyword + "</div><div class=\"controller_area\"><a class=\"close_button\" href=\"javascript:void(0)\" onclick=\"monitor.DeleteColumn(this); return false;\" title=\"close\"></a><a class=\"pause_button\" href=\"javascript:void(0)\" onclick=\"monitor.PauseColumn(this); return false;\" title=\"pause\"></a><a class=\"play_button\" href=\"javascript:void(0)\" onclick=\"monitor.PlayColumn(this); return false;\" title=\"play\"></a></div></div><div class=\"itemlist\"></div></div></div>";
	itemManager.innerHTML += columnHTML;
	
	// caculate current column number
	this.columnCount++;
	
	// adjust column width
	this.AdjustColumnWidth();
}
ItemManager.prototype.DeleteColumn = function(column)
{
	if(this.columnCount == 0)
		return;
		
	// delete column
	var itemManager = document.getElementById("itemManager");
	itemManager.removeChild(column);
	
	// caculate current column number
	this.columnCount--;
	
	// adjust column width
	if(this.columnCount > 0)
		this.AdjustColumnWidth();
}
ItemManager.prototype.AdjustColumnWidth = function()
{
	var columnWidth = 100/this.columnCount - 0.1 + "%";
	var columns = document.getElementById("itemManager").childNodes;
	for(var i=0; i<columns.length;i++)
	{
		if(columns[i].nodeType != 1)
			continue;
			
		columns[i].style.width = columnWidth;
	}
}
ItemManager.prototype.PlayColumn = function(column)
{
	// set status attribute to play
	column.setAttribute("status", "play");
}
ItemManager.prototype.PauseColumn = function(column)
{
	// set status attribute to pause
	column.setAttribute("status", "pause");
}
ItemManager.prototype.GetColumnItemList = function(column)
{
	var itemList = null;
	var columnChildNodes = column.childNodes;
	for(var i=0; i<columnChildNodes.length; i++)
	{
		if(columnChildNodes[i].nodeType != 1)
			continue;
			
		var containerChildren = columnChildNodes[i].childNodes;
		var index = 0;
		for(var j=0; j<containerChildren.length; j++)
		{
			if(containerChildren[i].nodeType != 1)
				continue;
			else
			{
				if(index++ == 0) // controller node
					continue;
				
				itemList = containerChildren[j];
				break;
			}
		}
		
		if(itemList != null)
			break;
	}
	
	return itemList;
}
ItemManager.prototype.AddItem = function(column, item)
{  
	var itemList = this.GetColumnItemList(column);
	
	var text = ItemManager.ReplaceAngleBrackets(item.text);
	text = ItemManager.AddLinks(text);
	
	var screen_name = ItemManager.ReplaceAngleBrackets(item.user.screen_name);
	
	var time = ItemManager.GetItemTime(item.created_at);
	
	var itemHTML = "<div class=\"item\"><div class=\"item_linedot\"><div class=\"item_user_pic\"><a href=\"http://t.sina.com.cn/" + item.user.id + "\" target=\"_blank\"><img class=\"head\" src=\"" + item.user.profile_image_url + "\" title=\"" + item.user.screen_name + "\" pop=\"true\" /></a></div><div class=\"item_content\"><a class=\"name\" href=\"http://t.sina.com.cn/" + item.user.id + "\" uid=\"" + item.user.id + "\" target=\"_blank\" title=\"" + item.user.screen_name + "\">" + screen_name + "</a>：<span>" + text + "</span>";
	if(item.thumbnail_pic != null)
		itemHTML = itemHTML + "<div class=\"item_pic\"><a href=\"" + item.original_pic + "\" target=\"_blank\"><img class=\"thumbnail_pic\" src=\"" + item.thumbnail_pic + "\" pop=\"true\" /></a></div>";
	itemHTML = itemHTML + "<div class=\"item_foot\" vbid=\"" + item.id + "\"><div class=\"item_time\"><a href=\"http://api.t.sina.com.cn/" + item.user.id + "/statuses/" + item.id + "?source=" + appkey + "\" class=\"oplink\" target=\"_blank\">" + time + "</a></div><div class=\"item_operations\"><a href=\"javascript:void(0)\" class=\"oplink\" onclick=\"Monitor.collectMessage(this); return false;\" title=\"收藏\">收藏</a></div><div class=\"item_operations\"><a href=\"javascript:void(0)\" class=\"oplink\" onclick=\"Monitor.forwardMessage(this); return false;\" title=\"转发\">转发</a></div></div></div></div></div>";
	itemList.innerHTML = itemHTML + itemList.innerHTML;
	
	var itemcount = parseInt( column.getAttribute("itemcount") );

	if(itemcount == this.MAX_ITEM_NUM)
	{
		var lastItem = itemList.lastChild;
		while(lastItem.nodeType != 1)
			lastItem = lastItem.previousSibling;
			
		itemList.removeChild(lastItem);
	}
	else
	{
		itemcount++;
		column.setAttribute("itemcount", String(itemcount))
	}
}
ItemManager.prototype.Walkthrough = function(keyword, item)
{    
	var columns = document.getElementById("itemManager").childNodes;

	for(var i=0; i<columns.length;i++)
	{
		if(columns[i].nodeType != 1)
			continue;
			
		if(columns[i].getAttribute("status") == "play")
		{
			var columnKeyWord = columns[i].getAttribute("keyword");
			
			if(columnKeyWord == keyword)
			{
				this.AddItem(columns[i], item);
			}
		}
	}
}
ItemManager.prototype.ContainKeyword = function(keyword)
{
	var retValue = false;
	var columns = document.getElementById("itemManager").childNodes;

	for(var i=0; i<columns.length;i++)
	{
		if(columns[i].nodeType != 1)
			continue;
			
		if(columns[i].getAttribute("keyword") == keyword)
		{
			retValue = true;
			break;
		}
	}
	
	return retValue;
}
ItemManager.GetItemTime = function(created_at)
{
	var iTimeStart = created_at.indexOf(" ") + 1;
	
	var iColon = created_at.indexOf(":");
	var iTimeEnd = created_at.indexOf(" ", iColon) - 3; // remove the second info
	return created_at.substring(iTimeStart, iTimeEnd);
}
ItemManager.AddLinks = function(text)
{
	var httpText = text;

	var httpStartIndex = httpText.indexOf("http://");
	while(httpStartIndex != -1)
	{
		var preText = "";
		if(httpStartIndex > 0)
			preText = httpText.substring(0, httpStartIndex);

		var postText = "";
		
		var httpString;
		var httpEndIndex = ItemManager.SearchLinkEndIndex(httpText, httpStartIndex);
		if(httpEndIndex == -1)
		{
			httpString = httpText.substring(httpStartIndex);
		}
		else
		{
			httpString = httpText.substring(httpStartIndex, httpEndIndex);
			postText = httpText.substring(httpEndIndex);
		}

		var httpLink = "<a class=\"oplink\" target=\"_blank\" href=\"" + httpString + "\">" + httpString + "</a>"
		
		httpText = preText + httpLink + postText;
		
		var nextSearchStart = httpStartIndex + httpLink.length - 1;

		httpStartIndex = httpText.indexOf("http://", nextSearchStart);
	}
	
	return httpText;
}
ItemManager.SearchLinkEndIndex = function(httpText, start)
{
	var index = start;
	for(index = start; index < httpText.length; index++)
	{
		var str = httpText.charAt(index);
		if( ("a" <= str && str <= "z") ||
			("A" <= str && str <= "Z") ||
			("0" <= str && str <= "9") ||
			"?" == str ||
			"&" == str ||
			"%" == str ||
			":" == str ||
			"/" == str ||
			"." == str)
		{
			continue;
		}
		else
			break;
	}
	if(index == httpText.length)
		index = -1;
		
	return index;
}
ItemManager.ReplaceAngleBrackets = function(text)
{
	var newText = text;
	newText = newText.replace(/</g, "&lt;");
	newText = newText.replace(/>/g, "&gt;");
	
	return newText;
}

function MessageItem(keyword, itemList)
{
	this.keyword = keyword;
	this.itemList = itemList;
}

//
function Monitor()
{
	this.NUM_MSG = 20;
	
	this.itemManager = new ItemManager();

	this.messageLists = new Array();
	this.messageIndex = this.NUM_MSG;
	
	this.serachKeywordIndex = -1;
	this.inSearching = false;
	this.fakeCount = 0;
	
	this.WAIT_TIME_COUNT = 30;
	this.searchTimeCount = 0;
}
Monitor.prototype.messageProc = function() 
{
	if(this.itemManager.GetColumnCount() == 0)
		return;
		
	//TODO: return if all columns paused

	if(this.messageIndex == this.NUM_MSG || this.messageIndex < 0)
	{
		this.searchMessages();
	}
	else
	{
		for(var i = 0; i < this.messageLists.length; i++)
		{
			if(this.messageLists[i].itemList == null)
				continue;
		
			var item = this.messageLists[i].itemList[this.messageIndex];
			if(item != null)
				this.itemManager.Walkthrough(this.messageLists[i].keyword, item);		
		}	
		this.messageIndex--;
	}
}
Monitor.prototype.searchMessages = function()
{
	if(this.inSearching)
	{
		this.searchTimeCount++;
		if(this.searchTimeCount < this.WAIT_TIME_COUNT)
		{
			return;
		}
		else
		{
			this.serachKeywordIndex--;
		}
	}	
	
	this.searchTimeCount = 0;
	this.inSearching = true;
	
	//Synchronize messageLists with columns
	if(this.serachKeywordIndex == -1)
	{
		for(var i = this.messageLists.length - 1; i >= 0; i--)
		{
			if(!this.itemManager.ContainKeyword(this.messageLists[i].keyword))
				this.messageLists.splice(i, 1);
		}
	}
	
	this.serachKeywordIndex++;
	
	if(this.serachKeywordIndex < this.messageLists.length)
	{
		var keyword = this.messageLists[this.serachKeywordIndex].keyword;
		var encodeStr = (encodeURI(keyword));
			
		var head = document.getElementsByTagName("head")[0] || document.documentElement;
		var script = document.createElement("script");
		script.src = "http://api.t.sina.com.cn/statuses/search.json?source=" + appkey + "&count=200&filter_ori=5&q=" + encodeStr + "&callback=monitor.searchCallback" + "&fakecount=" + this.fakeCount++;
		head.insertBefore( script, head.firstChild );
	}
}
Monitor.prototype.searchCallback = function(result)
{
	if(!this.inSearching)
		return;
	
	this.messageLists[this.serachKeywordIndex].itemList = result;
	this.inSearching = false;
	
	if(this.serachKeywordIndex == this.messageLists.length - 1)
	{
		this.serachKeywordIndex = -1;
		this.messageIndex = this.NUM_MSG - 1;
	}
}
Monitor.prototype.ContainKeyword = function(keyword)
{
	var retValue = false;
	
	for(var i = 0; i < this.messageLists.length; i++)
	{
		if(this.messageLists[i].keyword == keyword)
		{
			retValue = true;
			break;
		}
	}
	
	return retValue;
}
Monitor.prototype.AddColumn = function()
{
	var keyword = document.getElementById("textKeyword").value;
	
	if(!Monitor.CheckKeyword(keyword))
		return;
		
	document.getElementById("userGuide").style.display = "none";

	if(!this.ContainKeyword(keyword))
		this.messageLists.push(new MessageItem(keyword, null));
	
	if(!this.inSearching)
	{
		this.serachKeywordIndex = -1;
		this.messageIndex = -1;
	}

	this.itemManager.AddColumn(keyword);
}
Monitor.prototype.textKeyword_onkeypress = function(e)
{
	if(e.keyCode == 13)
		this.AddColumn();
}
Monitor.prototype.DeleteColumn = function(obj)
{
	var column = obj.parentNode.parentNode.parentNode.parentNode;
	this.itemManager.DeleteColumn(column);
}
Monitor.prototype.PlayColumn = function(obj)
{
	var column = obj.parentNode.parentNode.parentNode.parentNode;
	this.itemManager.PlayColumn(column)
}
Monitor.prototype.PauseColumn = function(obj)
{
	var column = obj.parentNode.parentNode.parentNode.parentNode;
	this.itemManager.PauseColumn(column)
}
Monitor.CheckKeyword = function(keyword)
{
	var isLegal = true;
	
	if(keyword == "")
		return false;

	var i;
	for(i = 0; i < keyword.length; i++)
	{
		var str = keyword.charAt(i);
		if(" " == str)
		{
			continue;
		}
		else
			break;
	}
	if(i == keyword.length)
		isLegal = false;
		
	return isLegal;
}
Monitor.login = function() {
	if(WB.connect.checkLogin())
	{
		WB.client.parseCMD(
			"/account/verify_credentials.json", 
			function(sResult, bStatus) {
				if(bStatus)
				{
					var message = "您好: " + sResult.name;
					Monitor.openConfirmDialog(message);
				}
			}
		);
	}
	else
	{
		WB.connect.login(
			function() {
				Monitor.openConfirmDialog("您已成功登录！");
			}
		);
	}
}
Monitor.forwardMessage = function(obj) {
	if(WB.connect.checkLogin())
	{
		scope.id = obj.parentNode.parentNode.getAttribute("vbid");
		var textNode = obj.parentNode.parentNode.previousSibling;
		while(textNode.nodeName != "SPAN")
			textNode = textNode.previousSibling;

		$("#message-content")[0].innerHTML = textNode.innerHTML;
		$( "#message-forward-content" )[0].value = "";
		$("#dialog-message").dialog("open");
	}
	else
	{
		Monitor.openConfirmDialog("此操作需要登录，请您先点击右上角的红色按钮登录，谢谢！");
	}
}
Monitor.collectMessage = function(obj) {
	if(WB.connect.checkLogin())
	{
		scope.id = obj.parentNode.parentNode.getAttribute("vbid");
		WB.client.parseCMD(
			"/favorites/create.json", 
			function(sResult, bStatus) {
				if(bStatus)
				{
					Monitor.openConfirmDialog("收藏成功！");
				}
			}, 
			{
				id: scope.id
			},
			{
				'method': 'post'
			}
		);
	}
	else
	{
		Monitor.openConfirmDialog("此操作需要登录，请您先点击右上角的红色按钮登录，谢谢！");
	}
}
Monitor.openConfirmDialog = function(str)
{
	$("#confirm-content")[0].innerHTML = str;
	$("#dialog-confirm").dialog("open");
}

var $CONFIG = {
		$uid : "",
		$id  : ""
	};

var scope = $CONFIG;

monitor = new Monitor();

function timerCallback()
{
	monitor.messageProc();
}
window.setInterval(timerCallback,2000);

$(function() {

	$( "#dialog-message" ).dialog({
		modal: true,
		autoOpen: false,
		width: 400,
		open: function(event, ui) { $("#message-forward-content")[0].focus(); },
		buttons: {
			发送: function() {
				WB.client.parseCMD(
					"/statuses/retweet/#{id}.json", 
					function(sResult, bStatus) {
						if(bStatus)
						{
							Monitor.openConfirmDialog("发送成功！");
						}
					}, 
					{
						id: scope.id,
						status: $( "#message-forward-content" )[0].value
					},
					{
						'method': 'post'
					}
				);
				
				$( this ).dialog( "close" );
			}
		}
	});

	$( "#dialog-confirm" ).dialog({
		modal: true,
		autoOpen: false,
		width: 300,
		buttons: {
			OK: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	
});