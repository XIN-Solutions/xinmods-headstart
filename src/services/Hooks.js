/*
     _   _             _
    | | | | ___   ___ | | _____
    | |_| |/ _ \ / _ \| |/ / __|
    |  _  | (_) | (_) |   <\__ \
    |_| |_|\___/ \___/|_|\_\___/

    Purpose:

        To be able to register and run bits of code with particular identifiers.

 */

const _ = require('lodash');

module.exports = {

    funcs: {},

    /**
     * Generate a view (GET) endpoint that builds its view model off of registered hooks with IDs
     * specified in `ids`. The default template to use is specified in `template` but can be overridden with
     * a hook.
     *
     * @param template  {string} the template to use for rendering
     * @param ids {string[]} a list of hook ids to execute before rendering the template
     * @returns {(function(*=, *=): Promise<void>)|*}
     */
    viewEndpoint(template, ids) {
        const thiz = this;

        return async function(req, resp) {
            try {
                const viewModel = await thiz.invokeAllAsMap(ids, req, resp);
                const useTemplate = viewModel?.template ?? template;
                resp.render(useTemplate, viewModel);
            }
            catch (ex) {
                console.log("Something went wrong: ", ex);
                resp.status(500).send(ex.message);
            }
        };
    },

    /**
     * Register a new hook against a particular ID. One ID can have multiple hooks against it
     *
     * @param id    {string} the identifier to register
     * @param func  {function} the function to register.
     */
    register(id, func, override = false) {
        this.funcs[id] = this.funcs[id] ?? [];

        // clear out any existing code (might be a bad idea).
        if (override) {
            this.funcs[id] = [];
        }
        this.funcs[id].push(func);
    },

    /**
     * Retrieve all functions registered against a particular identifier.
     *
     * @param id {string|string[]} an id to look for
     * @param options {object} the options object
     * @param options.prefix {boolean} if true then search for any hook starting with 'id'
     */
    find(id, options = {prefix: false}) {
        const searchTerm = _.isArray(id) ? id : [id];

        // iterate over all keys and determine which match
        const allFuncs = new Set();
        for (const funcKey of _.keys(this.funcs)) {

            // searching for prefix but didnt find anything? continue.
            if (options.prefix && !searchTerm.find(term => funcKey.startsWith(term))) {
                continue;
            }
            // not searching for prefix and didn't find a direct match? continue.
            else if (!options.prefix && !searchTerm.find(term => funcKey === term)) {
                continue;
            }

            allFuncs.add(this.funcs[funcKey]);
        }

        return _.flatten([...allFuncs]);
    },

    /**
     * Invoke a set of registered functions. If they return a promise (when it's an
     * async function for example), we will wait for all of the promises to resolve. This
     * also means you might not get the results in the order you initially registered them, keep
     * this in mind.
     *
     * @param ids       {string|string[]} the prefix of the function that need to be invoked.
     * @param args      {array[]} all arguments to pass into the functions we're calling
     * @returns {Promise<*[]>}
     */
    async invokeAll(ids, ...args) {
        const all = ids[0] instanceof Function ? ids : this.find(ids, {prefix: false});
        const results = all.map(func => func(...args));

        // get a list of normal results
        const resolvedResults = results.filter(el => !(el instanceof Promise));

        // get a list of functions that result in a promise and wait for them to resolve
        const awaitsPromise = results.filter(el => el instanceof Promise);
        const promiseResults = await Promise.all(awaitsPromise);

        // return the list of concatenated results.
        return [].concat(...resolvedResults).concat(promiseResults);

    },

    /**
     * Convenience function that invokes all handlers with `ids` prefixes and mashes
     * the results into a single map.
     *
     * @param ids       {string|string[]} the prefix of the function that need to be invoked.
     * @param args      {array[]} all arguments to pass into the functions we're calling
     * @returns {Promise<{}>}
     */
    async invokeAllAsMap(ids, ...args) {
        // invoke all hooks with these ids
        const invokeResult = await this.invokeAll(ids, ...args);

        // keep only results that have a non-falsy result
        const withResult = invokeResult.filter(result => !!result);

        // mash everything into a single map.
        const output = {};
        for (const resultElement of withResult) {
            Object.assign(output, resultElement);
        }
        return output;
    }

}
