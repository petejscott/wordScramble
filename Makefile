.PHONY: clean

SRCS = src/js/lib/pubsubz.js \
       src/js/swipeHandler.js \
       src/js/uiModules/drawer.js \
       src/js/uiModules/newGameManager.js \
       src/js/uiModules/submitWordManager.js \
       src/js/uiModules/clearWordAttemptManager.js \
       src/js/uiModules/letterListManager.js \
       src/js/uiModules/maskedWordsManager.js \
       src/js/uiModules/previousWordsManager.js \
       src/js/uiModules/currentWordsManager.js \
       src/js/dict/json_dict.js \
       src/js/gameBuilder/gameBuilder_letters.js \
       src/js/gameBuilder/gameBuilder.js \
       src/js/wordAttemptService.js \
       src/js/gameService.js \
       src/js/uiService.js

build: $(SRCS)
	mkdir -p build
	cat $(SRCS) >build/wordScramble.js
	jsmin <build/wordScramble.js >build/wordScramble-min.js
	cp src/config.js build/config.js
	cp src/style/wordScramble.css build/wordScramble.css
	cp src/style/drawer.css build/drawer.css
	cp -r src/font/ build/font/
	cp src/prod.html build/index.html

clean:
	rm -rf build
