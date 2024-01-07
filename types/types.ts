import ContinuationItem from "./ContinuationItem";
import PostClientContext from "./PostClientContext";

export type RunsText = { "text": string }[];
interface Thumbnail{
    url: string,
    width: number,
    height: number
}
export interface Chip {
    text: string
    navigationEndPoint: ContinuationItem
}
export interface YTCFG{
    api_key: string,
    client: PostClientContext
}
interface Author{
	name: string,
	canonical_base_url: string,
	thumbnails: Thumbnail[],
}
type CommentBadge = undefined | "pin" | "heart";
type CommentVoteStatus = undefined | "like" | "dislike";
type CommentReplies = undefined | { "replies": Comment[], "continuation": ContinuationItem };
export interface Comment{
	id: string,
    author: Author,
    replies_count: number
    replies: CommentReplies,
    content_text: string,
    badges: CommentBadge[],
    published_time_text: string,
    vote_count_text: string,
    vote_status: CommentVoteStatus,
}
interface CommentSectionHeader { 
    total_comments: number,
    top_comment_author_thumbnail: Thumbnail[]
    top_comment_text: string,
}
export interface CommentSection{
    header: CommentSectionHeader,
    comments: Comment[]
    continuation: ContinuationItem
}
export interface Video {
    video_id: string,
    title: string,
    author: Author,
    thumbnails: Thumbnail[],
    published_time_text: string,
    views_count_text: string,
    duration_thumbnail_overlay_text: string,
    is_watched: boolean,
    start_time_seconds: number
}
export interface CompactVideo{}
export interface Short {
    video_id: string,
    headline: string,
    thumbnails: Thumbnail[],
    feedback_token: string
}
export interface ReelShelf{

}
export type ContentItem={"video": Video} | 
                        {"reel_shelf": ReelShelf} | 
                        {"continuation": ContinuationItem};