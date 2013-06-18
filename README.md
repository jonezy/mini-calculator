# MINI Calculator

The finance calculator that will be used on the end of lease and mini.ca
builds can and should be a reusable component.

This project is built using backbone, underscore and jquery (same as mini.ca)

#### Potential Problems

1. All of the calculator code for buildmymini.ca is spread across multiple files.
  - helpers, vehicles, calculator etc. 
2. The buildmymini.ca calculator depends on buildmymini.ca data
  - Going to have to externalize all the data.
3. This might not even work/be possible.

# Goals

1. The ability to do this:

        var calc = new MiniCalculator(options);
        $('#calculator').html(calc.render().el);

2. Copy calculator.js and the templates directory into a destination project and it works.


# Project layout

    js
      calculator.js
      calculator-templates
        header.html
        main.html
        footer.html
    test.html
    
File/Folder         |  Explanation
--------------------|------------------------------------
js/calculator.js    | main file to be included on the page
js/templates/*.html | these are the html files that comprise the user interface of the module.
                      
ideally this could be setup as some kind of dependency within the mini.ca project (node + browserify) so that it could be
updated really quickly and easily but kept in seperate standalone repo's

