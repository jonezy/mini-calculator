build:
	grunt
	
	rm -rf ./dist
	mkdir ./dist
	mkdir ./dist/calculator-templates
	
	cp ./src/j/calculator.min.js ./dist
	cp -r ./src/j/calculator-templates ./dist
	cp ./src/c/calculator.min.css ./dist

gh-pages: 
	grunt

	rm -rf ../mini-calculator-ghpages/lib
	rm -rf ../mini-calculator-ghpages/j
	rm -rf ../mini-calculator-ghpages/c

	mkdir ../mini-calculator-ghpages/lib
	mkdir ../mini-calculator-ghpages/j
	mkdir ../mini-calculator-ghpages/c

	cp -r ./src/lib/* ../mini-calculator-ghpages/lib/
	cp -r ./src/j/calculator.min.js ../mini-calculator-ghpages/j/
	cp -r ./src/j/calculator-templates ../mini-calculator-ghpages/j/
	cp -r ./src/c/calculator.min.css ../mini-calculator-ghpages/c/
	cp ./src/index-ghpages.html ../mini-calculator-ghpages/index.html
	cp ./src/crossdomain.xml ../mini-calculator-ghpages
