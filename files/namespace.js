define(["jquery", "use!underscore", "use!backbone", "bootstrap-data"],
function ($, _, Backbone, BootstrapData) {

  // make it safe to use console.log always
  (function (a) { function b() { } for (var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","), d; !!(d = c.pop()); ) { a[d] = a[d] || b; } })
  (function () { try { console.log(); return window.console; } catch (a) { return (window.console = {}); } } ());

  return {
    // template loading and caching
    fetchTemplate: function (path, done) {
      var JST = this.JST = this.JST || {};
      //var JST = window.JST = window.JST || {};
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
    },

    fetchImages: function (images, done) {
      var that = this,
					loaded = [],
					completed = false;

      _.each(images, function (i) {
        that.fetchImage(i, function (i) {
          loaded.push(images);
          done(i);
        });
      });

    },

    fetchImage: function (image, done) {
      var JSI = this.JSI = this.JSI || {};
      //var JSI = window.JSI = window.JSI || {};
      var def = new $.Deferred();

      if (JSI[image]) {
        // console.log('returning', image, ' from cache');
        done(JSI[image]);
        return def.resolve(JSI[image]);

      }

      var img = new Image();
      img.src = image;

      if (done) 
        return done(JSI[image] = image);
      else 
        return def.resolve(JSI[image] = image);
//      $.get(image, function () {
//        if (done) {
//          return done(JSI[image] = image);
//        } else {
//          return def.resolve(JSI[image] = image);
//        }
//      });

      return def.promise();

    },

    // Create a custom object with a nested Views object
    module: function (additionalProps) {
      return _.extend({ Views: {} }, additionalProps);
    },

    setBg: function (domain, bg) {
      var pathToBg = domain + 'Public/i/bgs/notnormal/' + bg;
      this.fetchImage(pathToBg, function (i) {
        $('body').css('background-image', 'url(' + i + ')');
      });
    },

    loginCookieId: '__mini-cfg-uid',
    regionCookieId: '__mini-cfg-rgn',
    defaultCookieExpiry: '31', // in days

    // Keep active application instances namespaced under an app object.
    configurator: _.extend({}, BootstrapData)
  };
});