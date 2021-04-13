install: check_key_set public/script/rapidapi.js public/lib/jquery.ui.touch-punch.js

check_key_set:
ifeq ($(origin DEEPTRANSLATE_API_KEY),undefined)
	$(info Missing environmental variable: DEEPTRANSLATE_API_KEY)
endif

public/lib/jquery.ui.touch-punch.js:
	wget -P public/lib/ https://raw.githubusercontent.com/RWAP/jquery-ui-touch-punch/master/jquery.ui.touch-punch.js

public/script/rapidapi.js:
	echo "const DEEPTRANSLATE_API_KEY = '$(DEEPTRANSLATE_API_KEY)';" > $@