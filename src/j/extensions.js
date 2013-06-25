
Number.prototype.toMoney = function (decimals, decimal_sep, thousands_sep) {
  var n = this,
  l = 'en',
  c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
  d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)
  t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

  sign = (n < 0) ? '-' : '',

  i = parseInt(n = Math.abs(n).toFixed(c)) + '',

  j = ((j = i.length) > 3) ? j % 3 : 0;

  if (l === 'fr') {
    d = ',';
    t = ' ';
  }

  return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

Backbone.View.prototype.close = function () {
  // close all the child views that have been stored in this.childViews
  _.each(this.childViews, function (childView) {
    if (childView.remove) {
      childView.remove();
    }

    if (childView.close) {
      childView.close();
    }
  });

  // handle cleaning up this view
  this.off();
  this.remove();

  if (this.onClose) {
    this.onClose();
  }

  return this;
};
