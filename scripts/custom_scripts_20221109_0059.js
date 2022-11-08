// Channel IO
(function() {
	var w = window;
	if (w.ChannelIO) {
	  return (window.console.error || window.console.log || function(){})('ChannelIO script included twice.');
	}
	var ch = function() {
	  ch.c(arguments);
	};
	ch.q = [];
	ch.c = function(args) {
	  ch.q.push(args);
	};
	w.ChannelIO = ch;
	function l() {
	  if (w.ChannelIOInitialized) {
		return;
	  }
	  w.ChannelIOInitialized = true;
	  var s = document.createElement('script');
	  s.type = 'text/javascript';
	  s.async = true;
	  s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
	  s.charset = 'UTF-8';
	  var x = document.getElementsByTagName('script')[0];
	  x.parentNode.insertBefore(s, x);
	}
	if (document.readyState === 'complete') {
	  l();
	} else if (window.attachEvent) {
	  window.attachEvent('onload', l);
	} else {
	  window.addEventListener('DOMContentLoaded', l, false);
	  window.addEventListener('load', l, false);
	}
	})();
	ChannelIO('boot', {
	"pluginKey": "52dc86f4-60d0-4467-9ded-de3962275bfc"
});


// Yandex Metrica
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

ym(88154172, "init", {
	clickmap:true,
	trackLinks:true,
	accurateTrackBounce:true
});


// live internet
// (function(d,s){d.getElementById("licnt3009").src="https://counter.yadro.ru/hit;statground?t58.6;r"+escape(d.referrer)+
// ((typeof(s)=="undefined")?"":";s"+s.width+"*"+s.height+"*"+
// (s.colorDepth?s.colorDepth:s.pixelDepth))+";u"+escape(d.URL)+
// ";h"+escape(d.title.substring(0,150))+";"+Math.random()})
// (document,screen)


// clarify
(function(c,l,a,r,i,t,y){
	c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
	t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
	y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "a6ov1hdvev");


// smartsize
// 구글 차트의 사이즈를 자동으로 리사이즈 한다.
(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  // smartresize 
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');


// Change Title
function changeTitle(inputTitle) {
	// 메타 태그 변경
	inputTitle += " / 통계마당 Statistical Ground"
	document.title = inputTitle
	$("meta[property='og\\:title']").attr("content", inputTitle);
}


// Copy to Clipboard
function copyToClipboard(val) {
	const t = document.createElement("textarea");
	document.body.appendChild(t);
	t.value = val;
	t.select();
	document.execCommand('copy');
	document.body.removeChild(t);
	
	alert("클립보드에 복사되었습니다.");
}


// is empty
function isEmpty(value)
{
	if( value == "" || value == null || value == undefined || value == "None" || ( value != null && typeof value == "object" && !Object.keys(value).length ) )
	{ return true }
	else{ return false } 
}


// linkify
function linkify(inputText) {
	var replacedText, replacePattern1, replacePattern2, replacePattern3;

	//URLs starting with http://, https://, or ftp://
	replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

	//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

	//Change email addresses to mailto:: links.
	replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
	replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

	return replacedText;
}


// null converter
function nullConverter(value)
{
	if (value == "null")	{	return null;	}
	else						{	return value;	}
}


// number with comma
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// text length over cut
// 텍스트의 사이즈를 자동으로 줄여준다.
function textLengthOverCut(txt, len, lastTxt) {
	if (len == '' || len == null) { // 기본값
		len = 20;
	}
	if (lastTxt == '' || lastTxt == null) { // 기본값
		lastTxt = '...';
	}
	if (txt.length > len) {
		txt = txt.substr(0, len) + lastTxt;
	}
	return txt;
}


// zero converter
function zeroConverter(value)
{
	if (value == "null")	{	return 0;	}
	else						{	return value;	}
}