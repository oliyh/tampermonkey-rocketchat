// ==UserScript==
// @name        Rocket Chat thread improvement
// @namespace   http://tampermonkey.net
// @version     1.0
// @description Improve UX of Rocket Chat threads
// @author      oliyh
// @match       <your domain here>
// @grant       GM_addStyle
// ==/UserScript==

GM_addStyle ( `
  .messages-box .message.collapsed {
    display: none;
  }
 ` );

(function() {
  'use strict';
  function setUp() {
    if (document.querySelectorAll('.sidebar-item').length === 0) {
      setTimeout(setUp, 500);
      return;
    }

    document.querySelectorAll('.sidebar-item').forEach((node) => registerRoom(node));
    currentChannelUrl = window.location.href;
    setupThreadsSection();
    setInterval(updateAllThreads, 2000);
  }

  var currentChannelUrl = window.location.href;
  var threads = {};

  function registerRoom(node) {
    node.addEventListener('click', function() {
      currentChannelUrl = node.querySelector('a').href;
      console.log('Room changed', currentChannelUrl);
      setTimeout(updateAllThreads, 200);
    });
  }

  function setupThreadsSection() {
    var roomsNode = document.querySelector('.rooms-list');
    var threadsSection = document.createElement('UL');
    threadsSection.className = 'rooms-list__list';
    threadsSection.id = 'threadsSection';
    roomsNode.insertBefore(threadsSection, roomsNode.querySelector('.rooms-list__type'));

    var threadsHeader = document.createElement('H3');
    threadsHeader.className = 'rooms-list__type';
    var threadsHeaderContent = document.createTextNode("Threads");
    threadsHeader.appendChild(threadsHeaderContent);
    roomsNode.insertBefore(threadsHeader, threadsSection);
  }

  function updateThreadsSection() {
    var threadsSection = document.getElementById('threadsSection');

    // clear all content
    threadsSection.innerHTML = '';

    for (let [threadId, attrs] of Object.entries(threads)) {
      if (attrs.channelUrl == currentChannelUrl) {
        var item = document.createElement('LI');
        item.className = 'sidebar-item js-sidebar-type-c';
        item.onclick = attrs.openThread;

        var messageTop = document.createElement('DIV');
        messageTop.className = 'sidebar-item__message-top';
        messageTop.append(document.createTextNode(attrs.topic.substring(0, 26)));
        item.append(messageTop);

        var badge = document.createElement('SPAN');
        badge.className = 'badge badge--group-mentions';
        badge.innerHTML = attrs.unreadCount;
        var messageBottom = document.createElement('DIV');
        messageBottom.className = 'sidebar-item__message-bottom';
        messageBottom.append(badge);
        item.append(messageBottom);

        if (attrs.unreadCount > 0) {
          item.classList.add('sidebar-item--unread');
          badge.classList.add('badge--unread');
        }

        threadsSection.append(item);
      }
    }
  }

  function updateAllThreads() {
    document.querySelectorAll('.message-discussion').forEach(updateThread);
    updateThreadsSection();
  }

  function markThreadButtonRead(node) {
    node.style.backgroundColor = 'gray';
  }

  function markThreadButtonUnread(node) {
    node.style.backgroundColor = 'red';
  }

  function updateThread(node) {
    var lastMessageTime = node.querySelector('.discussion-reply-lm').innerText;
    var replyCount = parseInt(node.querySelector('.reply-counter').innerText);
    var threadId = node.parentElement.id;
    var openThreadButton = node.querySelector('.js-open-thread');

    if (threads[threadId] === undefined) {
      // new thread
      threads[threadId] = {replyCount: replyCount,
                           unreadCount: replyCount,
                           channelUrl: currentChannelUrl,
                           channelName: document.querySelector('.rc-header__name').innerText,
                           topic: node.parentNode.querySelector('.message-body-wrapper .body').textContent.trim(),
                           openThread: function() { openThreadButton.click(); }};

      markThreadButtonUnread(openThreadButton);

      openThreadButton.addEventListener('click', function() {
        // mark all as read
        threads[threadId].replyCount = parseInt(node.querySelector('.reply-counter').innerText);
        threads[threadId].unreadCount = 0;
        markThreadButtonRead(openThreadButton);
      });

    } else {
      // existing thread
      if (threads[threadId].replyCount === replyCount) {
        // all up to date
      } else {
        // new message
        threads[threadId].unreadCount = (replyCount - threads[threadId].replyCount) + threads[threadId].unreadCount;
        threads[threadId].replyCount = replyCount;
        markThreadButtonUnread(openThreadButton);
      }
    }
  }

  setUp();
})();
