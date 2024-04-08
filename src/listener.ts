import {counter, db} from "./database.js";
import {getTrackObject, getTracksFromPlaylist} from "./helperFunctions.js";
import {LikedEvent, PlaylistEvent, TrackEvent, TrackUri} from "./types.js";

/**
 * get added/ deleted tracks and add/ remove them from the database and map
 * @param event
 */
export async function trackEventHandler(event: TrackEvent) {
    if (!event?.data?.operation) return console.log("Unable to tell event type");
    // check if its desired event
    if (event.data.operation === "add") {
        if (!event.data?.uris || event.data.uris.length <= 0) return console.log("Unable to get relevant tracks");
        const uris = event.data.uris
        await addTracksToDatabase(uris)
    }
    // check if its desired event
    else if (event.data.operation === "remove") {
        if (!event.data?.items || event.data.items.length <= 0) return;
        const urisToDelete: TrackUri[] = [];
        for (const track of event.data.items) {
            urisToDelete.push(track.uri);
        }
        if (urisToDelete.length > 0) {
            removeTracksFromDatabase(urisToDelete)
        }
    }
}

/**
 * gets passive deleted tracks when deleting a playlist and removes them from the database and map
 * @param event
 */
export async function playlistEventHandler(event: PlaylistEvent) {
    if (!event?.data?.operation) {
        console.log("Unable to tell event type")
        return
    }
    // check if its desired event
    if (event.data.operation !== "remove") return;
    if (!event.data?.items || event.data.items.length <= 0) {
        console.log("Unable to get relevant playlist");
        return
    }
    const urisToDelete : TrackUri[] = [];
    for (const playlist of event.data.items) {
        await getTracksFromPlaylist(playlist.uri).then((uris : TrackUri[]) => urisToDelete.push(... uris))
    }
    if (urisToDelete.length > 0) {
        removeTracksFromDatabase(urisToDelete.flat())
    }
}

/**
 * get added/ deleted liked tracks and adds/ removes these from the database and map
 * @param event
 */
export async function likedEventHandler(event: LikedEvent) {
    if (!event?.data?.operation) return console.log("Unable to tell event type");
    // check if its desired event
    if (event.data.operation === "add") {
        if (!event.data?.uris || event.data.uris.length <= 0) return console.log("Unable to get relevant tracks");
        const uris = event.data.uris
        await addTracksToDatabase(uris)
    }
    // check if its desired event
    else if (event.data.operation === "remove") {
        if (!event.data?.uris || event.data.uris.length <= 0) return console.log("Unable to get relevant tracks");
        const urisToDelete: TrackUri[] = [];
        for (const uri of event.data.uris) {
            urisToDelete.push(uri);
        }
        if (urisToDelete.length > 0) {
            removeTracksFromDatabase(urisToDelete)
        }
    }
}

/**
 * add tracks to database and map
 * @param uris
 */
export async function addTracksToDatabase(uris: TrackUri[]) {
    if (uris.length <= 0) return
    const urisToAdd: TrackUri[] = []
    for (let i = 0; i <= uris.length - 1; i++) {
        // check if track exists in database and map
        if (counter.has(uris[i])) {
            // increase value of entry in Map
            const value = counter.get(uris[i])
            counter.set(uris[i], value! + 1)
        } else {
            // if it doesn't exist, add track to database and map
            urisToAdd.push(uris[i])
            counter.set(uris[i], 1)
        }
    }
    if (urisToAdd.length > 0) {
        const trackObject = await getTrackObject(urisToAdd)
        // add tracks to db
        if (trackObject) {
            if (trackObject.length >= 1) {
                db.webTracks.bulkAdd(trackObject!)
            }
        }
    }
}

/**
 * remove tracks from database and map
 * @param uris
 */
export function removeTracksFromDatabase(uris: TrackUri[]) {
    if (uris.length <= 0) return
    const urisToRemove: TrackUri[] = []
    for (let i = 0; i <= uris.length - 1; i++) {
        const uri = uris[i]
        // skip if uri isn't in map/ database
        if (!counter.has(uri)) continue
        // if it's last uri entry, remove it
        if (counter.get(uri) === 1) {
            urisToRemove.push(uri)
            counter.delete(uri)
            // if it's not last uri entry, decrease map by one
        } else {
            const value = counter.get(uri)
            counter.set(uri, value! - 1)
        }
    }
    // remove tracks from database
    if (urisToRemove.length > 0) {
        db.webTracks.bulkDelete(urisToRemove)
    }
}