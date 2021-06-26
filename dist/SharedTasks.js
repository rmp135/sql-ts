"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCase = void 0;
var change_case_1 = require("change-case");
/**
 * Converts the casing of a string.
 *
 * @export
 * @param {string} name The name to convert.
 * @param {string} caseType The case type to convert into.
 * @returns The converted name.
 */
function convertCase(name, caseType) {
    /** removes any number at the beginning of the string */
    var scapedName = name.replace(/^([0-9]+)/g, "");
    switch (caseType) {
        case 'pascal':
            return change_case_1.pascalCase(scapedName);
        case 'camel':
            return change_case_1.camelCase(scapedName);
        case 'lower':
            return scapedName.toLowerCase();
        case 'upper':
            return scapedName.toUpperCase();
        default:
            return scapedName;
    }
}
exports.convertCase = convertCase;
