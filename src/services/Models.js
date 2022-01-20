module.exports = {

    /**
     * Contains all current decorators.
     */
    transformations: {},

    /**
     * Register a bunch of decorator functions, you can pass it a map
     * of functions, which reads easier than having each of them inserted
     * individually.
     *
     * @param type {string} the type to register the function map for
     * @param map {object<string, function>>} an object with all maps
     */
    registerMultiple(type, map) {
        for (const variation in map) {
            if (!map.hasOwnProperty(variation)) {
                continue;
            }

            this.register(type, variation, map[variation]);
        }
    },

    /**
     * Register a default decorator that will be the fallback
     *
     * @param variation {string|'link'|'accordionItem'|'card'|'carouselSlide'} the variation to register a default implementation for
     * @param decorator {function} the data decorator function
     */
    registerDefault(variation, decorator) {
        this.register('__default__', variation, decorator);
    },

    /**
     * Register a new decorator based on the type.
     *
     * @param type {string} the type to register the function for
     * @param variation {string|'link'|'accordionItem'|'card'|'carouselSlide'} the variation of the decorator
     * @param decorator {function<object>} the data decorator function
     */
    register(type, variation, decorator) {
        if (this.transformations[type] && this.transformations[type][variation]) {
            console.log("Registering existing type variation, will override: ", type, variation);
        }

        if (!decorator) {
            throw new Error("No decorator function specified.");
        }

        this.transformations[type] = this.transformations[type] || {};
        this.transformations[type][variation] = decorator;
    },

    /**
     * Decorate an object with additional information by running it through a decorator
     * function that has previously been registered.
     *
     * @param context {object} the context of information that has a .type field which indicates how to decorate
     * @param variation {string} the name of the variation function to use for the decorating.
     * @param document {object} the base document the context belongs to, will be passed onto transformation function
     * @returns {{type}|*|null}
     */
    transform(context, variation = 'default', document = null) {
        let {type} = context;

        if (!type) {
            throw new Error("This model does not contain a `type` field.");
        }

        if (this.transformations[type]?.[variation]) {
            return this.transformations[type][variation](context, document ?? context);
        }

        console.log(`Did not find a transformer for type: '${context.type}' with variation '${variation}'`);
        return null;
    }


}
