// need to figure out what to do with these helpers, namespace and toMoney stuff
//
// this has to be passed in externally.
var app = {
  configuration: {
    domain: window.location.origin + window.location.pathname,
    lang: 'en'
  }
};



var Calculator = namespace.module();

Calculator.Model = Backbone.Model.extend({
  defaults: function () {
    return {
      'interestRate': 0,
      'residual': 0,
      'term': '40',
      'kms': '20',
      'price': 0,
      'downPayment': 0
    };
  }
});

Calculator.Collection = Backbone.Collection.extend({ model: Calculator.Model });

Calculator.Views.BaseCalculatorView = Backbone.View.extend({
  className: 'calc-wrapper modal-body',
  events: {
    "click button.term": "setTerm",
    "click button.kms": "setKms",
    "click button#caclulatePayment": "calculatePayment"
  },

  lookupNewTerm: function (newTerm, nodeToSearch) {
    var newModel = new Calculator.Model(),
        that = this,
        leaseRate;

    _.each(this.options.data[nodeToSearch], function (lr) {
      if (lr.Term === parseInt(newTerm, 10)) leaseRate = lr;
    });

    newModel.set({ term: newTerm });
    newModel.set({ interestRate: leaseRate.InterestRate });
    newModel.set({ residual: leaseRate.ResidualRate });

    if (app.configuration.language === 'en') {
      newModel.set({ price: parseInt(this.options.data.Price.replace(',', ''),10) });
    } else {
      newModel.set({ price: parseInt(this.options.data.Price.replace(',', '.').replace(' ', ''), 10) });
    }

    if (this.model !== undefined && this.model.get('downPayment')) {
      newModel.set({ downPayment: this.model.get('downPayment') });
    } else {
      newModel.set({ downPayment: leaseRate.DownPayment });
    }

    if (this.model !== undefined && this.model.get('kms')) {
      newModel.set({ kms: this.model.get('kms') });
    } else {
      newModel.set({ kms: 20 });
    }

    this.model = newModel;
  },

  hasTerm48: function (nodeToSearch) {
    var hasTerm48 = false;
    _.each(this.options.data[nodeToSearch], function (lr) {
      if (parseInt(lr.Term, 10) === 48) hasTerm48 = true;
    });
    return hasTerm48;
  },

  hasTerm: function (nodeToSearch, termToSearchFor) {
    var hasTerm = false;
    _.each(this.options.data[nodeToSearch], function (lr) {
      if (parseInt(lr.Term, 10) === termToSearchFor) hasTerm = true;
    });

    return hasTerm;
  },

  setTerm: function (e) {
    e.preventDefault();

    srcElement = e.srcElement ? e.srcElement : e.target,
    $srcElement = $(srcElement),
    newDownPayment = this.$el.find('#txtDownPmt').val();

    this.model.set({ downPayment: newDownPayment });
    this.lookupNewTerm($srcElement.attr('data-term'), this.type);
    this.render();
  },

  // set's the km's (only applies to lease calc)
  setKms: function (e) {
    e.preventDefault();

    var srcElement = e.srcElement ? e.srcElement : e.target,
    $srcElement = $(srcElement);

    this.model.set({ kms: $srcElement.attr('data-kms') });
    this.render();
  },

  // calculates the payment based on the model data.
  calculatePayment: function (e) {
    e.preventDefault();
    this.model.set({ downPayment: this.$el.find('#txtDownPmt').val() });
    this.render();
  }
});

Calculator.Views.LeaseCalculator = Calculator.Views.BaseCalculatorView.extend({
  template: app.configuration.domain + "j/calculator-templates/lease_calc.html",

  initialize: function () {
    this.type = 'LeaseRates';
    this.lookupNewTerm('48', this.type);
  },

  render: function () {
    var view = this,
    monthlyPayment = Helpers.fullCalculateLeaseRate(this.model.get('interestRate'), this.model.get('residual'), this.model.get('term'), this.model.get('price'), this.model.get('downPayment'), this.model.get('kms')),
    formattedTotalPrice = this.model.get('price').toMoney();

    namespace.fetchTemplate(this.template, function (tmpl) {
      view.el.innerHTML = tmpl({
        data: view.model.toJSON(),
        payment: parseFloat(monthlyPayment).toMoney(),
        displayPrice: formattedTotalPrice,
        showTerm48: view.hasTerm48('LeaseRates'),
        showTerm39: view.hasTerm('LeaseRates', 39),
        strings: view.options.strings,
        lang: app.configuration.language
      });

      monthlyPayment = null, formattedTotalPrice = null;
    });

    return this;
  }
});

Calculator.Views.FinanceCalculator = Calculator.Views.BaseCalculatorView.extend({
  template: app.configuration.domain + "j/calculator-templates/finance_calc.html",

  initialize: function () {
    this.type = 'FinanceRates';
    this.lookupNewTerm('60', this.type);
  },

  render: function () {
    var view = this,
    monthlyPayment = Helpers.calculateFinanceRate(this.model.get('interestRate'), this.model.get('term'), this.model.get('price'), this.model.get('downPayment'), this.model.get('kms')),
    formattedTotalPrice = this.model.get('price').toMoney(),
    additionalTerms = {};

    additionalTerms.show60 = view.hasTerm('FinanceRates', 39) ? true : false;
    additionalTerms.show60 = view.hasTerm('FinanceRates', 60) ? true : false;
    additionalTerms.show72 = view.hasTerm('FinanceRates', 72) ? true : false;
    additionalTerms.show84 = view.hasTerm('FinanceRates', 84) ? true : false;

    namespace.fetchTemplate(this.template, function (tmpl) {
      view.el.innerHTML = tmpl({
        data: view.model.toJSON(),
        payment: parseFloat(monthlyPayment).toMoney(),
        displayPrice: formattedTotalPrice,
        strings: view.options.strings,
        variableTerms: additionalTerms,
        lang: app.configuration.language
      });

      monthlyPayment = null, formattedTotalPrice = null, additionalTerms = null;
    });

    return this;
  }
});

