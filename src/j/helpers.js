
var Helpers = {
  calculateLeaseRate: function(vehicle, term, price) {
    // first, grab the rate information for the vehicle and term requested
    var leaseRate;
     _.each(vehicle.LeaseRates, function(lr) {
      if(lr.Term === parseInt(term)) {
       leaseRate = lr;
      }
    });

    if(leaseRate !== undefined) {
      return Helpers.fullCalculateLeaseRate(leaseRate.InterestRate, leaseRate.ResidualRate, term, price, leaseRate.DownPayment, 20);
    } else {
      return null;
    }
  },

  fullCalculateLeaseRate: function(ir, residualpct, term, pv,dp,km) {
    switch (parseInt(km)) {
      case 12:
        residualpct = residualpct + 4;
        break;
      case 16:
        residualpct = residualpct + 3;
        break;
      case 20:
        residualpct = residualpct + 2;
        break;
      case 24:
        residualpct = residualpct + 0;
        break;
      default:
        residualpct = residualpct + 0;
        break;
    }

    pv = pv - dp;   // set the new pv
    var interest = ir / 100;
    var residual_value_pct = residualpct / 100;
    var residual_value = pv * residual_value_pct;
    var interest_monthly = interest / 12;
    var depreciated_value = pv - residual_value;
    var monthly_pmt = this.roundNumber(depreciated_value / term, 2);
    var money_factor = (interest / 2400) * 100;
    var interest_per_term = interest_monthly * term;
    var pv_rv = this.roundNumber(pv, 10) + this.roundNumber(residual_value, 10);
    var finance_charge = (pv_rv * money_factor) - (interest_per_term);
    var pmt = monthly_pmt + finance_charge;

    return this.roundNumber(pmt, 2);
  },

  calculateFinanceRate: function(ir, term, pv, dp) {
    pv = pv - dp;
    var interest_monthly = (ir / 100) / 12;
    var pmt = (pv * interest_monthly) / (1 - (Math.pow((1 + interest_monthly), -term)));
    return this.roundNumber(pmt, 2);
  },

  roundNumber: function(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
  }
};

