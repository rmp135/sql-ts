"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns an AdapterInterface that matches the dialect.
 *
 * @export
 * @param {any} dialect The name of SQL adapter that should be returned.
 * @returns {AdapterInterface} The adapter for connecting to a SQL database.
 */
function buildAdapter(config) {
    var dialect = config.dialect || config.client.toString();
    // Use aliases from knex.
    // https://github.com/tgriesser/knex/blob/master/src/index.js
    var aliases = {
        'pg': 'postgres',
        'sqlite': 'sqlite3'
    };
    var adapter = null;
    try {
        adapter = require("./Adapters/" + (aliases[dialect] || dialect));
    }
    catch (err) {
        throw new Error("Unable to find adapter for dialect '" + dialect + "'.");
    }
    return new adapter.default();
}
exports.buildAdapter = buildAdapter;
