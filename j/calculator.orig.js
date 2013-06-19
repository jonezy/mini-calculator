define([
  "namespace",
  "use!backbone",
  "modules/helpers"
],

function (namespace, Backbone, Helpers) {
  var app = namespace.configurator,
			Calculator = namespace.module(),
      mainWindow;

  Calculator.Model = Backbone.Model.extend({
    defaults: function () {
      return {
        'interestRate': 0,
        'residual': 0,
        'term': '40',
        'kms': '20',
        'price': 0,
        'downPayment': 0
      }
    }
  });

  Calculator.Collection = Backbone.Collection.extend({ model: Calculator.Model });

  // The lease and finance calculator inherit from this base class
  // it provides shared functionality and allows us to not repeat 
  // ourselves
  Calculator.Views.BaseCalculatorView = Backbone.View.extend({
    className: 'calc-wrapper modal-body',
    events: {
      "click button.term": "setTerm",
      "click button.kms": "setKms",
      "click button#caclulatePayment": "calculatePayment"
    },

    // repopulates the model based on the new term
    lookupNewTerm: function (newTerm, nodeToSearch) {
      var newModel = new Calculator.Model,
          that = this,
          leaseRate;

      _.each(app.CurrentProgress.get('currentVehicle').get(nodeToSearch), function (lr) {
        if (lr.Term === parseInt(newTerm)) {
          return leaseRate = lr;
        }
      });

      newModel.set({ term: newTerm });
      newModel.set({ interestRate: leaseRate.InterestRate });
      newModel.set({ residual: leaseRate.ResidualRate });

      if (app.configuration.language === 'en') {
        newModel.set({ price: parseInt(app.CurrentProgress.get('configuredPrice').replace(',', '')) });
      } else {
        newModel.set({ price: parseInt(app.CurrentProgress.get('configuredPrice').replace(',', '.').replace(' ', '')) });
      }

      if (this.model !== undefined && this.model.get('downPayment')) {
        newModel.set({ downPayment: this.model.get('downPayment') });
      } else {
        newModel.set({ downPayment: leaseRate.DownPayment });
      }

      if (this.model != undefined && this.model.get('kms')) {
        newModel.set({ kms: this.model.get('kms') });
      } else {
        newModel.set({ kms: 20 });
      }

      this.model = newModel;
    },

    // determines whether the current vehicle has any 48 month term rates.
    // the button is removed fromt eh UI if none are found.
    hasTerm48: function (nodeToSearch) {
      var hasTerm48 = false;

      _.each(app.CurrentProgress.get('currentVehicle').get(nodeToSearch), function (lr) {
        if (parseInt(lr.Term) === 48) {
          return hasTerm48 = true;
        }
      });

      return hasTerm48;
    },

    hasTerm: function (nodeToSearch, termToSearchFor) {
      var hasTerm = false;
      _.each(app.CurrentProgress.get('currentVehicle').get(nodeToSearch), function (lr) {
        if (parseInt(lr.Term) === termToSearchFor) {
          return hasTerm = true;
        }
      });

      return hasTerm;
    },

    // updates the view's model downPayment and term amounts.
    setTerm: function (e) {
      e.preventDefault();

      var view = this,
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
    template: app.configuration.domain + "public/j/app/templates/lease_calc.html",
    initialize: function () {
      this.type = 'LeaseRates';
      this.lookupNewTerm('48', this.type);
    },

    render: function () {
      console.log(this.model.get('kms'));
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
          strings: app.UIStrings.Calculator,
          lang: app.configuration.language
        });

        monthlyPayment = null, formattedTotalPrice = null;
      });

      return this;
    }
  });

  Calculator.Views.FinanceCalculator = Calculator.Views.BaseCalculatorView.extend({
    template: app.configuration.domain + "public/j/app/templates/finance_calc.html",
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
          strings: app.UIStrings.Calculator,
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
    id: '#calculator-window',
    events: {
      "click #show-lease": "showLeaseCalculator",
      "click #show-finance": "showFinanceCalculator",
      "click #addLeaseColumn": "addLeaseColumn",
      "click #addFinanceColumn": "addFinanceColumn"
    },

    initialize: function () {
      this.childViews = []; // store all sub views in this array.
      this.$el.modal({ backdrop: 'static', keyboard: false });
      this.$el.addClass('modal calculator wider');

      if (this.options.animate && this.options.animate === true)
        this.$el.addClass("fade in");

      if (!this.options.type) {
        this.options.type = 'lease'; // if there's no options.type passed in, lease is the default.
      }

      this.render();
    },

    render: function () {
      var header = new Calculator.Views.Header({ type: this.options.type });
      header.render();
      this.childViews.push(header);
      this.$el.html(header.el);

      switch (this.options.type) {
        case 'lease':
          var leaseCalculator = new Calculator.Views.LeaseCalculator;
          leaseCalculator.render();
          this.$el.append(leaseCalculator.el);
          this.childViews.push(leaseCalculator);

          var financeCalculator = new Calculator.Views.FinanceCalculator;
          financeCalculator.render();
          this.$el.append(financeCalculator.el);
          this.childViews.push(financeCalculator);

          break;
        // finance first                                          
        case 'finance':
          var financeCalculator = new Calculator.Views.FinanceCalculator;
          financeCalculator.render();
          this.$el.append(financeCalculator.el);
          this.childViews.push(financeCalculator);

          var leaseCalculator = new Calculator.Views.LeaseCalculator;
          leaseCalculator.render();
          this.$el.append(leaseCalculator.el);
          this.childViews.push(leaseCalculator);

          break;

        // lease first                                          
        default:
          var leaseCalculator = new Calculator.Views.LeaseCalculator;
          leaseCalculator.render();
          this.$el.append(leaseCalculator.el);
          this.childViews.push(leaseCalculator);

          var financeCalculator = new Calculator.Views.FinanceCalculator;
          financeCalculator.render();
          this.$el.append(financeCalculator.el);
          this.childViews.push(financeCalculator);

          break;
      }

      // if we've been asked to add a 3rd column
      if (this.options.thirdColumn) {
        switch (this.options.thirdColumn) {
          case 'lease':
            var leaseCalculator = new Calculator.Views.LeaseCalculator;
            leaseCalculator.render();
            this.$el.append(leaseCalculator.el);
            this.childViews.push(leaseCalculator);

            break;

          case 'finance':
            var financeCalculator = new Calculator.Views.FinanceCalculator;
            financeCalculator.render();
            this.$el.append(financeCalculator.el);
            this.childViews.push(financeCalculator);

            break;
          default:
            var leaseCalculator = new Calculator.Views.LeaseCalculator;
            leaseCalculator.render();
            this.$el.append(leaseCalculator.el);
            this.childViews.push(leaseCalculator);

            break
        }
      } else {
        this.buildAddColumn(); // if no 3rd column is specified, we'll add the UI to add one.
      }

      var footer = new Calculator.Views.Footer;
      footer.render();
      this.childViews.push(footer);
      this.$el.append(footer.el);

      this.postRender();

      return this;
    },

    buildAddColumn: function () {

      // create and add a column that allows the user to add either a lease or finance callculator to the 3rd
      // column in the window
      var addLeaseLink = this.make('a', { 'href': window.location.hash, 'id': 'addLeaseColumn', 'class': 'calc-link-add' }, app.UIStrings.Calculator.AddLeaseLinkText);
      var addFinanceLink = this.make('a', { 'href': window.location.hash, 'id': 'addFinanceColumn', 'class': 'calc-link-add' }, app.UIStrings.Calculator.AddFinanceLinkText);
      var linkContainer = this.make('div', { 'class': 'calc-wrapper add-column' });

      $(linkContainer).html(addLeaseLink);
      $(linkContainer).append(addFinanceLink);

      this.$el.append(linkContainer);

      return this;
    },

    // runs after the main views render function has been executed
    postRender: function () {
      var view = this;
      $('a.close').live('click', function (e) {
        e.preventDefault();
        view.close();
      });

      return this;
    },

    addLeaseColumn: function (e) {
      e.preventDefault();
      this.close();
      var calculator = new Calculator.Views.Main({ type: this.options.type, thirdColumn: 'lease' });
      return calculator;
    },

    addFinanceColumn: function (e) {
      e.preventDefault();
      this.close();
      var calculator = new Calculator.Views.Main({ type: this.options.type, thirdColumn: 'finance' });
      return calculator;
    },

    // handles the click event on the Lease Estimator button
    showLeaseCalculator: function (e) {
      e.preventDefault();
      this.close();
      var calculator = new Calculator.Views.Main({ type: 'lease' });
      return calculator;
    },

    // handles the click event on the Finance Estimator button
    showFinanceCalculator: function (e) {
      e.preventDefault();
      this.close();
      var calculator = new Calculator.Views.Main({ type: 'finance' });
      return calculator;
    },

    onClose: function () {
      $('a.close').off();

      this.$el.modal('hide');

      $('.modal-backdrop').remove();
    }
  });

  // contains all the header information for the calculator window.
  Calculator.Views.Header = Backbone.View.extend({
    className: 'modal-header',
    template: app.configuration.domain + "public/j/app/templates/calculator_header.html",

    render: function () {
      var view = this;

      namespace.fetchTemplate(this.template, function (tmpl) {
        view.el.innerHTML = tmpl({ strings: app.UIStrings.Calculator, type: view.options.type });
        view = null;
      });

      return this;
    }
  });

  // contains all the footer information for the calculator modal window.
  Calculator.Views.Footer = Backbone.View.extend({
    template: app.configuration.domain + "public/j/app/templates/calculator_footer.html",
    render: function () {
      var view = this;

      namespace.fetchTemplate(this.template, function (tmpl) {
        view.el.innerHTML = tmpl({ strings: app.UIStrings.Calculator });
        view = null;
      });

      return this;
    }
  });

  return Calculator;
});