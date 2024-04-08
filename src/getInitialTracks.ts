import {getTracksFromPlaylist, isPlaylistSuitable} from "./helperFunctions.js";
import {
    PlaylistContentsItem,
    PlaylistMetadata,
    PlaylistUri,
    TrackUri,
    UserContents,
    UserContentsItem
} from "./types.js";

/**
 *  get all local tracks
 *  @return TrackUri[]
 */
export async function getAllLocalTracks(): Promise<TrackUri[]> {
    const localUris: TrackUri[] = [];
    // get all local playlists and their tracks
    const userContents = await Spicetify.Platform.RootlistAPI.getContents() as UserContents;
    console.log("User content loaded")
    // handle each item (can be playlist or folder)
    for (const item of userContents.items) {
        const uris: TrackUri[] = await processItem(item);
        if (uris) {
            localUris.push(...uris);
        }
    }
    // get all liked tracks
    await getLikedTracks().then((uris: TrackUri[] | undefined) => {
        if (uris) {
            localUris.push(...uris)
        }
    })
    return localUris.flat()
}

/**
 * get uris from folder or playlist recursively
 * @param item (playlist or folder)
 * @return TrackUri[]
 */
async function processItem(item: UserContentsItem) {
    enum ItemType {
        Playlist = "playlist",
        Folder = "folder"
    }

    const stack = [item];
    const trackUris: TrackUri[] = [];
    while (stack.length > 0) {
        const currentItem = stack.pop();
        if (!currentItem) continue;
        if (currentItem.type === ItemType.Playlist) {
            const userPlaylist = await isPlaylistSuitable(currentItem as PlaylistMetadata);
            if (userPlaylist) {
                const tracks: TrackUri[] = await getTracksFromPlaylist(currentItem.uri as PlaylistUri);
                trackUris.push(...tracks);
            }
        } else if (currentItem.type === ItemType.Folder) {
            for (const nestedItem of currentItem.items) {
                stack.push(nestedItem);
            }
        } else {
            console.log("Something other than Playlist or Folder was found");
        }
    }
    return trackUris.flat();
}

/**
 * get all liked tracks
 * @returns TrackUri[]
 */
async function getLikedTracks(): Promise<TrackUri[] | undefined> {
    const liked = await Spicetify.Platform.LibraryAPI.getTracks({offset: 0, limit: -1});
    return liked.items.map((likedTrack: PlaylistContentsItem) => likedTrack.uri)
}