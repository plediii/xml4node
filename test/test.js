/*jslint node: true */
"use strict";
var assert = require('assert')
, _ = require('underscore')
, xml = require('../index.js')
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
    });


    it('should correctly parse an xml prolog even in the presence of processing instructions', function () {
        var doc = xml.parseString('<?xml version="6.0"?><server><?xml version="7.1"?></server>');
        assert(doc.root);
        assert(doc.prolog);
        assert.equal(doc.root.name, 'server');
        assert.equal(doc.root.children.length, 1);
        assert.equal(doc.prolog.body, 'version="6.0"');
    });


});

describe('parseNode', function () {

    it('should correctly parse a processing instruction', function () {
        var node = xml.parseNode('<?xml version="8.6"?>');
        assert.equal(node.type, 'processing')
        assert.equal(node.body, 'version="8.6"');
    });


    it('should correctly parse a root node', function () {
        var node = xml.parseNode('<server />');
        assert.equal(node.name, 'server');
        assert(node.children);
        assert.deepEqual(node.children, []);
        assert.deepEqual(node.hash, {});
        assert.deepEqual(node.attributes, {});
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
    });

});


describe('nodeToString', function () {

    it('should correctly output an empty node', function () {
        var elt = xml.elt('alien');
        assert.equal(xml.nodeToString(elt), '<alien/>');
    });

    it('should correctly convert an element with a child to a string', function () {
        var elt = xml.elt('tag', [xml.elt('child')]);
        assert.equal(xml.nodeToString(elt), '<tag><child/></tag>');
    });

    it('should correctly ignore isSelfClosing attribute', function () {
        var elt = xml.elt('tag', [xml.elt('child')]);
        elt.isSelfClosing = true;
        assert.equal(xml.nodeToString(elt), '<tag><child/></tag>');
    });

    it('should correctly output text nodes', function () {
        var elt = xml.elt('tag', [xml.text('child')]);
        assert.equal(xml.nodeToString(elt), '<tag>child</tag>');
    });

    it('should correctly output an attribute', function () {
        var elt = xml.elt('alien', { type: 'extra'});
        assert.equal(xml.nodeToString(elt), '<alien type="extra"/>');
    });

    it('should correctly escape an attribute with a quote', function () {
        var elt = xml.elt('character', { is: '"'});
        assert.equal(xml.nodeToString(elt), '<character is="&quot;"/>');
    });

    it('should correctly escape an attribute with a <', function () {
        var elt = xml.elt('character', { is: '<'});
        assert.equal(xml.nodeToString(elt), '<character is="&lt;"/>');
    });


    it('should correctly escape an attribute with a >', function () {
        var elt = xml.elt('character', { is: '>'});
        assert.equal(xml.nodeToString(elt), '<character is="&gt;"/>');
    });

    it('should correctly escape an attribute with a &', function () {
        var elt = xml.elt('character', { is: '&'});
        assert.equal(xml.nodeToString(elt), '<character is="&amp;"/>');
    });


    it('should correctly output an attribute and child node', function () {
        var elt = xml.elt('alien', { type: 'person'}, [xml.elt('sigourney')]);
        assert.equal(xml.nodeToString(elt), '<alien type="person"><sigourney/></alien>');
    });

    it('should correctly escape text a quote', function () {
        var elt = xml.elt('character', [xml.text('"')]);
        assert.equal(xml.nodeToString(elt), '<character>&quot;</character>');
    });

    it('should correctly escape text with a <', function () {
        var elt = xml.elt('character', [xml.text('<')]);
        assert.equal(xml.nodeToString(elt), '<character>&lt;</character>');
    });


    it('should correctly escape text with a >', function () {
        var elt = xml.elt('character', [xml.text('>')]);
        assert.equal(xml.nodeToString(elt), '<character>&gt;</character>');
    });

    it('should correctly escape text with a &', function () {
        var elt = xml.elt('character', [xml.text('&')]);
        assert.equal(xml.nodeToString(elt), '<character>&amp;</character>');
    });

});

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

