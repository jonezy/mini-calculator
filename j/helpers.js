define([
  "namespace",
  "use!backbone",
	"modules/configuration",
	"modules/content/retailer",
	"modules/navigation/selectlistitem",
  "modules/regionselector"
],

function (namespace, Backbone, Configuration, Retailer, SelectListItem, RegionSelector) {
	var app = namespace.configurator,
			Helpers = namespace.module();


  Helpers.saveConfiguration = function(configuration) {
    
  };

  Helpers.getFullProvince = function() {
    switch ($.cookie(namespace.regionCookieId)) {
      case 'AB':
        return 'Alberta';
      case 'BC':
        return 'British Columbia';
      case 'MB':
        return 'Manitoba';
      case 'NB':
        return 'New Brunswick';
      case 'NL':
        return 'Newfoundland & Labrador';
      case 'NS':
        return 'Nova Scotia';
      case 'ON':
        return 'Ontario';
      case 'PE':
        return 'Prince Edward Island';
      case 'QC':
        return 'Quebec';
      case 'SK':
        return 'Saskatchewan';
      default:
        return "";
    }
  };

  Helpers.getProvince = function() {
    return $.cookie(namespace.regionCookieId);
  };

  Helpers.checkCookie = function(done) {
    var cookie = $.cookie(namespace.regionCookieId);

    if (cookie === null || cookie === "") {
      HomePageAnimate.reset();
      $('#selections-container').hide();

      var regionSelector = new RegionSelector.Views.Main({redirectUrl:window.location.hash});
      regionSelector.render();
    } else {
      if(done) done();
    }
  };

	// quickly determines whether there is a currently logged in user.
	Helpers.isUserLoggedIn = function (user) {
		return user !== undefined && user !== null && user.get('userId') !== '' && user.get('isLoggedIn') === true;
	};

	// builds the full path to a vehicle configuration option icon image.
	Helpers.buildIconImage = function (type, iconCode) {
		var that = this,
				iconFolder,
				iconExtension = ".jpg", // all icons are jpg's.
				image,
				icon;
		
		if(app.BodyColourEntities.where({Code:iconCode}).length > 0) iconFolder = "colours";
		if(app.UpholsteryEntities.where({Code:iconCode}).length > 0) iconFolder = "interiors";
		if(app.PackageEntities.where({Code:iconCode}).length > 0) iconFolder = "packages";
		if(app.OptionEntities.where({Code:iconCode}).length > 0) {
			var option = app.OptionEntities.where({Code:iconCode})[0].toJSON();
			switch (option.Category) {
				case "ROOFCAP":
				case "ROOF":
				case "STRIPE":
					iconFolder = "colours";
					break;
				default:
					iconFolder = "options"; 
				}
		}

		// load up the image
		image = app.configuration.domain + "Public/i/icon/" + iconFolder + "/" + iconCode + iconExtension;
		namespace.fetchImage(image, function (i) {
			icon = i;
		});

		return icon;
	};

	// returns an entity from one of the in memory data stores.
	Helpers.resolveCode = function(code) {
		if(app.BodyColourEntities.where({Code:code}).length > 0)
			return app.BodyColourEntities.where({Code:code})[0];

		if(app.UpholsteryEntities.where({Code:code}).length > 0) 
			return app.UpholsteryEntities.where({Code:code})[0];

		if(app.PackageEntities.where({Code:code}).length > 0)
			return app.PackageEntities.where({Code:code})[0];
		
		if(app.OptionEntities.where({Code:code}).length > 0)
			return app.OptionEntities.where({Code:code})[0];
	}

	Helpers.buildRetailerCollection = function () {
		var userProvince = $.cookie('__mini-cfg-rgn');

			// content for the retails popover.
			var retailerCol = new Retailer.Collection(app.RetailerEntities.where({ ProvinceShort: userProvince,  }));
			if (retailerCol.length === 0) 
				retailerCol = new Retailer.Collection(app.RetailerEntities.toJSON());
			
			return retailerCol;
	};

	Helpers.buildUrl = function(vehicle, step) {
		var	v,
				linkFormat = "#/{modelSlug}/{vehicleSlug}/{step}",
				url;

		// ensure that the vehicle is an object, not a backbone model.
		try {
			v = vehicle.toJSON();
		} catch (e) {
			v = vehicle;
		}

		url = linkFormat.replace('{modelSlug}', v.ModelFamily.ModelSlug);
		url = url.replace('{vehicleSlug}', v.UrlSlug);
		url = url.replace('{step}', step);

		return url;
	}

	Helpers.buildYearSelectListCollection = function(birthDate) {
		var coll = new SelectListItem.Collection,
				model,
				selectedYear;
		
		if(birthDate.getFullYear) {
			selectedYear = birthDate.getFullYear();
		}

		for (var i = 1900; i < 1993; i++) {
			model = new SelectListItem.Model;
			model.set({'text': i, 'value':i}, {silent:true});
			if(i === selectedYear) {
				model.set({'selected':true}, {silent:true});
			}

			coll.add(model);
		}

		return coll;
	}

	Helpers.buildDaySelectListCollection = function(birthDate) {
		var coll = new SelectListItem.Collection,
				model,
				selectedDay;

		if(birthDate.getDate) {
			selectedDay= birthDate.getDate();
		}

		for (var i = 1; i < 31; i++) {
			model = new SelectListItem.Model;
			model.set({'text': i, 'value':i}, {silent:true});
			if(i === selectedDay) {
				model.set({'selected':true}, {silent:true});
			}

			coll.add(model);
		}

		return coll;
	}

	Helpers.buildMonthSelectListCollection = function(birthDate) {
		var coll = new SelectListItem.Collection,
				model,
				selectedMonth;

		if(birthDate.getMonth) {
			selectedMonth = birthDate.getMonth();
		}

		var months = app.UIStrings.Helpers.MonthsList.split(',');
		for (var i = 0; i < months.length; i++) {
			model = new SelectListItem.Model;
			model.set({'text': months[i], 'value':i}, {silent:true});
			if(i === selectedMonth) {
				model.set({'selected':true}, {silent:true});
			}
			coll.add(model);
		}

		return coll;
	}

	Helpers.buildCurrentVehicleManufacturerSelectListCollection = function(selectedManufacturer) {
		var coll = new SelectListItem.Collection,
				model;

		var manufacturers = app.UIStrings.Helpers.ManufacturerList.split(',');
		for (var i = 0; i < manufacturers.length; i++) {
			model = new SelectListItem.Model;
			model.set({'text': manufacturers[i], 'value':manufacturers[i]}, {silent:true});
			if(manufacturers[i] === selectedManufacturer) {
				model.set({'selected':true}, {silent:true});
			}

			coll.add(model);
		}
		
		return coll;
	}
	
	Helpers.buildVehicleYearSelectListCollection = function(selectedYear) {
		var coll = new SelectListItem.Collection,
				model;

		for (var i = 1990; i < 2013; i++) {
			model = new SelectListItem.Model;
			model.set({'text': i, 'value':i}, {silent:true});
			if(i === parseInt(selectedYear)) {
				model.set({'selected':true}, {silent:true});
			}

			coll.add(model);
		}

		return coll;
	}

	Helpers.buildVehicleConsideringSelectListCollection = function(selectedVehicle) {
		var coll = new SelectListItem.Collection,
				model;

		var vehicles = app.UIStrings.Helpers.VehicleList.split(',');
		for (var i = 0; i < vehicles.length; i++) {
			model = new SelectListItem.Model;
			model.set({'text': vehicles[i], 'value':vehicles[i]}, {silent:true});
			if(vehicles[i] === selectedVehicle) {
				model.set({'selected':true}, {silent:true});
			}

			coll.add(model);
		}
		
		return coll;
	}

	Helpers.buildExpectedPurchaseDateSelectListCollection = function(selectedPurchaseDate) {
		var coll = new SelectListItem.Collection,
				model;

		var purchaseDates = app.UIStrings.Helpers.PurchaseDatesList.split(',');
		for (var i = 0; i < purchaseDates.length; i++) {
			model = new SelectListItem.Model;
			model.set({'text': purchaseDates[i], 'value':purchaseDates[i]}, {silent:true});
			if(purchaseDates[i] === selectedPurchaseDate) {
				model.set({'selected':true}, {silent:true});
			}

			coll.add(model);
		}
		
		return coll;
	}

	Helpers.buildTitleSelectListCollection = function(selectedTitle) {
		var coll = new SelectListItem.Collection,
				model;

		var titles = app.UIStrings.Helpers.TitlesList.split(',');
		for (var i = 0; i < titles.length; i++) {
			model = new SelectListItem.Model;
			model.set({'text': titles[i], 'value':titles[i]}, {silent:true});
			if(titles[i] === selectedTitle) {
				model.set({'selected':true}, {silent:true});
			}
			
			coll.add(model);
		}
		
		return coll;
	}

	Helpers.buildRetailerSelectListCollection = function() {
		var coll = new SelectListItem.Collection,
				model;

		Helpers.buildRetailerCollection().each(function(r) {
			model = new SelectListItem.Model;
			model.set({'text': r.get('Name'), 'value':r.get('RetailerID')}, {silent:true});
			coll.add(model);				
		});

		return coll;
	}
	
	Helpers.buildVehicleSelectListCollection = function() {
		var coll = new SelectListItem.Collection,
				model;
		
		app.VehicleEntities.each(function(v) {
			model = new SelectListItem.Model;
			model.set({'text': v.get('Name'), 'value':v.get('VehicleID')}, {silent:true});
			coll.add(model);				
		});

		return coll;
	}

 	Helpers.buildPhoneTypeSelectListCollection = function() {
		var coll = new SelectListItem.Collection,
				model;

		var phoneTypes = app.UIStrings.Helpers.PhoneTypes.split(',');
		for (var i = 0; i < phoneTypes.length; i++) {
			model = new SelectListItem.Model;
			model.set({'text': phoneTypes[i], 'value':phoneTypes[i]}, {silent:true});
			coll.add(model);
		}
		
		return coll;
	}

 	Helpers.buildContactMethodSelectListCollection = function() {
		var coll = new SelectListItem.Collection,
				model;

		var contactMethods = app.UIStrings.Helpers.ContactMethods.split(',');
		for (var i = 0; i < contactMethods.length; i++) {
			model = new SelectListItem.Model;
			model.set({'text': contactMethods[i], 'value':contactMethods[i]}, {silent:true});
			coll.add(model);
		}
		
		return coll;
	}

	Helpers.buildRuleSentence = function(item) {
		var currentRules = app.CurrentProgress.get('currentVehicle').get('Rules'),
				leftSideName, action, rightSideName,
        itemCode = item.get('Code'),
				sentenceFormat = null,
        processedRules = [],
				formattedRules = [];

		_.each(currentRules, function(r) {
			if(_.indexOf(r.RightSide.split(','), itemCode) > -1 || itemCode === r.LeftSide) {
        // detrmine what the left side of the rule should say (depends on what side of the rule the item code matches.
        leftSideName = itemCode === r.RightSide ? Helpers.resolveCode(r.RightSide) : Helpers.resolveCode(r.LeftSide);
        
				switch (r.RuleType) {
					case "excludes":
						action = 'removes';
						break;
					case 'includes':
						action = 'includes';
						break;
					default:
						action = 'removes';
						break;
				}

        _.each(r.RightSide.split(','), function(rightSideCode) {
          // detrmine what the left side of the rule should say (depends on what side of the rule the item code matches.
          if(_.indexOf(r.RightSide.split(','), itemCode) > -1) {
            rightSideName = Helpers.resolveCode(r.LeftSide);
          } else {
            rightSideName = Helpers.resolveCode(rightSideCode);
          }

				  // now build up the rule sentence.
				  if(rightSideName !== undefined && leftSideName !== undefined) {
					  sentenceFormat = '{0} {1}'; // left side name | requires/includes excludes/removes | right side name
					  sentenceFormat = sentenceFormat.replace('{0}', action);
					  sentenceFormat = sentenceFormat.replace('{1}', rightSideName.get('Name') !== undefined ? rightSideName.get('Name') : rightSideName.get('Description'));
            
            // before we add this sentence make sure it isn't present in the array already.
            if(_.indexOf(formattedRules, sentenceFormat) < 0) {
              formattedRules.push(sentenceFormat);
            }
				  }
        });
			}

		});

		delete currentRules,leftSideName,action,rightSideName,itemCode, sentenceFormat, processedRules;

		return formattedRules.join(',');
	}

  Rule = namespace.module();
  Rule.Model = Backbone.Model.extend({});
  Rule.Collection = Backbone.Collection.extend({ model: Rule.Model });

  Helpers.buildRuleExplanation = function(item, step) {
		var currentRules = new Rule.Collection(app.CurrentProgress.get('currentVehicle').get('Rules')),
        rulesToRun = new Rule.Collection,
				leftSideName, action, rightSideName,
        itemCode = item.get('Code'),
				sentenceFormat = null,
        processedRules = [],
				formattedRules = [];

    var itemCategory = item.get('Category') === undefined ? 'bodycolour': item.get('Category').toLowerCase();
    if(itemCategory === 'roofcap' || itemCategory === 'roof' || itemCategory === 'cap') {
      itemCategory = 'roof';
    }

    if(step === 'step3') {
      itemCategory = 'package';
    }

    currentRules.each(function(r) {
      r = r.toJSON()
      _.each(r.RightSide.split(','), function(rsc) {
        if(rsc === itemCode) {
          
        }
      });
      
    });

    rulesToRun.add(currentRules.where({RightSide:itemCode}), {silent:true});

    rulesToRun.add(currentRules.where({LeftSide:itemCode}), {silent:true});
    
    var currentBodyColour = app.CurrentProgress.get('currentBodyColour'),
        currentRoof = app.CurrentProgress.get('currentRoof'),
        currentStripe = app.CurrentProgress.get('currentStripe'),
        currentPackages = app.CurrentProgress.get('currentPackages'),
        rightSideCodes;

    rulesToRun.each(function(r) {
      r = r.toJSON();
            
      if(r.RuleType === 'excludes') {
        rightSideCodes = r.RightSide.split(',');
        
        _.each(rightSideCodes, function(rsc) {
          if(itemCode === r.LeftSide) {
            leftSideName = Helpers.resolveCode(r.LeftSide) 
          }else {
            leftSideName = Helpers.resolveCode(rsc);
          }

          if(itemCode == rsc) {
            rightSideName = Helpers.resolveCode(r.LeftSide) 
          } else {
            rightSideName = Helpers.resolveCode(rsc);          
          }
        
        var sentence;
        if(itemCategory === 'bodycolour' || itemCategory === 'roof') {
          if(currentStripe !== undefined && rsc === currentStripe.get('Code') || r.LeftSide === currentStripe.get('Code')) {
            sentence = buildSentence(leftSideName, rightSideName);
            if(_.indexOf(formattedRules, sentence) < 0) {
              formattedRules.push(sentence);
            }
          }
        }

        if(itemCategory === 'bodycolour' || itemCategory === 'stripe') {
          if(currentRoof !== undefined && rsc === currentRoof.get('Code') || r.LeftSide === currentRoof.get('Code')) {
            sentence = buildSentence(leftSideName, rightSideName);
            if(_.indexOf(formattedRules, sentence) < 0) {
              formattedRules.push(sentence);
            }
          } 
        }

        if(itemCategory === 'roof' || itemCategory === 'stripe') {
          if(currentBodyColour !== undefined && rsc === currentBodyColour.get('Code') || r.LeftSide === currentBodyColour.get('Code')) {
            sentence = buildSentence(leftSideName, rightSideName);
            if(_.indexOf(formattedRules, sentence) < 0) {
              formattedRules.push(sentence);
            }
          }           
        }
        
        if(itemCategory === 'package') {
          _.each(currentPackages.models, function(p) {
            if(rsc === p.get('Code') || r.LeftSide === p.get('Code')) {
              sentence = buildSentence(leftSideName, rightSideName);
              if(_.indexOf(formattedRules, sentence) < 0) {
                formattedRules.push(sentence);
              }
            }
          });
        }

        });
      }
    });

		delete currentRules,leftSideName,action,rightSideName,itemCode, sentenceFormat, processedRules;

		return formattedRules.join(' ');
	}


  var buildSentence = function(leftSideName, rightSideName) {
    if(rightSideName !== undefined && leftSideName !== undefined) {
		  sentenceFormat = app.UIStrings.Helpers.RuleExplanation; // left side name | requires/includes excludes/removes | right side name
		  sentenceFormat = sentenceFormat.replace('{0}', leftSideName.get('Name') !== undefined ? leftSideName.get('Name') : leftSideName.get('Description'));
		  sentenceFormat = sentenceFormat.replace('{1}', rightSideName.get('Name') !== undefined ? rightSideName.get('Name') : rightSideName.get('Description'));
            
      return sentenceFormat;
	  }    
  }

  Helpers.buildStepLabel = function(s) {
    var stepText = '';
    switch (s) {
      case 'step0':
        stepText = 'Models';
        break;
      case 'step1':
        stepText = app.UIStrings.MainNavigation.ExteriorLabel;
        break;
      case 'step2':
        stepText = app.UIStrings.MainNavigation.InteriorLabel;
        break;
      case 'step3':
        stepText = app.UIStrings.MainNavigation.PackagesLabel;
        break;
      case 'step35':
        stepText = app.UIStrings.MainNavigation.WheelsLabel;
        break;
      case 'step4':
        stepText = app.UIStrings.MainNavigation.OptionsLabel;
        break;
      case 'step5':
        stepText = app.UIStrings.MainNavigation.ReviewLabel;
        break;
      default:
        break;
    }

    return stepText
  }

  Helpers.calculateLeaseRate = function(vehicle, term, price) {
    // first, grab the rate information for the vehicle and term requested
    var leaseRate,
        downPayment;
     _.each(vehicle.get('LeaseRates'), function(lr) {
      if(lr.Term === parseInt(term)) {
       leaseRate = lr;
      }
    });

    /*
      ir      - Annual interest rate ie. 2.90
      respct  - Residual percentage of all inclusive total(MRSP, FEES, Options)
      term    - Number of months ir. 48
      pv      - all inclusive pricing
    */
    if(leaseRate !== undefined) {
    var ir = leaseRate.InterestRate;
    var respct = leaseRate.ResidualRate;
    var dp = leaseRate.DownPayment;
    var term = term;
    var pv = price;

    // this does the actual calculation
//    var pmt = Math.round(((pv - (pv * (respct / 100) / Math.pow(1 + ((ir / 100) / 12), term))) / ((1 - (1 / Math.pow(1 + ((ir / 100) / 12), term))) / ((ir / 100) / 12))) * Math.pow(10, 2)) / Math.pow(10, 2);
    
    return Helpers.fullCalculateLeaseRate(ir, respct, term, pv, dp, 20);
    } else {
      return null;
    }
  }

  // used by the expanded lease calculator.
  Helpers.fullCalculateLeaseRate = function(ir, residualpct, term, pv,dp,km) {
    /*  ir      - Annual interest rate ie. 2.90
        respct  - Residual percentage of all inclusive total(MRSP, FEES, Options)
        term    - Number of months ir. 48
        dp      - Down payment
        pv      - all inclusive pricing  
        km      - #km per year of usage
        
   */
    
    // depending on the # of km's driven per year, add to the residual %
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
    var monthly_pmt = roundNumber(depreciated_value / term, 2);
    var money_factor = (interest / 2400) * 100;
    var interest_per_term = interest_monthly * term;
    var pv_rv = roundNumber(pv, 10) + roundNumber(residual_value, 10);
    var finance_charge = (pv_rv * money_factor) - (interest_per_term);
    var pmt = monthly_pmt + finance_charge;

    return roundNumber(pmt, 2);
  }

  
  Helpers.calculateFinanceRate = function(ir, term, pv, dp) {
  /*  ir      - Annual interest rate ie. 2.90
      term    - Number of months ir. 48
      dp      - Down payment
      pv      - all inclusive pricing  */

      pv = pv - dp;
      var interest_monthly = (ir / 100) / 12;
      var pmt = (pv * interest_monthly) / (1 - (Math.pow((1 + interest_monthly), -term)));
      return roundNumber(pmt, 2);
  }

  var roundNumber = function(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
  }

  // takes an error of errors (strings) and splits them up into individual lines (ending with a br tag)
  Helpers.buildErrorOutput = function(errors) {
    var output = '';
    _.each(errors, function (err) {
      output += err + '<br />';
    });

    return output;
  }
	return Helpers;
});