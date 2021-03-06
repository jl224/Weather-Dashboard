var uv = ""
var searchHistory = JSON.parse(window.localStorage.getItem("history"));
if (!searchHistory) {
    searchHistory = []
}

// console.log(searchHistory);

function makeRow(text) {
    var li = $("<li>").addClass("list-group-item").text(text);
    $(".history").append(li);
}


function currentWeather(inputField) {
    $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + inputField + "&appid=2b9cba78c08bf27b38d45c2dc80e7f72&units=imperial",
        dataType: "json",
        success: function (data) {
            // create history link for this search
            if (searchHistory.indexOf(inputField) === -1) {
                searchHistory.push(inputField);
                window.localStorage.setItem("history", JSON.stringify(searchHistory));

                makeRow(inputField);
            }
            console.log(data)

            // clear any old content
            $("#current").empty();

            $("#temp").text(data.main.temp + "°F");
            $("#hum").text(data.main.humidity + "%");
            $("#wind").text(data.main.speed + "%");

            // create html content for current weather
            var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
            var card = $("<div>").addClass("card");
            var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.main.speed + " MPH");
            var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
            var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
            var cardBody = $("<div>").addClass("card-body");
            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");


            // create html elements for a current weather card
            var col = $("<div>").addClass("w3-col");
            var card = $("<div>").addClass("w3-card w3-container w3-teal w3-margin-top");
            card.css("min-height", "20px");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text("TODAY'S FORECAST");

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");


            $.ajax("https://api.openweathermap.org/data/2.5/uvi?appid=2b9cba78c08bf27b38d45c2dc80e7f72&lat=" + data.coord.lat + "&lon=" + data.coord.lon).then(function (dataUV) {
                uv = dataUV.value
                console.log("uv", uv)


                var p1 = $("<h5>").addClass("card-text").text("Temp: " + data.main.temp + " °F" + "  |  " + "Humidity: " + data.main.humidity + "%" + "  |  " + "Wind Speed: " + data.wind.speed + " MPH" + "  |  " + " UV index: " + uv + "%");


                // merge together and put on page
                col.append(card.append(body.append(title, img, p1)));
                $("#current").append(col);
            })
            ///
            fivedayForecast(inputField);
        }
    });
}

function fivedayForecast(inputField) {
    $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + inputField + "&appid=2b9cba78c08bf27b38d45c2dc80e7f72&units=imperial",
        dataType: "json",
        success: function (data) {
            // overwrite any existing content with title and empty row
            $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
            for (var i = 0; i < data.list.length; i++) {

                // only look at forecasts around 12:00pm
                if (data.list[i].dt_txt.indexOf("12:00:00") !== -1) {

                    // create html elements for a bootstrap card
                    var col = $("<div>").addClass("col");
                    var card = $("<div>").addClass("w3-card w3-container w3-teal w3-margin-top");
                    card.css("min-height", "20px");
                    var body = $("<div>").addClass("card-body p-2");

                    var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

                    var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

                    var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
                    var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

                    // merge together and put on page
                    col.append(card.append(body.append(title, img, p1, p2)));
                    $("#forecast .row").append(col);
                }
            }
        }
    });
}

function uvIndex(lat, lon) {
    console.log("inside uv function:", lat, lon)
    var queryUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=2b9cba78c08bf27b38d45c2dc80e7f72&lat=" + lat + "&lon=" + lon
    console.log(queryUrl)

    $.ajax("https://api.openweathermap.org/data/2.5/uvi?appid=2b9cba78c08bf27b38d45c2dc80e7f72&lat=" + lat + "&lon=" + lon).then(function (data) {
        uv = data.value
    })

    // $("#today .card-body").append(uv.append(btn));
}



$(document).ready(function () {
    // history = JSON.parse(window.localStorage.getItem("history"));
    console.log("Document Ready")

    $("#inputSubmit").on("click", function () {
        var searchValue = $("#inputField").val();
        console.log(searchValue)

        // clear input box
        $("#inputField").val("");

        currentWeather(searchValue);
    });


    $(".history").on("click", "li", function () {
        currentWeather($(this).text());
    });



    // get current searchHistory, if any

    if (searchHistory.length > 0) {
        currentWeather(searchHistory[searchHistory.length - 1]);
    }

    for (var i = 0; i < searchHistory.length; i++) {
        makeRow(searchHistory[i]);
    }
});