/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
;

describe('docGet', function () {
    it('should return the first matching node', function () {
        var target = xml.docGet(xml.doc(xml.elt('doll', [xml.elt('doll', [xml.text('a')])
                                             , xml.elt('doll', [xml.text('b')])
                                             , xml.elt('doll', [xml.text('c')])
                                             , xml.elt('doll', [xml.text('d')])]))
                    , ['doll', 'doll']);
        assert.equal(xml.value(target), 'a');
    });
});
