/*
        _                _ _           _   _               ___        __
       / \   _ __  _ __ | (_) ___ __ _| |_(_) ___  _ __   |_ _|_ __  / _| ___
      / _ \ | '_ \| '_ \| | |/ __/ _` | __| |/ _ \| '_ \   | || '_ \| |_ / _ \
     / ___ \| |_) | |_) | | | (_| (_| | |_| | (_) | | | |  | || | | |  _| (_) |
    /_/   \_\ .__/| .__/|_|_|\___\__,_|\__|_|\___/|_| |_| |___|_| |_|_|  \___/
            |_|   |_|

    Purpose:

        To retrieve information about the application from pacakge.json

 */

const fs = require('fs');

module.exports = {

    /**
     * @returns {object} the package json deserialised in javascript objects
     * @private
     */
    _getPackageJson() {

        try {
            const rawJson = fs.readFileSync("package.json", {encoding: "utf-8"});
            return JSON.parse(rawJson.toString());
        }
        catch (err) {
            console.error("Could not read package.json from the bundle. Caused by:", err);
            return null;
        }
    },

    /**
     * Get the application version as described in the package.json
     * @returns {string}
     */
    getVersion() {

        const pkgJson = this._getPackageJson();
        if (pkgJson === null) {
            return "v1.0.0";
        }

        return `v${pkgJson.version}`;
    },


};
