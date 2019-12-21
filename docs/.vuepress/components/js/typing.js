

export default function Typing (opts) {
  this.instance = null;
  this.opts = opts || {};
  this.source = opts.source;
  this.output = opts.output;
  this.callback = opts.callback || function(){};
  this.delay = opts.delay || 120;
  this.chain = {
    parent: null,
    dom: this.output,
    val: []
  };
  this._stop = true;

  if (!(typeof this.opts.done == 'function')) this.opts.done = function() {};
}

Typing.fn = Typing.prototype = {
  toArray: function (eles) {
    var result = [];
    for (var i = 0; i < eles.length; i++) {
      result.push(eles[i]);
    }
    return result;
  },
  
  reset: function () {
    this._stop = true
    this.output.innerHTML = ''
  },
   
  init: function () {
    this.chain.val = this.convert(this.source, this.chain.val);
  },

  convert: function (dom, arr) {
    var that = this,
        children = this.toArray(dom.childNodes);

    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      if (node.nodeType === 3) {
        arr = arr.concat(node.nodeValue.split(''));
      } else if (node.nodeType === 1) {
        var val = [];
        val = that.convert(node, val);
        arr.push({
          'dom': node,
          'val': val
        });
      }
    }

    return arr;
  },

  print: function (dom, val, callback) {
    setTimeout(function(){
      dom.appendChild(document.createTextNode(val));
      callback();
    }, this.delay);
  },

  play: function (ele) {
    if (this._stop) return;
    if (!ele) return;
    if (!ele.val.length) {
      if (ele.parent) this.play(ele.parent);
      else this.opts.done();
      // 结束
      this.callback()
      return;
    }

    var curr = ele.val.shift();
    var that = this;

    if (typeof curr === 'string') {
      this.print(ele.dom, curr, function() {
        that.play(ele);
      });
    } else {
      var dom = document.createElement(curr.dom.nodeName);
      var attrs = that.toArray(curr.dom.attributes);
      for (var i = 0; i < attrs.length; i++) {
        var attr = attrs[i];
        dom.setAttribute(attr.name, attr.value);
      }
      ele.dom.appendChild(dom);
      curr.parent = ele;
      curr.dom = dom;
      this.play(curr.val.length ? curr : curr.parent);
    }
  },

  start: function () {
    this._stop = false;
    this.init();
    this.play(this.chain);
  },

  pause: function() {
    this._stop = true;
  },

  resume: function(){
    this._stop = false;
    this.play(this.chain);
  }
};
Typing.getInstance = function(opts) {
  if(!this.instance) {
      this.instance = new Typing(opts);
  }
  return this.instance;
}
Typing.version = '2.1';

