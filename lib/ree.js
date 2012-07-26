var _             = require("underscore")._;
var EventEmitter2 = require("eventemitter2").EventEmitter2;
var slice         = Array.prototype.slice;

var exec = function(o, cmd) {
  var prev;
  var current;

  current = o;

  cmd.keypath.forEach(function(key) {
    if (!current) return;

    prev = current;
    current = current[key];
  });

  if (!current) return;

  if (cmd.type === "msg") {
    return Function.prototype.apply.call(current, prev, cmd.args);
  } else {
    if (cmd.type === "get") {
      return prev[cmd.keypath[cmd.keypath.length - 1]];
    }
    if (cmd.type === "set") {
      prev[cmd.keypath[cmd.keypath.length - 1]] = cmd.args[0];
    }
  }
};

var Ree = function(target, thisArg) {
  var ret;

  if (_.isArray(target) || _.isNumber(target) || _.isString(target) || _.isBoolean(target)) {
    ret = null;
  } else if (_.isFunction(target)) {
    ret = function() {
      target.apply(thisArg, arguments);
      ret.emit("bubble", { type: "msg", keypath: [], args: slice.call(arguments) });
    };
  } else if (_.isObject(target)) {
    ret = {};
  }

  if (ret) {
    EventEmitter2.call(ret, { wildcard: true });
    ret.__proto__ = EventEmitter2.prototype;

    if (target._events) {
      Object.keys(target._events).forEach(function(key) {
        ret._events[key] = target._events[key];
      });

      if (target._all) {
        ret._all = Array.prototype.slice.call(target._all);
      }

      target.onAny(function() {
        EventEmitter2.prototype.emit.apply(ret, [this.event].concat(slice.call(arguments)));
      });
    }

    Object.keys(target).forEach(function(key) {
      var result;
      
      if (key.charAt(0) === "_") return;

      result = Ree(target[key], ret);

      if (result) {
        result.on("bubble", function(cmd) {
          ret.emit("bubble", { type: cmd.type, keypath: [key].concat(cmd.keypath), args: cmd.args });
        });

        ret[key] = result;
      } else {
        Object.defineProperty(
          ret,
          key,
          {
            enumerable: true,
            get: function() {
              ret.emit("bubble", { type: "get", keypath: [key], args : [] });
              return target[key];
            },
            set: function(value) {
              target[key] = value;
              ret.emit("bubble", { type: "set", keypath: [key], args: [value] });
            }
          }
        );
      }
    });
  }

  return ret;
};

Ree.exec = exec;

exports = module.exports = Ree;
