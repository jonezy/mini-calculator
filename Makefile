gh-pages: 
	rm -rf ../mini-calculator-ghpages/lib
	rm -rf ../mini-calculator-ghpages/j
	rm -rf ../mini-calculator-ghpages/c

	mkdir ../mini-calculator-ghpages/lib
	mkdir ../mini-calculator-ghpages/j
	mkdir ../mini-calculator-ghpages/c

	cp -r lib/* ../mini-calculator-ghpages/lib/
	cp -r j/* ../mini-calculator-ghpages/j/
	cp -r c/* ../mini-calculator-ghpages/c/
	cp index.html ../mini-calculator-ghpages
	cp crossdomain.xml ../mini-calculator-ghpages
