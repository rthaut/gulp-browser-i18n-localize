(function () {

    /*
     * predefined messages
     */
    var predefined = {
        locale: browser.i18n.getMessage("@@ui_locale"),
        direction: browser.i18n.getMessage("@@bidi_dir"),
        reversed_direction: browser.i18n.getMessage("@@bidi_reversed_dir"),
        start_edge: browser.i18n.getMessage("@@bidi_start_edge"),
        end_edge: browser.i18n.getMessage("@@bidi_end_edge"),
    };
    console.log(predefined);


    /*
     * user defined messages
     */
    var name = browser.i18n.getMessage("extensionName");
    console.log(name);

    // test string functions
    var description = browser.i18n.getMessage("extensionDescription").replace('localization', 'translations');
    console.log(description);

    // test messages with hard-coded values for the placeholders
    console.log(browser.i18n.getMessage("connectionString"));

})();