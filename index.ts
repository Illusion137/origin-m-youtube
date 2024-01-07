import axios from "axios";
import * as utils from "./utils";
import * as Cookies from "./cookies";
import * as auth from './auth';
import * as extractor from "./html_extractor";
import * as converter from "./type_converter"
import * as ytcfg from "./ytcfg"
import assert from "./assert";
import ContinuationItem from './types/ContinuationItem';
import { ContentItem, Chip, YTCFG } from './types/types';
import PostClientContext from "./types/PostClientContext";
import { decode_hex } from './html_extractor';

let youtube_get_headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Cookies": ""
}
let youtube_post_headers = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "same-origin",
    "sec-fetch-site": "same-origin",
    "x-goog-authuser": "0",
    "x-origin": "https://m.youtube.com",
    "x-youtube-bootstrap-logged-in": "true",
    "x-youtube-client-name": "2",
    "x-youtube-client-version": "2.20240102.09.00",
    "Referer": "https://m.youtube.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "authorization": "SAPISIDHASH", //SAPISIDHASH
    "Cookies": "",
}

export let youtube_cookie_jar : Cookies.CookieJar;

function update_youtube_headers(){
    if(youtube_cookie_jar == undefined) return; 
    const stringified_cookies = Cookies.cookies_to_string(youtube_cookie_jar);
    youtube_get_headers['Cookies'] = stringified_cookies;
    youtube_post_headers['Cookies'] = stringified_cookies;
    const sapisid_cookie = Cookies.get_cookie_from_jar(youtube_cookie_jar, "SAPISID");
    youtube_post_headers['authorization'] = auth.get_youtube_sapisid_hash_auth(sapisid_cookie.value);
}

const requests = axios.create({baseURL: "https://m.youtube.com"});

async function youtube_post_request(path: string, query_params_object: object, request_payload: object){
    if(youtube_cookie_jar != undefined) update_youtube_headers();
    const response = await requests.post(`${path}?${utils.object_to_url_search_params_string(query_params_object)}`, request_payload, {"headers": youtube_post_headers});
    const set_cookies_jar = Cookies.axios_set_cookie_to_cookies(response.headers['set-cookie']);
    if(set_cookies_jar != undefined) youtube_cookie_jar = Cookies.update_cookies(youtube_cookie_jar, set_cookies_jar);
    return response;
}

async function continuation_request(continuationItemRenderer: ContinuationItem, context: PostClientContext, apiKey: string){
    let request_payload: object = continuationItemRenderer.continuationEndpoint.continuationCommand;
    request_payload['context'] = context;
    const response = await youtube_post_request(
        continuationItemRenderer.continuationEndpoint.commandMetadata.webCommandMetadata.apiUrl, 
        {"key": apiKey, "prettyPrint": false}, 
        request_payload
    );
    return response;
}

interface YouTubeContents {
    chips?: Chip[],
    contents: ContentItem[],
    config: YTCFG
}

function parse_items(response_item_contents: object[]): ContentItem[]{
    const content_items: ContentItem[] = [];
    for(const item of response_item_contents){
        const item_data = item[utils.get_main_key(item)];
        switch(utils.get_main_key(item)){
            case "richItemRenderer":
                content_items.push(converter.richItemRenderer_to_content_item(item_data));
                break;
            case "videoWithContextRenderer":
                content_items.push(converter.videoWithContextRenderer_to_content_item(item_data));
                break;
            case "richSectionRenderer":
                content_items.push(converter.richSectionRenderer_to_content_item(item_data));
                break;
            case "continuationItemRenderer":
                content_items.push({"continuation": item_data});
                break;
            case "compactRadioRenderer": console.warn("compactRadioRenderer is unimplemented"); break;
            case "adSlotRenderer": break; //Ignore ads :3
            default: assert(false, `Unknown '${utils.get_main_key(item)}' in response_item_contents`);
        }
    }
    return content_items;
}
function get_contents(page_html: string) : YouTubeContents{
    const yt_initial_data = extractor.extract_yt_initial_data( decode_hex(page_html) );
    const youtube_config = extractor.extract_ytcfg(page_html);
    const response_contents : object = yt_initial_data['contents'];
    assert(response_contents != undefined, "Unable to find yt_initial_data contents");
    let response_result_renderer : object;
    switch(utils.get_main_key(yt_initial_data['contents'])){
        case "singleColumnBrowseResultsRenderer": 
            response_result_renderer = response_contents['singleColumnBrowseResultsRenderer'];
            break;
        case "twoColumnBrowseResultsRenderer": 
            response_result_renderer = response_contents['twoColumnBrowseResultsRenderer'];
            break;
        case "sectionListRenderer": // SEARCH
            let content_items: ContentItem[] = [];   
            for(const item of response_contents['sectionListRenderer']['contents']){
                switch(utils.get_main_key(item)){
                    case "itemSectionRenderer":
                        content_items = content_items.concat(parse_items(item['itemSectionRenderer']['contents']));
                        break;
                    case "continuationItemRenderer":
                        content_items = content_items.concat({'continuation': item['continuationItemRenderer']});
                        break;
                    default: assert(false, `Unknown '${utils.get_main_key(item)}' in sectionListRenderer`);
                }
            }
            return {"contents": content_items, "config": ytcfg.ytcfg_mini(youtube_config)};
        default: assert(false, `Unknown '${utils.get_main_key(yt_initial_data['contents'])}' in yt_initial_data['contents']`);
    }
    const response_tab_renderer_content = response_result_renderer['tabs'][0]['tabRenderer']['content'];
    const response_chips_contents = response_tab_renderer_content['richGridRenderer']['header']['feedFilterChipBarRenderer']['contents'];
    const response_item_contents = response_tab_renderer_content['richGridRenderer']['contents']; 
    const content_items : ContentItem[] = parse_items(response_item_contents);

    return {
        "chips": converter.header_chip_bar_renderer_to_chips(response_chips_contents),
        "contents": content_items,
        "config": ytcfg.ytcfg_mini(youtube_config)
    };
}
export async function get_contents_continuation(continuation_item: ContinuationItem, ytcfg: YTCFG): Promise<ContentItem[]>{
    const response_data = (await continuation_request(continuation_item, ytcfg.client, ytcfg.api_key)).data;
    const response_new_items = response_data['onResponseReceivedActions'][0]['appendContinuationItemsAction']['continuationItems'];
    const content_items : ContentItem[] = parse_items(response_new_items);
    return content_items;
}

export async function home() : Promise<YouTubeContents>{
    const home_page_html = (await requests.get("", {"headers": youtube_get_headers})).data;
    return get_contents(home_page_html);
}

export async function search(query, filters = undefined) : Promise<YouTubeContents>{
    const query_params = { 
        "search_query": encodeURIComponent(query).split("%20").join("+")
    }
    const search_page_html = (await requests.get(`results?${utils.object_to_url_search_params_string(query_params)}`, {"headers": youtube_get_headers})).data
    return get_contents(search_page_html);
}
function search_continuation(){

}
function get_channel(channel_canonical_url_path){

}