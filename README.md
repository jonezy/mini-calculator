# MINI Calculator

The finance calculator that will be used on the end of lease and mini.ca
builds can and should be a reusable component.

This project is built using backbone, underscore and jquery (same as mini.ca)


# Goals

The ability to do this:

    var calc = new Calculator.Views.Main(options);
    $('#calculator').html(calc.render().el);

# Installation

1. `npm install -g grunt-cli`
2. make
3. Copy the contents of the ./dist folder into your project.

        File/Folder                 |  Explanation
        ----------------------------|------------------------------------
        calculator.min.js           | goes in /j/
        calculator-templates/.html  | goes in /j/calculator-templates
        calculator.min.css          | goes in /c
        
4. Add this code to your page (or something similar)

        <link rel="stylesheet" href="c/calculator.min.css">
        <script src='j/calculator.min.js'></script>
        <script>
            var calc = new Calculator.Views.Main(options);
            $('#calculator').html(calc.render().el);
        </script>

# Project layout

    j
      calculator.js
      calculator-templates
        header.html
        main.html
        footer.html
    c
      calculator.css
    index.html
    
File/Folder         |  Explanation
--------------------|------------------------------------
js/calculator.js    | main file to be included on the page
js/templates/.html  | these are the html files that comprise the user interface of the module.                  
ideally this could be setup as some kind of dependency within the mini.ca project (node + browserify) so that it could be
updated really quickly and easily but kept in seperate standalone repo's

# Dependencies

- Backbone.js
- underscore
- jquery
- MINI Bootstrap

