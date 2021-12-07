# XINMods headstart

A number of services that will help you speed up your XINMods based backend development.

To understand how to interact with the BloomreachXM backend enriched with the XIN mods project look here:

* https://npmjs.com/package/xinmods
* https://xinsolutions.co.nz/bloomreach-headless-cms-caas

## Model transformations

You can register a model transformation, this will help you get a more useful representation in Handlebars.

To do so do something like this in your code. 

    const {Models} = require('xinmods-headstart');
    Models.register("xinmods:productvariation", "tile", (varBlock) => {
        return {
            type: varBlock.items.variationType,
            name: varBlock.items.variation,
            items: _.map(_.values(varBlock.items.variationitem), (el) => el.items)
        };
    });

Where the first parameter is the name of the document or compound type from brXM and the second
is the variation into which the model can be created. This allows you to have several different views on
the same data.

The third parameter is the function that converts some incoming information into something else. Then 
in your handlebars templates you can do the following. 

    {{#use (model 'tile' from variation)}}
        <pre>{{json .}}</pre>
    {{/use}}

Within the `#use` block you will now have access to a variable called `tile` that contains the values
returned by the registered model transformation function. 

## Render HTML

Render some HTML by creating a simple map with `(html-field doc htmlfield)`. `doc` should have the `hippo` instance.

    {{{parse-html (html-field product.doc product.doc.items.body)}}}

To resolve links in the HTML block you can register a `LinkResolver` function with the `ContentParser` class.

By default the following LinkResolver is registered as follows.

    const NoResolver = (linkInfo) => { 
        console.log("Did not resolve", linkInfo); return '#'
    };

    ContentParser.setLinkResolver(options.linkResolver || NoResolver);



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
