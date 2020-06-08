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
    var _a, _b;
    var dialect = (_a = config.dialect, (_a !== null && _a !== void 0 ? _a : config.client.toString()));
    // Use aliases from knex.
    var aliases = {
        'pg': 'postgres',
        'sqlite': 'sqlite3',
        'mysql2': 'mysql'
    };
    var adapter = null;
    try {
        adapter = require("./Adapters/" + (_b = aliases[dialect], (_b !== null && _b !== void 0 ? _b : dialect)));
    }
    catch (err) {
        throw new Error("Unable to find adapter for dialect '" + dialect + "'.");
    }
    return new adapter.default();
}
exports.buildAdapter = buildAdapter;
