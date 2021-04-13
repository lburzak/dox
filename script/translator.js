class Translator {
    setSourceLang(lang) {
        this._sourceLang = lang;
    }

    setTargetLang(lang) {
        this._targetLang = lang;
    }

    _assertLangSelected() {
        if (this._sourceLang === undefined)
            throw new Error("Unable to translate: Source language not selected.");
        if (this._targetLang === undefined)
            throw new Error("Unable to translate: Target language not selected.");
    }

    getLanguages() { throw new Error("Unimplemented.") }
    translate(phrase) { throw new Error("Unimplemented.") }
}

class DeepTranslator extends Translator {
    static URL = "https://deep-translate1.p.rapidapi.com";
    static ENDPOINT_TRANSLATE = "/language/translate/v2";
    static ENDPOINT_LANGUAGES = "/language/translate/v2/languages";
    static AUTH_HEADERS = {
        "x-rapidapi-key": `${DEEPTRANSLATE_API_KEY}`,
        "x-rapidapi-host": "deep-translate1.p.rapidapi.com"
    };

    constructor() {
        super();
        this.headers = {
            "content-type": "application/json",
            ...DeepTranslator.AUTH_HEADERS
        };

        this._translateEndpoint = new URL(DeepTranslator.ENDPOINT_TRANSLATE, DeepTranslator.URL).toString();
        this._languageEndpoint = new URL(DeepTranslator.ENDPOINT_LANGUAGES, DeepTranslator.URL).toString();
    }

    async getLanguages() {
        const response = await fetch(this._languageEndpoint, {
            "method": "GET",
            "headers": this.headers
        });

        const result = await response.json();

        return result?.languages?.reduce((table, lang) => {
            table[lang.name] = lang.language;
            return table;
        }, {});
    }

    async translate(phrase) {
        this._assertLangSelected();

        const response = await fetch(this._translateEndpoint, {
            "method": "POST",
            "headers": this.headers,
            "body": this._createTranslateRequestBody(phrase)
        });

        const result = await response.json();

        return result?.data?.translations?.translatedText;
    }

    _createTranslateRequestBody(phrase) {
        return JSON.stringify({
            "q": phrase,
            "source": this._sourceLang,
            "target": this._targetLang
        });
    }
}

class MockTranslator extends Translator {
    _delayMilliseconds = 0;

    async getLanguages() {
        await this._delay();

        return {
            "Reversed": "reverse",
            "Upper-case": "uppercase"
        };
    }

    async translate(phrase) {
        await this._delay();

        this._assertLangSelected();

        switch (this._targetLang) {
            case "reverse":
                return phrase.split('').reverse().join('');
            case "uppercase":
                return phrase.toUpperCase();
            default:
                return phrase;
        }
    }

    withDelay(milliseconds) {
        this._delayMilliseconds = milliseconds;
        return this;
    }

    async _delay() {
        return new Promise(resolve => setTimeout(resolve, this._delayMilliseconds))
    }
}