/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
, testParents = require('./testParents')
;

describe('parseString', function () {

    it('should correctly parse a root node', function () {
        var doc = xml.parseString('<server />');
        assert(doc.root);
        assert(!(doc.prolog));
        assert.equal(doc.root.name, 'server');
        assert.deepEqual(doc.root.children, []);
        assert.deepEqual(doc.root.hash, {});
        assert.deepEqual(doc.root.attributes, {});
        testParents(doc.root);
    });

    it('should fail to parse an invalid root node', function () {
        assert.throws(function () {
            xml.parseString('<server');
        });
    });

    it('should correctly parse an xml prolog', function () {
        var doc = xml.parseString('<?xml version="6.0"?><server />');
        assert(doc.root);
        assert(doc.prolog);
        assert.equal(doc.root.name, 'server');
        assert.equal(doc.prolog.body, 'version="6.0"');
        testParents(doc.root);
    });


    it('should correctly parse an xml prolog even in the presence of processing instructions', function () {
        var doc = xml.parseString('<?xml version="6.0"?><server><?xml version="7.1"?></server>');
        assert(doc.root);
        assert(doc.prolog);
        assert.equal(doc.root.name, 'server');
        assert.equal(doc.root.children.length, 1);
        assert.equal(doc.prolog.body, 'version="6.0"');
        testParents(doc.root);
    });

    it('should correctly parse an xml comment', function () {
        var doc = xml.parseString('<server><!--not really a server haha--></server>');
        assert(doc.root);
        assert.equal(doc.root.name, 'server');
        assert.equal(doc.root.children.length, 1);
        assert.equal(doc.root.children[0].body, 'not really a server haha');
        testParents(doc.root);
    });

});

