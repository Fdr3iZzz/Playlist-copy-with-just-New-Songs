/**
 * structure of track objects which are saved in the database
 */
export interface TrackObject {
    uri: TrackUri
    isrc: string
    name: string
    artist: Array<string>
    duration: number
}

export type TrackUri = `spotify:track:${TrackId}` & string
export type TrackId = string
export type PlaylistUri = `spotify:playlist:${string}` & string
export type UserUri = `spotify:user:${string}` & string
export type FolderUri = `${UserUri}:folder:${string}` & string

// ---------------------------------------------------------------------------

export interface UserContents {
    type: ItemType;
    addedAt: Date;
    items: UserContentsItem[];
    name: string;
    uri: string;
    totalItemCount: number;
}

export interface UserContentsItem extends PlaylistMetadata{
    addedAt: Date;
    items: UserContentsItem[];
}

export interface Collaborators {
    count: number;
    items: any[];
}

export interface Image {
    url: string;
    label: Label;
}

export enum Label {
    Large = "large",
    Small = "small",
    Standard = "standard",
    Xlarge = "xlarge",
}

export interface Owner {
    type: string;
    uri: string;
    username: string;
    displayName: string;
    images: any[];
}

export enum ItemType {
    Folder = "folder",
    Playlist = "playlist",
}

// ------------------------------------------
export interface SpotifyTrack {
    tracks: Track[];
}

export interface Track {
    album: Album;
    artists: Artist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: ExternalIds;
    external_urls: ExternalUrls;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: TrackUri;
}

export interface Album {
    album_type: string;
    artists: Artist[];
    available_markets: string[];
    external_urls: ExternalUrls;
    href: string;
    id: string;
    images: TrackImage[];
    name: string;
    release_date: Date;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: string;
}

export interface Artist {
    external_urls: string;
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
}

export interface ExternalUrls {
    spotify: string;
}

export interface ExternalIds {
    isrc: string;
}

export interface TrackImage {
    height: number;
    url: string;
    width: number;
}

// ---------------------------------
export interface TrackEvent {
    defaultPrevented: boolean;
    immediateStopped: boolean;
    stopped: boolean;
    type: string;
    data: TrackEventData;
}

export interface TrackEventData {
    operation: string;
    uri: PlaylistUri;
    uris?: TrackUri[];
    items?: TrackEventDataItem[];
    error: null;
}

export interface TrackEventDataItem {
    uri: TrackUri;
    uid: string;
}

// -------------------------------------

export interface PlaylistEvent {
    defaultPrevented: boolean;
    immediateStopped: boolean;
    stopped: boolean;
    type: string;
    data: PlaylistEventData;
}

export interface PlaylistEventData {
    operation: string;
    items: PlaylistEventDataItem[];
    error: null;
}

export interface PlaylistEventDataItem {
    uri: PlaylistUri;
}
// ---------------------------------------

export interface LikedEvent {
    defaultPrevented: boolean;
    immediateStopped: boolean;
    stopped: boolean;
    type: string;
    data: LikedEventData;
}

export interface LikedEventData {
    operation: string;
    uris: TrackUri[];
    error: null;
    silent: boolean;
}

// ----------------------------------------------

export interface Playlist {
    metadata: PlaylistMetadata;
    contents: PlaylistContents;
}

export interface PlaylistContents {
    items: PlaylistContentsItem[];
    offset: number;
    limit: number;
    totalLength: number;
}

export interface PlaylistContentsItem {
    uid: string;
    playIndex: null;
    addedAt: Date;
    addedBy: Owner;
    formatListAttributes: any;
    type: string;
    uri: TrackUri[];
    name: string;
    album: Album;
    artists: Artist[];
    discNumber: number;
    trackNumber: number;
    duration: any;
    isExplicit: boolean;
    isLocal: boolean;
    isPlayable: boolean;
    is19PlusOnly: boolean;
    hasAssociatedVideo: boolean;
}

export interface Owner {
    type: string;
    OwnerUri: UserUri;
    username: string;
    displayName: string;
    OwnerImages: Image[];
}

export interface Album {
    type: string;
    uri: string;
    name: string;
    artist: Artist;
    AlbumImages: Image[];
}

export interface Artist {
    type: string;
    uri: string;
    name: string;
}

export interface PlaylistMetadata {
    type: string;
    uri: string;
    name: string;
    description: string;
    images: Image[];
    madeFor: null;
    owner: Owner;
    totalLength: number;
    unfilteredTotalLength: number;
    totalLikes: number;
    duration: MetadataDuration;
    isLoaded: boolean;
    isOwnedBySelf: boolean;
    isPublished: boolean;
    hasEpisodes: boolean;
    hasSpotifyTracks: boolean;
    hasSpotifyAudiobooks: boolean;
    canAdd: boolean;
    canRemove: boolean;
    canPlay: boolean;
    formatListData: null;
    canReportAnnotationAbuse: boolean;
    hasDateAdded: boolean;
    permissions: Permissions;
    collaborators: Collaborators;
    isCollaborative: boolean;
}

export interface MetadataDuration {
    milliseconds: number;
    isEstimate: boolean;
}

export interface Permissions {
    canView: boolean;
    canAdministratePermissions: boolean;
    canCancelMembership: boolean;
    isPrivate: boolean;
}