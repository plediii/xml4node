/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
;

describe('defaultNode', function () {
    
    it('should add a new element to a childless parent', function () {
        var parent = xml.elt('mama');
        var child = xml.elt('baby');
        xml.defaultNode(parent, child);
        assert.equal(parent.children.length, 1);
        assert.equal(parent.children[0].name, 'baby');
        assert.equal(parent.hash.baby.length, 1);
    });

    it('should not replace an existing node', function () {
        var parent = xml.elt('mama');
        var alice = xml.elt('baby', [xml.text('alice')]);
        xml.defaultNode(parent, alice);
        var betty = xml.elt('baby', [xml.text('betty')]);
        xml.defaultNode(parent, betty);
        assert.equal(parent.hash.baby.length, 1);
        assert.equal(xml.value(parent.hash.baby[0]), 'alice');
    });

    it('should parse a string second argument', function () {
        var parent = xml.elt('mama');
        xml.defaultNode(parent, '<baby>betty</baby>');
        assert.equal(parent.hash.baby.length, 1);
        assert.equal(xml.value(parent.hash.baby[0]), 'betty');
    });

});