// This is the main calculator view, it loads subviews and builds the whole calculator UI.
Calculator.Views.Main = Backbone.View.extend({
  id: 'calculator-window',

  events: {
    "click #show-lease": "showLeaseCalculator",
    "click #show-finance": "showFinanceCalculator",
    "click #addLeaseColumn": "addLeaseColumn",
    "click #addFinanceColumn": "addFinanceColumn"
  },

  initialize: function () {
    this.childViews = []; // store all sub views in this array.
    this.$el.addClass('modal calculator wider');
    if (!this.options.type) {
      this.options.type = 'lease'; // if there's no options.type passed in, lease is the default.
    }

    if(typeof(this.options.data) !== 'object')
      this.options.data = JSON.parse(this.options.data);

    if(this.options.lang) 
      app.configuration.lang = this.options.lang;


    this.$container = $(this.options.container);

    this.render();
  },

  render: function () {
    var header = new Calculator.Views.Header({ type: this.options.type, strings:this.options.strings });
    header.render();
    this.childViews.push(header);
    this.$el.html(header.el);

    var leaseCalculator = new Calculator.Views.LeaseCalculator({data:this.options.data, strings:this.options.strings}).render();
    var financeCalculator = new Calculator.Views.FinanceCalculator({data:this.options.data, strings:this.options.strings}).render();
    this.childViews.push(leaseCalculator);
    this.childViews.push(financeCalculator);

    switch (this.options.type) {
      case 'lease':
        this.$el.append(leaseCalculator.el);
        this.$el.append(financeCalculator.el);

        break;
      // finance first
      case 'finance':
        this.$el.append(financeCalculator.el);
        this.$el.append(leaseCalculator.el);

        break;
      // lease first
      default:
        this.$el.append(leaseCalculator.el);
        this.$el.append(financeCalculator.el);

        break;
    }

    // if we've been asked to add a 3rd column
    if (this.options.thirdColumn) {
      leaseCalculator = new Calculator.Views.LeaseCalculator({data:this.options.data, strings:this.options.strings}).render();
      financeCalculator = new Calculator.Views.FinanceCalculator({data:this.options.data, strings:this.options.strings}).render();
      switch (this.options.thirdColumn) {
        case 'lease':
          this.$el.append(leaseCalculator.el);

          break;
        case 'finance':
          this.$el.append(financeCalculator.el);

          break;
        default:
          this.$el.append(leaseCalculator.el);

          break;
      }
    } else {
      this.buildAddColumn(); // if no 3rd column is specified, we'll add the UI to add one.
    }

    var footer = new Calculator.Views.Footer({strings:this.options.strings});
    footer.render();
    this.childViews.push(footer);
    this.$el.append(footer.el);

    return this;
  },

  buildAddColumn: function () {
    var addLeaseLink = $('<a href="'+window.location.hash+'" id="addLeaseColumn" class="calc-link-add">'+this.options.strings.AddLeaseLinkText+'</a>');
    var addFinanceLink =$('<a href="'+window.location.hash+'" id="addFinanceColumn" class="calc-link-add">'+this.options.strings.AddFinanceLinkText+'</a>');
    var linkContainer = $('<div class="calc-wrapper add-column"></div>');

    $(linkContainer).html(addLeaseLink);
    $(linkContainer).append(addFinanceLink);

    this.$el.append(linkContainer);

    return this;
  },

  addLeaseColumn: function (e) {
    e.preventDefault();
    this.close();
    var calculator = new Calculator.Views.Main({container: this.options.container,data:this.options.data, type:'lease', strings:this.options.strings, thirdColumn: 'lease'}).render();
    this.$container.append(calculator.el);
  },

  addFinanceColumn: function (e) {
    e.preventDefault();
    this.close();
    var calculator = new Calculator.Views.Main({container: this.options.container,data:this.options.data, type:'finance', strings:this.options.strings, thirdColumn:'finance'}).render();
    this.$container.append(calculator.el);
  },

  // handles the click event on the Lease Estimator button
  showLeaseCalculator: function (e) {
    e.preventDefault();
    this.close();
    var calculator = new Calculator.Views.Main({ container: this.options.container,type: 'lease', data:this.options.data, strings:this.options.strings });
    this.$container.append(calculator.el);
  },

  // handles the click event on the Finance Estimator button
  showFinanceCalculator: function (e) {
    e.preventDefault();
    this.close();
    var calculator = new Calculator.Views.Main({ container: this.options.container,type: 'finance', data:this.options.data, strings:this.options.strings });
    this.$container.append(calculator.el);
  },

  onClose: function () {
  }
});

// contains all the header information for the calculator window.
Calculator.Views.Header = Backbone.View.extend({
  className: 'modal-header',
  template: app.configuration.domain + "j/calculator-templates/calculator_header.html",

  render: function () {
    var view = this;

    namespace.fetchTemplate(this.template, function (tmpl) {
      view.el.innerHTML = tmpl({ strings: view.options.strings, type: view.options.type });
      view = null;
    });

    return this;
  }
});

// contains all the footer information for the calculator modal window.
Calculator.Views.Footer = Backbone.View.extend({
  template: app.configuration.domain + "j/calculator-templates/calculator_footer.html",
  render: function () {
    var view = this;

    namespace.fetchTemplate(this.template, function (tmpl) {
      view.el.innerHTML = tmpl({ strings: view.options.strings});
      view = null;
    });

    return this;
  }
});
