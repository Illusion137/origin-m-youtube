import assert from "./assert";

export function decode_hex(str: string) : string {
	return str.replace(/\\x22/g, '"').replace(/\\x7b/g, '{').replace(/\\x7d/g, '}').replace(/\\x5b/g, '[').replace(/\\x5d/g, ']').replace(/\\x3b/g, ';').replace(/\\x3d/g, '=').replace(/\\x27/g, '\'').replace(/\\\\/g, 'doubleAntiSlash').replace(/\\/g, '').replace(/doubleAntiSlash/g, '\\')
}
function extract_string_from_pattern(str: string, pattern: RegExp){
    const body_groups = pattern.exec(str);
    assert(body_groups.length >= 2, "Couldn't extract pattern from string");
    const extracted = body_groups[1];
    return extracted;
}

export function extract_yt_initial_data(decoded_html: string) : object {
    const yt_initial_data_regex = /ytInitialData ?= ?'({.+?})';<\/script>/gs; 
    return JSON.parse(extract_string_from_pattern(decoded_html, yt_initial_data_regex));
}
export function extract_ytcfg(html: string) : object{
    const ytcfg_data_regex = /ytcfg.set\((\{.+?\})\);/gs;
    return JSON.parse(extract_string_from_pattern(html, ytcfg_data_regex));
}