export interface Cookie{
    name: string, 
    value: string,
    expires: Date
}

export type CookieJar = Cookie[];

export function is_cookie_expired(cookie: Cookie) : boolean { return new Date() > cookie.expires; }

export function remove_expired_cookies(jar: CookieJar) : CookieJar{
    return jar.filter(cookie => !is_cookie_expired(cookie));
}

export function has_cookie(jar: CookieJar, has_cookie_name: string){
    return jar.findIndex(cookie => cookie.name == has_cookie_name) != -1;
}

export function get_cookie_from_jar(jar: CookieJar, cookie_name: string) : Cookie{
    const cookie_in_jar_index = jar.findIndex(cookie => cookie.name == cookie_name);
    if(cookie_in_jar_index == -1) throw "Cookie not found in jar";
    const cookie: Cookie = jar[cookie_in_jar_index];
    if(is_cookie_expired(cookie)) throw "Cookie expired in jar";
    return cookie;
}

export function update_cookies(jar: CookieJar, response_cookies: CookieJar): CookieJar{
    const new_jar: CookieJar = response_cookies;
    for(const cookie of jar)
        if(new_jar.findIndex(new_jar_cookie => new_jar_cookie.name == cookie.name ) == -1 )
            new_jar.push(cookie);
    return remove_expired_cookies(new_jar);
}

export function axios_set_cookie_to_cookies(cookie_strings: string[]): CookieJar{
    if(cookie_strings == undefined) return undefined;
    const cookie_key_value_regex = /(.+?)=(.+?)(;|$)/;
    const cookie_expiration_date_regex = /Expires=(.+?)(;|$)/;
    const jar: CookieJar = [];
    for(const cookie_string of cookie_strings){
        let cookie : Cookie;
        const cookie_key_value = cookie_key_value_regex.exec(cookie_string);
        const cookie_expiration_date = cookie_expiration_date_regex.exec(cookie_string);
        cookie.name = cookie_key_value[1]; 
        cookie.value = cookie_key_value[2]; 
        cookie.expires = new Date(cookie_key_value[1]);
        jar.push(cookie);
    }
    return jar;
}

export function cookies_to_string(jar: CookieJar): string{
    let stringified_cookies = "";
    for (const cookie of jar)
        stringified_cookies += `${cookie.name}=${cookie.value}; `;
    return stringified_cookies.slice(0, stringified_cookies.length-2);
}