# XINMods headstart

A number of services that will help you speed up your XINMods based backend development.

To understand how to interact with the BloomreachXM backend enriched with the XIN mods project look here:

* https://npmjs.com/package/xinmods
* https://xinsolutions.co.nz/bloomreach-headless-cms-caas

## Hooks

The module code can be hooked into by registering small pieces of code against one or more identifiers. For example,
providing information about common page components like the navigation can be accomplished by code like this:

    /**
     * Add loader that will retrieve the correct navigation on all pages
     */
    headstart.Hooks.register("beforeRender.common", async () => {
        const {Navigation} = require('xinmods-headstart').ModelServices;
        const navigation = await Navigation.getNavigationByPath(hippo, "/content/documents/site/navigation/default");
        return {navigation};
    });

This will register a piece of code against a handler called `beforeRender.common`. Each handler identifier can have
multiple functions registered against it. In this case a map with a `navigation` field is returned. The `commonpage`
relies on one being there to show the navigation component.

If you want to invoke hooks in your code you could write something like the code below -- it is found in the product
detail controller action.

    const {Hooks} = require('xinmods-headstart');

	// execute beforeRender hooks and smash them into a single map that
    // will function as the base of the render context object.
    const baseMap = await Hooks.invokeAllAsMap([
        "beforeRender.common",
        "beforeRender.product",
        "beforeRender.product.detail"
    ]);

    const product = await Products.getProduct(hippo, req.params.name);

    resp.render('products/product', Object.assign(baseMap, {
        product,
        baseModel: product
    }));

As you can see `invokeAllAsMap` will invoke all functions registered against the list of identifiers and return
results that are not falsy as a single map into `baseMap`. 

### Out-of-the-box hook identifiers

A list of out of the box hook identifiers can be found below:

* `beforeRender.common` -- invoked on all page renders
* `beforeRender.product` -- invoked on all page renders specific to the product module
* `beforeRender.product.detail` -- invoked only on the product detail page
* `beforeRender.product.landing` -- invoked only on the products landing page (product overview)


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


The third parameter is the function that converts some incoming information into something else. 

Then in your handlebars templates you can do the following. 

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

To resolve links in the HTML block you can register a `LinkResolver` function with the `ContentParser` class. Its
shape is as follows:

    const NoResolver = (linkInfo) => { 
        console.log("Did not resolve", linkInfo); return '#'
    };

    ContentParser.setLinkResolver(options.linkResolver || NoResolver);

By default, a `LinkResolver` is registered that tries to get URLs from documents by requesting their 'link' variation
model transformation. For example, if you have a `xinmods:product` type, you might create a link generator as follows:

    Models.register("xinmods:product", "link", (product) => {
        return product.path.replace("/content/documents", "");
    });

You must make sure to use `fetch` to pre-fetch the documents referenced by the HTML field.

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

### Card

Render a card in the page, use the following:

    {{> card/render variation="overlay" fullHeight=true item=(use product as="card") }}

Where `item` is supposed to be of type `Card` (described in `models.d.ts`):
    
    interface Card {
        headerText ?: string;
    
        title: string;
        description: string;
        link?: string;
    
        image: string;
        imageBottom ?: boolean;
        links ?: CardLink[];
    
        footerText ?: string;
    }

    interface CardLink {
        label: string;
        url: string;
        type: 'link' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    }

The partial takes a few parameters:

* `variation`: `horizontal`, `overlay`, or the default `vertical` (optional)
* `fullHeight`: a boolean that if set to true will fill the height in the column (optional)


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

### Navbar

The Bootstrap 5 Navbar component has been modelled as well. To use it write something like the following:

    {{> navbar/render
            style="navbar--example"
            image='https://getbootstrap.com/docs/5.0/assets/brand/bootstrap-logo.svg'
            navigation=navItems
    }}

This component allows you to overlay different files:

* `navbar/left.hbs`: the brand and product name part of the nav bar
* `navbar/search.hbs`: the search form
* `navbar/items.hbs`: the navbar items to render

The model used to render the navbar HBS component:


	interface Navbar {

	    /**
	     * ID for navbar toggler
	     */
	    id ?: string;

	    /**
	     * The style classes added to the wrapper
	     */
	    style ?: string;

	    /**
	     * Classes pushed onto the navbar wrapper div
	     */
	    barClasses ?: string;

	    /**
	     * Brand name (optional)
	     */
	    name ?: string;

	    /**
	     * Image shown (optional)
	     */
	    image ?: string;

	    /**
	     * Link name and/or image navigate to when clicked
	     */
	    link ?: string;

	    /**
	     * If set to true, search bar is shown
	     */
	    showSearch ?: boolean;

	    /**
	     * How to position the navbar.
	     */
	    position: 'default' | 'fixed-top' | 'fixed-bottom' | 'sticky-top'

	    /**
	     * A set of navigation items
	     */
	    navigation ?: NavbarItem[]

	}

The `navigation` option you can pass into the `navbar/render` partial has the following shape:

	/**
	 * A navigation item that is rendered in the navigation bar.
	 */
	interface NavbarItem {

	    /**
	     * Label in menu item
	     */
	    label: string;

	    /**
	     * Where does it link to?
	     */
	    url: string;

	    /**
	     * If true, will be grayed out
	     */
	    disabled ?: boolean;

	    /**
	     * If true, it's the current page.
	     */
	    active ?: boolean;

	    /**
	     * If children specified, we need to render an ID
	     */
	    id ?: string;

	    /**
	     * Children of this item (no url required if filled out)
	     */
	    children ?: NavbarItem[];
	}



## HotReload frontend integration

To integrate the backend's websocket messaging notifications regarding updates to the backend's code 
(styles for example), you can add the following snippet to where ever you think is best. 

    {{> core/hotreload }}

To enable it, you must set the following environment variables:

* `HOT_RELOAD = true`; must be true for this to work.
* `HOT_RELOAD_PORT`; the port at which websocket server is opened, by default 30303.

If you don't add the partial in your handlebars, you still get the reloading of the `require`-cache, which means your
backend code will automatically reload. 

