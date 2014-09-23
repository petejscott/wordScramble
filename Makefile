.PHONY: clean

SRCS = 	src/js/lib/pubsubz.js \ 
		src/js/js/swipeHandler.js \
		src/js/uiModules/newGameManager.js \ 
		src/js/uiModules/submitWordManager.js \ 
		src/js/uiModules/clearWordAttemptManager.js \ 
		src/js/uiModules/letterListManager.js \ 
		src/js/uiModules/maskedWordsManager.js \
		src/js/uiModules/previousWordsManager.js \ 
		src/js/dict/json_dict.js \ 
		src/js/gameBuilder_letters.js \
		src/js/gameBuilder.js \
		src/js/wordAttemptService.js \ 
		src/js/gameService.js \ 
		src/js/uiService.js

build: $(LIBS) $(SRCS)
	mkdir -p build
	cat $(SRCS) >build/wordScramble.js
	jsmin <build/wordScramble.js >build/wordScramble-tmp.js
	cat src/config.js build/wordScramble-tmp.js >build/wordScramble-min.js
	rm build/wordScramble-tmp.js
	cp src/prod.html >build/index.html

clean:
	rm -rf build