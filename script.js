$(document).ready(function () {
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

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item").text(text);
        $(".history").append(li);
    }


    function currentWeather(inputField) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + inputField + "&appid=2b9cba78c08bf27b38d45c2dc80e7f72&units=imperial",
            dataType: "json",
            success: function (data) {
                // create history link for this search
                if (history.indexOf(inputField) === -1) {
                    history.push(inputField);
                    window.localStorage.setItem("history", JSON.stringify(history));

                    makeRow(inputField);
                }
                console.log(data)

                // clear any old content
                $("#today").empty();

                $("#temp").text(data.main.temp + "°F");
                $("#hum").text(data.main.humidity + "%");
                $("#wind").text(data.main.speed + "%");

                // create html content for current weather
                var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
                var card = $("<div>").addClass("card");
                var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
                var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
                var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
                var cardBody = $("<div>").addClass("card-body");
                var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

                // merge and add to page
                title.append(img);
                cardBody.append(title, temp, humid, wind);
                card.append(cardBody);
                $("#today").append(card);

                // call follow-up api endpoints
                fivedayForecast(inputField);
                var uv = uvIndex(data.coord.lat, data.coord.lon);


                // create html elements for a current weather card
                var col = $("<div>").addClass("w3-col");
                var card = $("<div>").addClass("w3-card w3-container w3-teal w3-margin-top");
                card.css("min-height", "20px");
                var body = $("<div>").addClass("card-body p-2");

                var title = $("<h5>").addClass("card-title").text("CURRENT");

                var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

                var p1 = $("<h5>").addClass("card-text").text("Temp: " + data.main.temp + " °F" + "  |  " + "Humidity: " + data.main.humidity + "%" + "  |  " + "Wind Speed: " + data.wind.speed + " MPH" + "  |  " + " UV index: " + data.main.uv + "%");
                // var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
                // var p3 = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + "MPH");
                // var p4 = $("<p>").addClass("card-text").text("UV index: " + 0 + "%");

                // merge together and put on page
                col.append(card.append(body.append(title, img, p1)));
                $("#current").append(col);
                ///
            }
        });
    }

    function fivedayForecast(inputField) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/forecast?q=" + inputField + "&appid=2b9cba78c08bf27b38d45c2dc80e7f72",
            dataType: "json",
            success: function (data) {
                // overwrite any existing content with title and empty row
                $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
                // console.log("forecast", data)
                // < div class="w3-third" >
                //  <div class="w3-card w3-container w3-teal" style="min-height:20px">
                // loop over all forecasts (by 3-hour increments)
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
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/uvi?appid=2b9cba78c08bf27b38d45c2dc80e7f72" + lat + "&lon=" + lon,
            dataType: "json",
            success: function (data) {
                var uv = $("<p>").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(data.value);
                return data.value

                // change color depending on uv value
                // if (data.value < 3) {
                //     btn.addClass("btn-success");
                // }
                // else if (data.value < 7) {
                //     btn.addClass("btn-warning");
                // }
                // else {
                //     btn.addClass("btn-danger");
                // }

                // $("#today .card-body").append(uv.append(btn));
            }
        });
    }


    // get current history, if any
    var history = JSON.parse(window.localStorage.getItem("history")) || [];

    if (history.length > 0) {
        currentWeather(history[history.length - 1]);
    }

    for (var i = 0; i < history.length; i++) {
        makeRow(history[i]);
    }
});