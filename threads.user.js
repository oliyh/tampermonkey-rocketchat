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

  #threadsSection .sidebar-item.unread {
    color: red;
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
    setupThreadsSection();
    setInterval(updateAllThreads, 2000);
  }

  var threads = {};

  function registerRoom(node) {
    node.addEventListener('click', function() {
      console.log('Room changed');
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
      var item = document.createElement('LI');
      item.className = 'sidebar-item sidebar-item--unread js-sidebar-type-c';
      if (attrs.unreadCount > 0) {
        item.classList.add('unread');
      }
      item.onclick = attrs.openThread;
      item.append(document.createTextNode('#' + attrs.channelName + ' / ' + attrs.topic.substring(0, 20) + ": " +
                                          attrs.unreadCount + '/' + (attrs.replyCount + attrs.unreadCount)));
      threadsSection.append(item);
    }
  }

  function updateAllThreads() {
    document.querySelectorAll('.message-discussion').forEach(updateThread);
    updateThreadsSection();
  }

  function updateThread(node) {
    var lastMessageTime = node.querySelector('.discussion-reply-lm').innerText;
    var replyCount = parseInt(node.querySelector('.reply-counter').innerText);
    var threadId = node.parentElement.id;
    var openThreadButton = node.querySelector('.js-open-thread');

    if (threads[threadId] === undefined) {
      // new thread
      threads[threadId] = {replyCount: replyCount,
                           unreadCount: 0,
                           channelName: document.querySelector('.rc-header__name').innerText,
                           topic: node.parentNode.querySelector('.message-body-wrapper .body p').innerText,
                           openThread: function() { openThreadButton.click(); }};

      openThreadButton.addEventListener('click', function() {
        // mark all as read
        threads[threadId].replyCount = parseInt(node.querySelector('.reply-counter').innerText);
        node.querySelector('.js-open-thread').style.backgroundColor = 'gray';
      });

    } else {
      // existing thread
      if (threads[threadId].replyCount === replyCount) {
        // all up to date
        threads[threadId].unreadCount = 0;
      } else {
        // new message
        threads[threadId].unreadCount = replyCount - threads[threadId].replyCount;
        node.querySelector('.js-open-thread').style.backgroundColor = 'red';
      }
    }
  }

  setUp();
})();
