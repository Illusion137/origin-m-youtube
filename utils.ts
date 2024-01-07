export function object_to_url_search_params_string(obj: object) : string{
    return Object.keys(obj).map(function(key) {
        return key + '=' + obj[key];
    }).join('&');
}

export function get_main_key(obj: object) : string{
    return Object.keys(obj)[0];
}