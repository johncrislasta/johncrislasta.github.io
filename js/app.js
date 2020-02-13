jQuery(function($){
    $.getJSON('data/list-of-websites-worked-on.json', function(data) {
        websites = data;
        for(stateAbrv in states) {
            $select.append('<option value="'+stateAbrv+'">'+states[stateAbrv]+'</option>')
        }
    });
});