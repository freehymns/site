/*
Copyright (c) 2026 freehymns.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// For index.html
function load_index() {
	if (window.innerWidth > 750) {
		document.getElementById("leftpane").style.display = "block";
		document.getElementById("home").style.marginLeft = "23em";
		var url = window.event.target.href;
		document.getElementById("iframe").src = url;
		document.getElementById("iframe").style.display = "block";
		window.event.preventDefault();
	}
}

// For titles.html, etc.
var Topic = null;
var IndexName = null;

function get_scroll_top() {
	return (document.body.scrollTop ? document.body : document.documentElement).scrollTop;
}

function set_scroll_top(y, tryno) {
	var scrollNode = (document.body.scrollTop ? document.body : document.documentElement);
	scrollNode.scrollTop = y;
	if (Math.abs(scrollNode.scrollTop - y) > 10 && (tryno == null || tryno < 20)) {
		setTimeout(set_scroll_top, 2, y, (tryno == null ? 1 : tryno + 1));
	}
}

function set_topic(new_topic) {
	Topic = new_topic;
	if (Topic != "" && Topic != "all") {
		var new_title = Topic.charAt(0).toUpperCase() + Topic.substring(1) + " Hymns";
		document.getElementById("index_title").textContent = new_title;
		var divs = document.getElementsByTagName("div");
		for (var j = 0; j < divs.length; j++) {
			var topics = divs[j].getAttribute("topics");
			if (topics == null || topics.indexOf(Topic) < 0) {
				divs[j].style.display = "none";
			}
		}
	}
}

function index_loaded() {
	IndexName = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1).replace(".html", "");
	if (" #christmas#easter#all".indexOf(window.location.hash) > 0) {
		set_topic(window.location.hash.substring(1));
		save_index_state();
	} else {
		load_index_state();
	}
}

function save_index_state() {
	document.cookie = "index=" + IndexName + "," + Topic + "," + get_scroll_top() + "; SameSite=Strict; Path=/";
}

function load_index_state() {
	if (IndexName == null) {
		return;
	}
	
	var cookies = document.cookie.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i];
		while (cookie.charAt(0) == ' ') {
			cookie = cookie.substring(1);
		}
		if (cookie.indexOf("index=" + IndexName) == 0) {
			var parts = cookie.substring(6).split(",");
			set_topic(parts[1]);
			set_scroll_top(parseInt(parts[2]));
			break;
		}
	}
}
