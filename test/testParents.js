/*jslint node: true */
"use strict";
var assert = require('assert');
var _ = require('underscore');

module.exports = function testParents (node) {
    _.each(node.children, function (child, idx) {
        assert(Object.is(child.parent, node), 'Child ' + idx + '(' + child.name + ') of ' + node.name + ' does not have the correct parent reference.');
        testParents(child);
    });
};
