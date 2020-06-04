# tampermonkey-rocketchat

## Installation

1. Install the Tampermonkey or Greasemonkey extension
2. Install the script via the extension's UI
3. Customize the `@match` comment to match your domain e.g. `https://rocketchat.example.com/*`

## client-inline-images.user.js

Fetches images on the client when an image url is posted
- Useful if the server is behind a firewall but the client has a proxy

## threads.user.js

Improves the UX of threaded conversations by:
- Hiding replies within the main channel
- Adding a side panel tracking threads including unread messages
- Marking thread buttons when new messages are available
