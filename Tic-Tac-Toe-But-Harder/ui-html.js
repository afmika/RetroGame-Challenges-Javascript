function showLog () {
    document.getElementById ('log_container').className = 'show_on_top';
}

function hideLog () {
    document.getElementById ('log_container').className = 'hide';
}

/**
 * @param {string} text 
 */
function writeLog (text) {
    document.getElementById ('game_log').innerText = text;
}


/**
 * @param {string} key 
 */
function pickLevel (key) {
    // restore previous
    document.getElementById ('level_btn_' + defined_level).className = 'default_level_btn';
    
    // define new
    // see sketch.js
    defined_level = key;
    max_depth = level[defined_level];
    document.getElementById ('level_btn_' + defined_level).className = 'selected_level_btn';
}