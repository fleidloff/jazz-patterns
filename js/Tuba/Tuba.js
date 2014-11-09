var Tuba = {
    Plugins: [],

    init: function() {
        this.runPlugins();
    },

    runPlugins: function() {
        for(var i = 0; i < this.Plugins.length; i++) {
            this.Plugins[i].run();
        }
    },

    addPlugin: function(plugin) {
        this.Plugins.push(plugin);
    },

    nothing: function() {}
};

Array.prototype.remByVal = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}