describe('appendNode', function () {
    
    it('should add a new element to a childless parent', function () {
        var parent = xml.elt('mama');
        var child = xml.elt('baby');
        xml.appendNode(parent, child);
        assert.equal(parent.children.length, 1);
        assert.equal(parent.children[0].name, 'baby');
        assert.equal(parent.hash.baby.length, 1);
    });

    it('should add an existing node', function () {
        var parent = xml.elt('mama');
        var alice = xml.elt('baby', [xml.text('alice')]);
        xml.appendNode(parent, alice);
        var betty = xml.elt('baby', [xml.text('betty')]);
        xml.appendNode(parent, betty);
        assert.equal(parent.hash.baby.length, 2);
        assert.equal(xml.value(parent.hash.baby[0]), 'alice');
        assert.equal(xml.value(parent.hash.baby[1]), 'betty');
    });

    it('should parse a string second argument', function () {
        var parent = xml.elt('mama');
        xml.appendNode(parent, '<baby>betty</baby>');
        assert.equal(parent.hash.baby.length, 1);
        assert.equal(xml.value(parent.hash.baby[0]), 'betty');
    });


});

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

describe('value', function () {
    it('should return the text content of an element', function () {
        assert.equal(xml.value(xml.elt('monkey', [xml.text('kitten')])), 'kitten');
    });
});

describe('docEach', function () {
    it('should execute a callback function on each instance of a node', function () {
        var collection = [];
        xml.docEach(xml.doc(xml.elt('doll', [xml.elt('doll', [xml.text('a')])
                                             , xml.elt('doll', [xml.text('b')])
                                             , xml.elt('doll', [xml.text('c')])
                                             , xml.elt('doll', [xml.text('d')])]))
                    , ['doll', 'doll']
                    , function (doll) {
                        collection.push(xml.value(doll));
                    });
        assert.deepEqual(collection, ['a', 'b', 'c', 'd']);
    });

    it('should execute a callback function on each instance of a node in a level hierarchy', function () {
        var collection = [];
        xml.docEach(xml.doc(xml.elt('matroska'
                                    , [xml.elt('doll', [xml.elt('doll', [xml.text('a')])
                                             , xml.elt('doll', [xml.text('b')])
                                             , xml.elt('doll', [xml.text('c')])
                                             , xml.elt('doll', [xml.text('d')])])
                                       , xml.elt('doll', [xml.elt('doll', [xml.text('e')])
                                             , xml.elt('doll', [xml.text('f')])
                                             , xml.elt('doll', [xml.text('g')])
                                             , xml.elt('doll', [xml.text('h')])])]))
                    , ['matroska', 'doll', 'doll']
                    , function (doll) {
                        collection.push(xml.value(doll));
                    });
        assert.deepEqual(collection, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    });
});


describe('docFind', function () {
    it('should execute a callback function on each instance of a node, and short circuit on the target', function () {
        var collection = [];
        var target = xml.docFind(xml.doc(xml.elt('doll', [xml.elt('doll', [xml.text('a')])
                                             , xml.elt('doll', [xml.text('b')])
                                             , xml.elt('doll', [xml.text('c')])
                                             , xml.elt('doll', [xml.text('d')])]))
                    , ['doll', 'doll']
                    , function (doll) {
                        collection.push(xml.value(doll));
                        return xml.value(doll) === 'b';
                    });
        assert.equal(xml.value(target), 'b');
        assert.deepEqual(collection, ['a', 'b']);
    });

    it('should execute a callback function on each instance of a hierarchy of nodes, and short circuit on the target', function () {
        var collection = [];
        var target = xml.docFind(xml.doc(xml.elt('matroska'
                                    , [xml.elt('doll', [xml.elt('doll', [xml.text('a')])
                                             , xml.elt('doll', [xml.text('b')])
                                             , xml.elt('doll', [xml.text('c')])
                                             , xml.elt('doll', [xml.text('d')])])
                                       , xml.elt('doll', [xml.elt('doll', [xml.text('e')])
                                             , xml.elt('doll', [xml.text('f')])
                                             , xml.elt('doll', [xml.text('g')])
                                             , xml.elt('doll', [xml.text('h')])])]))
                    , ['matroska', 'doll', 'doll']
                    , function (doll) {
                        collection.push(xml.value(doll));
                        return xml.value(doll) === 'f';
                    });
        assert.equal(xml.value(target), 'f');
        assert.deepEqual(collection, ['a', 'b', 'c', 'd', 'e', 'f']);
    });
});

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
