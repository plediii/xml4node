/*jslint node: true */
"use strict";

var sax = require('sax');
var _ = require('underscore');

var escape = function (str, options) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g,'&lt;').replace(/>/g,'&gt;')
        // .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;')
    ;
};

var docToString = function (doc) {
    var s = '';
    if (doc.prolog) {
        s = '<?xml ' + doc.prolog.body + '?>';
    }
    return s + nodeToString(doc.root);
};

var doc = function (root) {
    return {
        root: root
    };
};

var text = function (str) {
    return {
        type: 'text'
        , name: 'text()'
        , body: '' + str
    };
};

var processinginstruction = function (name, body) {
    return {
        type: 'processing'
        , name: name
        , body: body
    };
};

var parseNode = function (str, cb) {
    return parseString('<root>' + str + '</root>').root.children[0];
};

var appendNode = function (parent, node) {
    if (_.isString(node)) {
        node = parseNode(node);
    }
    parent.children.push(node);
    (parent.hash[node.name] || (parent.hash[node.name] = [])).push(node);
};

var removeNode = function (parent, nodename) {
    if (parent.hash[nodename]) {
        parent.children = _.difference(parent.children, parent.hash[nodename]);
        delete parent.hash[nodename];
    }
};

var defaultNode = function (parent, node) {
    if (_.isString(node)) {
        node = parseNode(node);
    }
    if (!parent.hash.hasOwnProperty(node.name)) {
        appendNode(parent, node);
    }
};

var setNode = function (parent, node) {
    if (_.isString(node)) {
        node = parseNode(node);
    }
    removeNode(parent, node.name);
    appendNode(parent, node);
};

var elt = function (options, attrs, children) {
    var x = {
        attributes: {}
        , children: []
        , hash: {}
    };

    if (_.isString(options)) {
        x.name = options;

        if (_.isArray(attrs)) {
            children = attrs;
            attrs = {};
        }

        x.attributes = attrs;
        _.each(children, function (child) {
            appendNode(x, child);
        });
    }
    else {
        _.extend(x, options);
    }

    return x;
};

var value = function (node) {
    return node.children[0].body;
};

var nodeToString = function (node) {
    var s = '<' + node.name;
    var attrs = _.map(node.attributes, function (v, k) {
        return k + '=' + '"' + escape(v) + '"';
    }).join(' ');
    if (attrs) {
        s += ' ' + attrs;
    }
    if (node.children.length === 0) {
        s += '/>';
    }
    else {
        s += '>';
        _.each(node.children, function (child) {
            if (child.type === 'text') {
                s += escape(child.body);
            }
            else if (child.type === 'processing') {
                s += '<?' + child.name + ' ' + child.body + '?>';
            }
            else {
                s += nodeToString(child);
            }
        });
        s += '</' + node.name + '>';
    }

    return s;
};

var withoutBOM = function (str) {
    if (str[0] === '\uFEFF') {
        return str.slice(1);
    }
    else {
        return str;
    }
};

var parseString = function (str) {

    var parser = sax.parser(true, {
        trim: false
        , normalize: false
    });


    var nodestack = [];
    var nodes = [];
    var xmldoc = {};
    parser.onerror = function (e) {
        throw e;
        // this._parser.error = null
        // this._parser.resume()
    };
    parser.onprocessinginstruction = function (node) {
        var parent = _.last(nodestack);
        if (!parent) {
            xmldoc.prolog = node;
        }
        else {
            node.type = 'processing';
            parent.children.push(node);
        }
    };
    parser.onopentag = function (node) {
        nodestack.push(node);
        nodes.push(node);
        node.children = [];
        node.hash = {};
    };
    parser.ontext = function (str) {
        var parent = _.last(nodestack);
        if (!parent) {
            console.log('spare text: ', str);
        }
        else {
            var node = text(str);
            parent.children.push(node);
            var hash = parent.hash[node.name] || (parent.hash[node.name] = []);
            hash.push(node);            
        }
    };

    parser.onclosetag =function (nodename) {
        var node = nodestack.pop();
        var parent = _.last(nodestack);
        if (parent) {
            parent.children.push(node);
            var hash = parent.hash[node.name] || (parent.hash[node.name] = []);
            hash.push(node);
        }
        else {
            xmldoc.root = node;
        }
    };

    var ended = false;
    parser.onend = function () {
        ended = true;
    };

    parser
        .write(withoutBOM(str.toString()))
        .close();
    if (!ended) {
        throw 'Premature end.';
    }
    return xmldoc;
};

var nodeEach = function (node, route, cb) {
    if (route.length === 0) {
        return cb(node);
    }
    else {
        var routeHead = _.head(route);
        var routeRest = _.rest(route);
        if (node.hash.hasOwnProperty(routeHead)) {
            var routeNext = _.head(routeRest);
            if (_.isNumber(routeNext)) {
                return nodeEach(node.hash[routeHead][routeNext], _.rest(routeRest), cb);
            }
            else {
                _.each(node.hash[routeHead], function (subnode, idx) {
                    nodeEach(subnode, routeRest, cb);
                });
            }
        }
    }
};

var nodeFind = function (node, route, test) {
    if (route.length === 0) {
         if (test(node)) {
             return node;
         }
    }
    else {
        var routeHead = _.head(route);
        var routeRest = _.rest(route);
        if (node.hash.hasOwnProperty(routeHead)) {
            var routeNext = _.head(routeRest);
            if (_.isNumber(routeNext)) {
                return nodeFind(node.hash[routeHead][routeNext], _.rest(routeRest), test);
            }
            else {
                var res;
                if (_.find(node.hash[routeHead], function (subnode, idx) {
                    res = nodeFind(subnode, routeRest, test);
                    return res;
                })) {
                    return res;
                }
            }
        }
    }
};

var docFind = function (doc, route, test) {
    var routeHead = _.head(route);
    var routeRest = _.rest(route);
    if (routeHead === doc.root.name) {
        return nodeFind(doc.root, route.slice(1), test);
    }
};

var docGet = function (doc, route) {
    var res;
    docFind(doc, route, function (node) {
        res = node;
        return true;
    });
    return res;
};

var nodeGet = function (node, route) {
    var res;
    nodeEach(node, route, function (subnode) {
        res = subnode;
    });
    return res;
};

var docEach = function (doc, route, cb) {
    var routeHead = _.head(route);
    var routeRest = _.rest(route);
    if (routeHead === doc.root.name) {
        nodeEach(doc.root, route.slice(1), cb);
    }
};

var docAction = function (doc, route, action) {
    if (module.exports.hasOwnProperty(action[0])) {
        var method = module.exports[action[0]];
        var args = _.rest(action);
        docEach(doc, route, function (node) {
            method.apply(null, [node].concat(args));
        });
    }
};


_.extend(module.exports, {
    parseString: parseString
    , parseNode: parseNode
    , docToString: docToString
    , nodeToString: nodeToString
    , elt: elt
    , text: text
    , appendNode: appendNode
    , setNode: setNode
    , defaultNode: defaultNode
    , doc: doc
    , value: value
    , docEach: docEach
    , docAction: docAction
    , docGet: docGet
    , nodeGet: nodeGet
    , docFind: docFind
    , nodeFind: nodeFind
    , processinginstruction: processinginstruction
});
