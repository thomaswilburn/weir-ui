Weir UI
-------

A new UI for `Weir <https://github.com/thomaswilburn/Weir/>`_. Made of web components and spite.

Events
------

In addition to the DOM events used to communicate between parent and child components, modules may use a global event bus to distribute commands more widely. Event bus events are namespaced roughly by subject area (e.g., ``connection:*`` for events related to auth and connection status).

* ``connection:totp-challenge`` - issued by the API module when a request is rejected. The get/post method will also throw, which can be handled or ignored.
* ``connection:established`` - issued when the ``<connection-status>`` component successfully authorizes, so that other components can update from the server.
* ``stream:counts`` - issued by the story list when there's an update in the unread/total table on the server.
* ``stream:selected`` - issued by the story list when the user picks a story to read, so that the renderer component can display it.

