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