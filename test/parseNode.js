/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
, testParents = require('./testParents')
;

describe('parseNode', function () {

    it('should correctly parse a processing instruction', function () {
        var node = xml.parseNode('<?xml version="8.6"?>');
        assert.equal(node.type, 'processing');
        assert.equal(node.body, 'version="8.6"');
        testParents(node);
    });


    it('should correctly parse a root node', function () {
        var node = xml.parseNode('<server />');
        assert.equal(node.name, 'server');
        assert(node.children);
        assert.deepEqual(node.children, []);
        assert.deepEqual(node.hash, {});
        assert.deepEqual(node.attributes, {});
        testParents(node);
    });

    it('should fail to parse an invalid root node', function () {
        assert.throws(function () {
            xml.parseNode('<server');
        });
    });

    it('should correctly parse a node with text', function () {
        var node = xml.parseNode('<server>serverdata</server>');
        assert.equal(node.name, 'server');
        assert(node.children);
        assert.equal(1, node.children.length);
        assert.equal('text()', node.children[0].name);
        assert(node.hash['text()']);
        assert.equal(1, node.hash['text()'].length);
        assert.equal('text', node.hash['text()'][0].type);
        assert.equal('serverdata', node.hash['text()'][0].body);
        assert.deepEqual(node.attributes, {});
        testParents(node);
    });

    it('should correctly parse a node with a child element', function () {
        var node = xml.parseNode('<server><data></data></server>');
        assert.equal(node.name, 'server');
        assert.deepEqual(node.attributes, {});
        assert(node.children);
        assert.equal(1, node.children.length);
        assert.equal('data', node.children[0].name);
        assert(node.hash.data);
        assert.equal(1, node.hash.data.length);
        testParents(node);
    });

    it('should correctly parse a pair of different elements', function () {
        var node = xml.parseNode('<server><data></data><host/></server>');
        assert.equal(node.name, 'server');
        assert.deepEqual(node.attributes, {});
        assert(node.children);
        assert.equal(2, node.children.length);
        assert.equal('data', node.children[0].name);
        assert.equal('host', node.children[1].name);
        assert(node.hash.data);
        assert.equal(1, node.hash.data.length);
        assert(node.hash.host);
        assert.equal(1, node.hash.host.length);
        testParents(node);
    });


    it('should correctly parse a pair of identical elements', function () {
        var node = xml.parseNode('<server><data></data><data/></server>');
        assert.equal(node.name, 'server');
        assert.deepEqual(node.attributes, {});
        assert(node.children);
        assert.equal(2, node.children.length);
        assert.equal('data', node.children[0].name);
        assert.equal('data', node.children[1].name);
        assert(node.hash.data);
        assert.equal(2, node.hash.data.length);
        testParents(node);
    });


    it('should correctly parse an element and text', function () {
        var node = xml.parseNode('<server>serverdata<data/></server>');
        assert.equal(node.name, 'server');
        assert.deepEqual(node.attributes, {});
        assert(node.children);
        assert.equal(2, node.children.length);
        assert.equal('text()', node.children[0].name);
        assert(node.hash['text()']);
        assert.equal(1, node.hash['text()'].length);
        assert.equal('data', node.children[1].name);
        assert(node.hash.data);
        assert.equal(1, node.hash.data.length);
        testParents(node);
    });

    it('should correctly parse an two identical elements  and text in the correct order', function () {
        var node = xml.parseNode('<server><data></data>serverdata<data/></server>');
        assert.equal(node.name, 'server');
        assert.deepEqual(node.attributes, {});
        assert(node.children);
        assert.equal(3, node.children.length);
        assert.equal('data', node.children[0].name);
        assert.equal('text()', node.children[1].name);
        assert.equal('data', node.children[2].name);
        testParents(node);
    });

});
