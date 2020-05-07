// ==UserScript==
// @name        Rocket Chat client inline images
// @namespace   http://tampermonkey.net
// @version     1.0
// @description Inline images on the client
// @author      oliyh
// @match       <your domain here>
// @grant       GM_addStyle
// ==/UserScript==

(function() {
  'use strict';
  function setUp() {
    if (document.querySelectorAll('.wrapper ul').length === 0) {
      setTimeout(setUp, 500);
      return;
    }

    document.querySelectorAll('.sidebar-item').forEach((node) => registerRoom(node));
    backPopulate();
    watchForImageUrls();
  }

  function registerRoom(node) {
    node.addEventListener('click', function() {
      // time for the old room to be torn down before we check
      setTimeout(function() {
        backPopulate()
        watchForImageUrls();
      }, 500)
    });
  }

  const imageRegex = /(http.*\.(jpg|gif|png))/g;

  function onAppend(elem, f) {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.addedNodes.length) {
          m.addedNodes.forEach(function(n) {
            f(n);
          });
        }
      })
    })
    observer.observe(elem, {childList: true});
  }

  function watchForImageUrls() {
    var messageList = document.querySelector('.wrapper ul');
    if (messageList === undefined) {
      setTimeout(watchForImageUrls, 500);
      return;
    }

    if (messageList.classList.contains('client-inline-images__watched')) {
      // already watching, do nothing
    } else {
      messageList.classList.add('client-inline-images__watched');
      onAppend(messageList, processMessage);
    }
  }

  function backPopulate() {
    var messageList = document.querySelector('.wrapper ul');
    if (messageList === undefined) {
      setTimeout(backPopulate, 500);
      return;
    }

    messageList.querySelectorAll('li').forEach(processMessage);
  }

  function processMessage(node) {
    var textNode = node.querySelector && node.querySelector('.body p');
    if (textNode) {
      var imageUrl = textNode.innerText.match(imageRegex);
      if (imageUrl && !node.classList.contains('client-inline-images__processed')) {
        insertImage(node, imageUrl);
      }
    }
  }

  function insertImage(node, imageUrl) {
    var figure = document.createElement('FIGURE');
    var inlineImage = document.createElement('DIV');
    inlineImage.className = 'inline-image';
    inlineImage.style = "background-image: url('" + imageUrl + "');";
    var img = document.createElement('IMG');
    img.src = imageUrl;
    img.height = 200;
    img.className = 'gallery-item';

    inlineImage.append(img);
    figure.append(inlineImage);

    node.insertBefore(figure, node.querySelector('.message-actions'));
    node.classList.add('client-inline-images__processed');
  }

  setUp();
})();
