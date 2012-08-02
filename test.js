var EventEmitter2 = require("eventemitter2").EventEmitter2;
var Ree           = require("./lib/ree");

module.exports = {
  setUp: function(cc) {
    this.anderson = {
      name: "anderson",
      male: true,
      age: 28,
      incAge: function() {
        this.age += 1;
      },
      learn: function() {},
      say: function() {
        this.emit("say", "gunz");
      },
      items: ["nokia 8110"]
    };

    /* emitterception */
    EventEmitter2.call(this.anderson);
    this.anderson.__proto__ = EventEmitter2.prototype;

    this.agent = Ree(this.anderson);

    cc();
  },
  tearDown: function(cc) {
    delete this.agent;
    delete this.anderson;
    cc();
  },
  basic: function(test) {
    test.equal(this.anderson.name, this.agent.name);
    test.equal(this.anderson.male, this.agent.male);
    test.equal(this.anderson.age, this.agent.age);
    test.equal(this.anderson.items[0], this.agent.items[0]);

    test.expect(4);
    test.done();
  },
  bubble: function(test) {
    this.agent.once("bubble", function(cmd) {
      test.deepEqual(cmd, {
        type: "msg",
        keypath: ["learn"],
        args: ["nodejitsu"]
      });
    });
    this.agent.learn("nodejitsu");

    test.expect(1);
    test.done();
  },
  transparent: function(test) {
    this.agent.on("say", function(str) {
      test.equal(str, "gunz");
    });
    this.anderson.say();
    this.agent.say();

    test.expect(2);
    test.done();
  },
  execute: function(test) {
    Ree.exec(this.agent, { type: "set", keypath: ["age"], args: [29] });
    test.equal(this.anderson.age, 29);

    Ree.exec(this.anderson, { type: "set", keypath: ["age"], args: [28] });
    test.equal(this.anderson.age, 28);

    test.expect(2);
    test.done();
  },
  array: function(test) {
    var count = 0;

    this.agent.on("bubble", function(cmd) {
      switch(count) {
        case 0:
          test.deepEqual(cmd, { type: "msg", keypath: ["items", "push"], args: ["foobar"] });
          break;
        case 1:
          test.deepEqual(cmd, { type: "msg", keypath: ["items", "pop"], args: [] });
          break;
        case 2:
          test.deepEqual(cmd, { type: "msg", keypath: ["items", "pop"], args: [] });
          break;
        case 3:
          test.deepEqual(cmd, { type: "msg", keypath: ["items", "unshift"], args: ["bar", "foo"] });
          break;
      }
      count += 1;
    });

    this.agent.items.push("foobar");
    this.agent.items.pop();
    this.agent.items.pop();
    this.agent.items.unshift("bar", "foo");

    test.equal(this.anderson.items[0], this.agent.items[0]);
    test.equal(this.anderson.items[1], this.agent.items[1]);

    this.agent.items[0] = "fooo";

    test.equal(this.anderson.items[0], this.agent.items[0]);

    test.expect(7);
    test.done();
  },
  object: function(test) {
    this.anderson.incAge();
    test.equal(this.anderson.age, 29);
    test.equal(this.agent.age, 29);
    this.agent.incAge();    
    test.equal(this.anderson.age, 30);
    test.equal(this.agent.age, 30);

    test.expect(4);
    test.done();
  }
};
