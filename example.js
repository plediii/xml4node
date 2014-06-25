
var xml = require('./index');
var eyes = require('eyes');

var d = xml.doc(xml.elt('procedure'));
var p = d.root;
var h = xml.elt('head');
xml.setNode(h, xml.elt('Style', [
    xml.elt('HeaderID', [xml.text('0')])
    , xml.elt('BodyID', [xml.text('1')])
    , xml.elt('FooterID', [xml.text('2')])
]));
xml.setNode(p, h);
console.log(xml.docToString(d));
xml.setNode(h, xml.elt('Style', [
    xml.elt('HeaderID', [xml.text('3')])
    , xml.elt('BodyID', [xml.text('2')])
    , xml.elt('FooterID', [xml.text('1')])
]));
var s = xml.elt('steps', [
    xml.elt('step', [xml.text('a')])
    , xml.elt('step', [xml.text('b')])
    , xml.elt('step', [xml.text('c')])
    , xml.elt('step', [xml.text('d')])
    , xml.elt('step', [xml.text('e')])
]);
xml.setNode(p, s);
console.log(xml.docToString(d));

xml.docEach(d, ['procedure', 'steps', 0, 'step', 3, 'text()'], function (n) {
    console.log('doc each');
    eyes.inspect(n);
});

xml.docAction(d, ['procedure', 'steps', 0, 'step', 3], ['setNode', 'replacement text']);

xml.docEach(d, ['procedure', 'steps', 0, 'step', 3], function (n) {
    console.log('doc each');
    eyes.inspect(n);
});

console.log(xml.docToString(d));

console.log('found: ', xml.nodeToString(xml.docFind(d, ['procedure', 'steps', 'step'], function (step) {
    console.log(xml.value(step));
    return xml.value(step) === 'e';
})));
