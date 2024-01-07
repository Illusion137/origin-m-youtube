import PostClientContext from "./types/PostClientContext";
import { YTCFG } from "./types/types";

function get_client_from_ytcfg(ytcfg: object) : PostClientContext { return ytcfg['INNERTUBE_CONTEXT']; }
function get_api_key_from_ytcfg(ytcfg: object) : string{ return ytcfg['INNERTUBE_API_KEY']; }

export function ytcfg_mini(ytcfg: object): YTCFG{
    return {
        "api_key": get_api_key_from_ytcfg(ytcfg),
        "client": get_client_from_ytcfg(ytcfg)
    }
}