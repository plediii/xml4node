/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
;

describe('value', function () {
    it('should return the text content of an element', function () {
        assert.equal(xml.value(xml.elt('monkey', [xml.text('kitten')])), 'kitten');
    });
});
