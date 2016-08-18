Backbone.Model.prototype.increase = function (key, addition) {
    this.set(key, this.get(key) + addition)
};

var Cell = Backbone.Model.extend({
    defaults: {
        value: 0
    },
<<<<<<< HEAD
    inc: function (c) {
        this.set("value", (this.get("value") + c)%256);
=======
    initialize: function (options) {
        this.set("index", options.index);
    },
    inc: function () {
        if (this.get("value") == 255) {
            this.set("value", 0);
        } else {
            this.increase("value", 1);
        }
>>>>>>> infinite-tape/infinite-tape
    },
    dec: function (c) {
        var val = this.get("value") - c;
        if (val < 0) {
          val += 256*(Math.ceil(-val/256));
        }
        this.set("value", val);
    },
    put: function (c) {
        this.set("value", c.charCodeAt(0));
    },
    char: function () {
        return String.fromCharCode(this.get("value"))
    }
});

var Cells = Backbone.Collection.extend({
    model: Cell
});

var Tape = Backbone.Model.extend({
    tapeIndex: function (index) {
        var firstIndex = this.get("cells").first().get("index");
        var lastIndex = this.get("cells").last().get("index");
        if (index < firstIndex || lastIndex < index) {
            throw {
                name: "Error",
                message: "Memory error: " + index
            };
        }
        return index - firstIndex;
    },
    cellAt: function (index) {
        return this.get("cells").at(this.tapeIndex(index));
    }
});

var Pointer = Backbone.Model.extend({
    defaults: {
        index: 0
    },
    left: function (c) {
        this.increase("index", -c);
    },
    right: function (c) {
        this.increase("index",  c);
    }
});
