(function () {

    /*
     * predefined messages
     */
    var predefined = {
        locale: "en-US",
        direction: "ltr",
        reversed_direction: "rtl",
        start_edge: "left",
        end_edge: "right",
    };
    console.log(predefined);


    /*
     * user defined messages
     */
    var name = "My Custom Extension with Localization Support";
    console.log(name);

    // test string functions
    var description = "This is just a basic extension showing how to implement localization".replace('localization', 'translations');
    console.log(description);

    // test messages with hard-coded values for the placeholders
    console.log("Authentication: https://rthaut@github.com/rthaut:8888");

})();