var namespace = {
  module: function(opts) {
    return _.extend({ Views: {} }, opts);
  },

  fetchTemplate: function (path, done) {
    var JST = this.JST = this.JST || {};
    var def = new $.Deferred();

    if (JST[path]) {
      done(JST[path]);
      return def.resolve(JST[path]);
    }

    $.get(path, function (contents) {
      var tmpl = _.template(contents);
      done(JST[path] = tmpl);
      def.resolve(JST[path]);
    }, "text");

    return def.promise();
  }
};
