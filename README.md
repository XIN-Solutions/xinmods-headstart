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
is the variation into which the model can be created. This allows you to have several views on
the same data.


The third parameter is the function that converts some incoming information into something else. Then 
in your handlebars templates you can do the following. 

        <h2>Variations</h2>
        {{#use product.doc.items.variations as='tile'}}
            <pre>{{json .}}</pre>
        {{/use}}

or:

        <h2>Variations</h2>
        {{#each product.doc.items.variations as |var|}}
            {{#use var as='tile'}}
                <pre>{{json .}}</pre>
            {{/use}}
        {{/each}}

or as an inline function:

        <pre>
            {{{json (use product.doc.items.variations as='tile')}}}
        </pre>


You can feed it an array of elements that must be modelled, or a single object.

Within the `#use` block you will now have access to a variable called `tile` that contains the values
returned by the registered model transformation function. 

## Render `Image` instance

There is a Handlebars helper called `image-url` that lets you render an Image instance
returned by the xinmods package. If you pass it a string url, it'll just return the string. 

	hbs.registerHelper('image-url', function(image, options) {

Some examples:

    # resize width = 300
    {{image-url image width=300 }}

    # resize height = 200
    {{image-url image height=200}}           

    # resize width = 300, crop to 300x200
    {{image-url image width=300 cropX=300 cropY=200}}    


## Render HTML

Render some HTML by using the `html-field` handlebars helper. `document` expects the source document with its `hippo`
instance. The `field` value is the rich text object that is to be translated.  

    {{{html-field document=product.doc field=product.doc.items.body)}}}

To resolve links in the HTML block you can register a `LinkResolver` function with the `ContentParser` class.

By default, the following LinkResolver is registered as follows.

    const NoResolver = (linkInfo) => { 
        console.log("Did not resolve", linkInfo); return '#'
    };

    ContentParser.setLinkResolver(options.linkResolver || NoResolver);

## Components

### Accordion

Render an accordion in the page, to use specify the following

    {{> accordion/render
            id='faq'
            items=(use product.doc.items.questions as='accordionItem')
    }}

Where `id` is the html ID the div gets (and other identifiers are based on).

Where items is an array of the following:

* `title`: the title in the accordion header
* `body`: the body to show in the accordion element.

Optional parameters:

* `style`: an additional class added to the wrapper div that allows for extra styling.


### Breadcrumb

Render a breadcrumb in the page, to use specify the following:

    {{> breadcrumb/render items=breadcrumb}}

Where `breadcrumb` is an array of the following items:

* `url`; the URL to link to
* `label`; the label to show. 

Optional parameters:

* `style`; the class that is added to the wrapping div for the breadcrumb container.

### Carousel

To use at least specify the following:

    {{> carousel/render id="carouselUniqueId" items=carouselItems }}

The `carouselItems` should have a structure of: 

* `title` the title of the slide
* `description` the description of the slide
* `imageUrl` the image of the carousel
* `imageAlt` the value for the slide image alt

Optional arguments:

* `style`: the class to add to the `carousel` wrapper div
* `indicators="off"`: if specified the indicator dots at the bottom disappear
* `navigation="off"`: if specified the navigation arrows are not rendered

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
