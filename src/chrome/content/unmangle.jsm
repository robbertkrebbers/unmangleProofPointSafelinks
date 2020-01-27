Components.utils.import("resource://gre/modules/Services.jsm");

var EXPORTED_SYMBOLS = ["unmangleProofPointSafelinks"];

var unmangleProofPointSafelinks = {

  init: function (window) {
    // the "messagepane" element is the HTML display of a message. Even for
    // text/plain messages you get a HTML display, because that's how tbird
    // renders things.
    var messagepane = window.document.getElementById("messagepane");
    if (messagepane) {
      messagepane.addEventListener("load", unmangleProofPointSafelinks.onMessagePaneLoad, true);
    }

    // The "content-frame" element is used by the editor to enable
    // composing messages. Hook into to unmangle cited links.
    var editor = window.document.getElementById("content-frame");
    if (editor) {
      editor.addEventListener("load", unmangleProofPointSafelinks.onComposerLoad, true);
    }
  },

  destroy: function (window) {
    var messagepane = window.document.getElementById("messagepane");
    if (messagepane) {
      messagepane.removeEventListener("load", unmangleProofPointSafelinks.onMessagePaneLoad, true);
    }

    var editor = window.document.getElementById("content-frame");
    if (editor) {
      editor.removeEventListener("load", unmangleProofPointSafelinks.onComposerLoad, true);
    }
  },

  decodeProofPointURL: function (url) {
    var url = url.replace(/\_/g, "/");
    return url.replace(/\-([A-F0-9][A-F0-9])/g, function(match,hex,offset,string) {
      return String.fromCharCode(parseInt(hex,16));
    });
  },

  unmangleLink: function (a) {
    if (a.hostname.endsWith('urldefense.proofpoint.com') == false) {
      return;
    }

    //remember original url
    var orgUrl=a.href;

    var doInner = false;

    // This is a pretty lame test
    if (a.innerHTML.includes('urldefense.proofpoint.com')) {
      doInner = true;
    }

    var terms = a.search.replace(/^\?/, '').split('&');

    for (var i=0; i < terms.length; i++) {
      var s = terms[i].split('=');
      if (s[0] == 'u') {
        a.href = unmangleProofPointSafelinks.decodeProofPointURL(s[1]);
        a.title="Proofpoint Unmangled from: "+orgUrl;

        if (doInner) {
          a.textContent = a.href;
        }
        return;
      }
    }
  },

  unmangleAllLinks: function (doc) {
    var links = doc.getElementsByTagName("a");
    for (var i=0; i < links.length; i++) {
      unmangleProofPointSafelinks.unmangleLink(links[i]);
    }
  },

  onMessagePaneLoad: function (e) {
    unmangleProofPointSafelinks.unmangleAllLinks(e.originalTarget);
  },

  unmangleContent: function (text) {
    text.textContent =
      text.textContent.replace(/https:\/\/urldefense\.proofpoint\.com\/v2\/url\?u=([^&]*)&[^>\s]*/g,
      function(match,url,offset,string) {
        return unmangleProofPointSafelinks.decodeProofPointURL(url);
      });
  },

  onComposerLoad: function (e) {
    var windows = Services.wm.getEnumerator("");
    if (windows.hasMoreElements()) {
      var window = windows.getNext();
      window.setTimeout(unmangleProofPointSafelinks.delayedInit, 1, e);
    }
  },

  delayedInit: function (e) {
    var doc = e.originalTarget;
    var spans = doc.getElementsByTagName("span");
    for (var i=0; i < spans.length; i++) {
      var span = spans[i];
      for (var j=0; j < span.childNodes.length; j++) {
        var node = span.childNodes[j]
        if (node.nodeName == '#text') {
          unmangleProofPointSafelinks.unmangleContent(node);
        }
      }
    }
    var pres = doc.getElementsByTagName("pre");
    for (var i=0; i < pres.length; i++) {
      console.log(pres[i]);
      unmangleProofPointSafelinks.unmangleContent(pres[i]);
    }
    unmangleProofPointSafelinks.unmangleAllLinks(doc);
  },
};
