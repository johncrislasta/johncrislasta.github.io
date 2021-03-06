jQuery(function($){

    $.ajax({
        type: "GET",
        url: "assets/js/data/recently-worked-on-websites.csv",
        dataType: "text",
        success: function(data) {
            let websites = csvObject(data),
                $recentlyWorkedOnWebsites = $('#recentlyWorkedOnWebsites');

            // console.log(websites);

            if (typeof websites === 'object' && websites !== null)
                $recentlyWorkedOnWebsites.empty();

            for(websiteIdx in websites) {
                // console.log(websites[websiteIdx]['Name']);
                $recentlyWorkedOnWebsites.append('<div class="column column-block">\n' +
                    '              <a href="' + websites[websiteIdx]['Link'] + '">\n' +
                    '                <img class="thumbnail" src="assets/images/tinified/' + websites[websiteIdx]['Image'] + '">\n' +
                    '                <h5>' + websites[websiteIdx]['Name'] + '</h5>\n' +
                    '              </a>\n' +
                    '            </div>');
            }
        }
    });

    var $form = $("form.send-message"),
        form_data = {};

    $form.submit(
        function(e){
            form_data = getFormData($form);
            e.preventDefault();
            $form.find('input, textarea').attr('readonly','readonly');
            $form.find('input[type=submit]').val('Sending...');

            $.ajax({
                headers: {
                    'Accept':'*/*',
                },
                method: 'POST',
                url: 'https://www.enformed.io/efebhyfb/',
                dataType: 'json',
                accepts: 'application/json',
                data: form_data,
                success: function(data) {
                    $('.form-container').html('<h5>Thank you for sending me a message. I\'ll get back to you as soon as possible.</h5>');
                },
                error: (err) => console.log(err)
            });
        }
    );

});

function getFormData(form){
    var unindexed_array = form.serializeArray();
    var indexed_array = {};


    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['name'] === 'message' ? n['value'] : nl2br(n['value']);
    });

    return indexed_array;
}

function nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

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