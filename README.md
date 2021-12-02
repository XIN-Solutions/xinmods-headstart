# XINMods headstart

A number of services that will help you speed up your XINMods based backend development.

To understand how to interact with the BloomreachXM backend enriched with the XIN mods project look here:

* https://npmjs.com/package/xinmods
* https://xinsolutions.co.nz/bloomreach-headless-cms-caas

## HotReload frontend integration

To integrate the backend's websocket messaging notifications regarding updates to the backend's code 
(styles for example), you can add the following snippet to where ever you think is best. Relies on jQuery, but
should be easy enough to make less jQuery-y.

Also relies on a Config object with a `hotReload` boolean property to be available on the window context. 
    
    (function($, undefined) {
    
        /**
         * If hotreload is on, let's start a websocket connection
         */
        function initialiseHotReload() {

            if (window.Config && Config.hotReload) {
                var port = Config.hotPort;
                var socket = new WebSocket("ws://localhost:" + port);
    
                // opened
                socket.onopen = function() {
                    console.log("Connected to HotReload");
                };
    
                // got a message!
                socket.onmessage = function(msg) {
                    try {
    
                        const actionMsg = JSON.parse(msg.data);
    
                        if (actionMsg.action === "reload") {
                            $("link[rel='stylesheet']").each(function(idx, el) {
    
                                // is this the one we're interested in?
                                if ($(el).attr("href").indexOf(actionMsg.file) === -1) {
                                    return;
                                }
    
                                // make sure we have the original URL
                                if (!$(el).data("href")) {
                                    $(el).data("href", $(el).attr("href"));
                                }
    
                                // Update the URL
                                var url = $(el).data("href");
                                var hasRequestParam = url.indexOf("?") !== -1;
                                var timestamp = "tstamp=" + new Date().getTime();
                                $(el).attr("href",url + (hasRequestParam? "&" : "?") + timestamp);
                            })
                        }
                    }
                    catch (ex) {
                        console.error("Couldn't parse incoming payload", msg.data, ex);
                    }
                };
    
                socket.onclose = function() {
                    console.error("HotReload connection troubles. Retrying");
                    setTimeout(initialiseHotReload, 4000);
                };
    
            }
        }
    
        //
        //  Initialise swiper belts
        //
        $(document).ready(function() {
            initialiseHotReload();
        });
    
    })(jQuery);
