var EventEmitter2 = require("eventemitter2").EventEmitter2;
var Ree           = require("./ree");

module.exports = {
  setUp: function(cc) {
    this.anderson = {
      str: "anderson",
      male: true,
      age: 28,
      learn: function() {},
      say: function() {
        this.emit("say", "gunz");
      },
      children: ["nokia 8110"]
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
    test.equal(this.anderson.str, this.agent.str);
    test.equal(this.anderson.male, this.agent.male);
    test.equal(this.anderson.age, this.agent.age);
    test.deepEqual(this.anderson.children, this.agent.children);

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
  }
};
