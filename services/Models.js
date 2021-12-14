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
     * Register a new decorator based on the type.
     *
     * @param type {string} the type to register the function for
     * @param variation {string} the variation of the decorator
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
     * @returns {{type}|*|null}
     */
    transform(context, variation = 'default') {
        const {type} = context;

        if (!context.type) {
            throw new Error("Context object does not have 'type' to determine transformation for.");
        }

        if (this.transformations[type][variation]) {
            return this.transformations[type][variation](context);
        }

        throw new Error(`Did not find a transformer for type: '${context.type}' with variation '${variation}'`);
    }


}
