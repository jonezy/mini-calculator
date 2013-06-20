gh-pages: 
	grunt

	rm -rf ../mini-calculator-ghpages/lib
	rm -rf ../mini-calculator-ghpages/j
	rm -rf ../mini-calculator-ghpages/c

	mkdir ../mini-calculator-ghpages/lib
	mkdir ../mini-calculator-ghpages/j
	mkdir ../mini-calculator-ghpages/c

	cp -r lib/* ../mini-calculator-ghpages/lib/
	cp -r j/calculator.min.js ../mini-calculator-ghpages/j/
	cp -r j/calculator-templates ../mini-calculator-ghpages/j/
	cp -r c/calculator.min.css ../mini-calculator-ghpages/c/
	cp index-ghpages.html ../mini-calculator-ghpages/index.html
	cp crossdomain.xml ../mini-calculator-ghpages
