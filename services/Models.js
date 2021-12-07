module.exports = {

    /**
     * Contains all current decorators.
     */
    transformations: {},

    /**
     * Register a new decorator based on the type.
     *
     * @param type {string} the type to register the function for
     * @param variation {string} the variation of the decorator
     * @param decorator {function<object>} the data decorator function
     * @param force {boolean} if true, ignore previous decorators for this type and overwrite.
     */
    register(type, variation, decorator, force = false) {
        if (this.transformations[type] && !force) {
            throw new Error("Decorating the same type twice.");
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
