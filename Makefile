install: check_key_set script/rapidapi.js lib/jquery.ui.touch-punch.js

check_key_set:
ifeq ($(origin DEEPTRANSLATE_API_KEY),undefined)
	$(info Missing environmental variable: DEEPTRANSLATE_API_KEY)
else
	$(info set)
endif

lib/jquery.ui.touch-punch.js:
	wget -P lib/ https://raw.githubusercontent.com/RWAP/jquery-ui-touch-punch/master/jquery.ui.touch-punch.js

script/rapidapi.js:
	echo "const DEEPTRANSLATE_API_KEY = '$(DEEPTRANSLATE_API_KEY)';" > script/rapidapi.js