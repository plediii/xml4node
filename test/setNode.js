/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
;

describe('setNode', function () {
    
    it('should add a new element to a childless parent', function () {
        var parent = xml.elt('mama');
        var child = xml.elt('baby');
        xml.setNode(parent, child);
        assert.equal(parent.children.length, 1);
        assert.equal(parent.children[0].name, 'baby');
        assert.equal(parent.hash.baby.length, 1);
    });

    it('should replace an existing node', function () {
        var parent = xml.elt('mama');
        var alice = xml.elt('baby', [xml.text('alice')]);
        xml.setNode(parent, alice);
        var betty = xml.elt('baby', [xml.text('betty')]);
        xml.setNode(parent, betty);
        assert.equal(parent.hash.baby.length, 1);
        assert.equal(xml.value(parent.hash.baby[0]), 'betty');
    });

    it('should parse a string second argument', function () {
        var parent = xml.elt('mama');
        xml.setNode(parent, '<baby>betty</baby>');
        assert(parent.hash.baby);
        assert.equal(parent.hash.baby.length, 1);
        assert.equal(xml.value(parent.hash.baby[0]), 'betty');
    });


});