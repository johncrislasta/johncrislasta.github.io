jQuery(function($){

    $.ajax({
        type: "GET",
        url: "js/data/recently-worked-on-websites.csv",
        dataType: "text",
        success: function(data) {
            let websites = csvObject(data),
                $recentlyWorkedOnWebsites = $('#recentlyWorkedOnWebsites');

            // console.log(websites);

            if (typeof websites === 'object' && websites !== null)
                $recentlyWorkedOnWebsites.empty();

            for(websiteIdx in websites) {
                // console.log(websites[websiteIdx]['Name']);
                $recentlyWorkedOnWebsites.append('<div class="column">\n' +
                    '              <a href="' + websites[websiteIdx]['Link'] + '">\n' +
                    '                <img class="thumbnail" src="images/' + websites[websiteIdx]['Image'] + '">\n' +
                    '                <h5>' + websites[websiteIdx]['Name'] + '</h5>\n' +
                    '              </a>\n' +
                    '            </div>');
            }
        }
    });

});

//var csv is the CSV file with headers
function csvObject(csv){


    var lines=csv.split("\n");

    var result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){

        var obj = {};
        var currentline=lines[i].split(",");

        if(currentline[0] === "") continue;

        for(var j=0;j<headers.length;j++){
            obj[headers[j].trim()] = currentline[j].trim();
        }

        result.push(obj);

    }

    return result;
}