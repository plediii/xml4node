/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
, testParents = require('./testParents')
;

describe('appendNode', function () {
    
    it('should add a new element to a childless parent', function () {
        var parent = xml.elt('mama');
        var child = xml.elt('baby');
        xml.appendNode(parent, child);
        assert.equal(parent.children.length, 1);
        assert.equal(parent.children[0].name, 'baby');
        assert.equal(parent.hash.baby.length, 1);
        assert.equal(parent.children[0].parent, parent);
        testParents(parent);
    });

    it('should add an existing node', function () {
        var parent = xml.elt('mama');
        var alice = xml.elt('baby', [xml.text('alice')]);
        xml.appendNode(parent, alice);
        assert.equal(alice.parent, parent);
        var betty = xml.elt('baby', [xml.text('betty')]);
        xml.appendNode(parent, betty);
        assert.equal(betty.parent, parent);
        assert.equal(parent.hash.baby.length, 2);
        assert.equal(xml.value(parent.hash.baby[0]), 'alice');
        assert.equal(xml.value(parent.hash.baby[1]), 'betty');
        testParents(parent);
    });

    it('should parse a string second argument', function () {
        var parent = xml.elt('mama');
        xml.appendNode(parent, '<baby>betty</baby>');
        assert.equal(parent.hash.baby.length, 1);
        assert.equal(xml.value(parent.hash.baby[0]), 'betty');
        testParents(parent);
    });


});

