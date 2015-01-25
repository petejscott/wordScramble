.PHONY: clean

JSSRCS = src/js/lib/pubsub.js \
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

CSSSRCS = src/style/*.css

all: js css font image app

prep:
	mkdir -p build

app: prep
	cp src/prod.html build/index.html
	cp src/webapp.manifest.json build/webapp.manifest.json

image: prep
	cp -r src/image build/image

font: prep
	cp -r src/style/font build/

js: prep $(JSSRCS)
	cat $(JSSRCS) >build/wordScramble.js
	jsmin <build/wordScramble.js >build/wordScramble-min.js
	cp src/config.js build/config.js
	cp -r src/workers build/workers

css: prep $(CSSSRCS)
	awk 'FNR==1{print ""}{print}' $(CSSSRCS) > build/wordScramble.css

clean:
	rm -rf build
