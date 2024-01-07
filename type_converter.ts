import assert from "./assert";
import { Chip, ContentItem, RunsText, Short, ReelShelf } from "./types/types";
import * as utils from './utils';

export function pre_runs_to_str(runs: {"runs": RunsText}): string {
    assert(runs?.['runs'] != undefined, "runs is undefined:" + JSON.stringify(runs));
    return runs['runs'].map(run => run.text).join("||");
}

export function chipCloudChipRenderer_to_chip(chipCloudChipRenderer: object) : Chip{
    return {
        "text": pre_runs_to_str(chipCloudChipRenderer['text']),
        "navigationEndPoint": chipCloudChipRenderer['navigationEndpoint']
    };
}
export function header_chip_bar_renderer_to_chips(possible_chip_objects: object[]) : Chip[]{
    const chips: Chip[] = [];
    for(const possible_chip of possible_chip_objects)
        if(utils.get_main_key(possible_chip) == "chipCloudChipRenderer")
            chips.push(chipCloudChipRenderer_to_chip(possible_chip['chipCloudChipRenderer']));
    return chips;
}

export function reelItemRenderer_to_short(reelItemRenderer: object) : Short{
    return {
        "video_id": reelItemRenderer['videoId'],
        "headline": pre_runs_to_str(reelItemRenderer['headline']),
        "thumbnails": reelItemRenderer['thumbnail']['thumbnails'],
        "feedback_token": reelItemRenderer['dismissalInfo']?.['feedbackToken']
    };
}

export function videoWithContextRenderer_to_content_item(videoWithContextRenderer: object){
    const video = videoWithContextRenderer;
    return {"video": 
                        {
                            "video_id": video['videoId'],
                            "title": pre_runs_to_str(video['headline']),
                            "author": {
                                "name": pre_runs_to_str(video['shortBylineText']),
                                "canonical_base_url": video['channelThumbnail']['channelThumbnailWithLinkRenderer']['navigationEndpoint']['browseEndpoint']['canonicalBaseUrl'],
                                "thumbnails": video['channelThumbnail']['channelThumbnailWithLinkRenderer']['thumbnail']['thumbnails']
                            },
                            "thumbnails": video['thumbnail']['thumbnails'],
                            "published_time_text": video['publishedTimeText'] != undefined ? pre_runs_to_str(video['publishedTimeText']) : undefined,
                            "views_count_text": pre_runs_to_str(video['shortViewCountText']),
                            "duration_thumbnail_overlay_text": pre_runs_to_str(video['lengthText']),
                            "is_watched": video['isWatched'],
                            "start_time_seconds": video['inlinePlaybackEndpoint']?.['watchEndpoint']?.['startTimeSeconds']
                        }
                    }
}

export function richItemRenderer_to_content_item(richItemRenderer: object) : ContentItem{
    const content = richItemRenderer['content'];
    const inner_content = content[utils.get_main_key(content)];
    switch(utils.get_main_key(content)){
        case("videoWithContextRenderer"): 
            return videoWithContextRenderer_to_content_item(content['videoWithContextRenderer'])
        default: assert(false, `richItemRenderer: '${utils.get_main_key(content)}' not found`);
    }
}

export function richSectionRenderer_to_content_item(richSectionRenderer: object) : ContentItem{
    const content = richSectionRenderer['content'];
    const inner_content = content[utils.get_main_key(content)];
    switch(utils.get_main_key(content)){
        case("reelShelfRenderer"):
            const shelf_items : object[] = inner_content['items'];
            return {"reel_shelf": shelf_items.map(reelItemRenderer => reelItemRenderer_to_short(reelItemRenderer['reelItemRenderer'])) };
            break; 
        default: assert(false, `richSectionRenderer: '${utils.get_main_key(content)}' not found`);
    }
}