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
    static ENDPOINT_TRANSLATE = "/language/translate/v2";
    static ENDPOINT_LANGUAGES = "/language/translate/v2/languages";

    constructor(api) {
        super();
        this.headers = {
            "content-type": "application/json",
            ...api.authHeaders
        };

        this._translateEndpoint = new URL(DeepTranslator.ENDPOINT_TRANSLATE, api.url).toString();
        this._languageEndpoint = new URL(DeepTranslator.ENDPOINT_LANGUAGES, api.url).toString();
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
    async getLanguages() {
        return {
            "Reversed": "reverse",
            "Upper-case": "uppercase"
        };
    }

    async translate(phrase) {
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
}