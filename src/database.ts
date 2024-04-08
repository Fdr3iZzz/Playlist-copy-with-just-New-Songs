import Dexie, {Table} from "dexie";
import {getTrackObject} from "./helperFunctions.js";
import {getAllLocalTracks} from "./getInitialTracks.js";
import {TrackObject, TrackUri} from "./types.js";

/**
 * indexedDB storing track objects with uri as index
 */
export const db = new (class extends Dexie {
    webTracks!: Table<TrackObject>

    constructor() {
        super("library-data")
        this.version(1).stores({
            webTracks: "&uri, isrc, name, artist, duration",
        })
    }
})()


/**
 * resync indexedDB database and map where both get updated to represent the local library
 * this is needed for when the user makes changes to the library while this extension is not running
 */
export async function resyncDatabaseAndMap(): Promise<void> {
    Spicetify.showNotification("ReSync started")
    const urisToSync: TrackUri[] = await getAllLocalTracks()
    counter.clear()
    initializeCounter(urisToSync)
    const allDatabaseTrackObjects = await db.webTracks.toArray()
    const allDatabaseUris: TrackUri[] = []
    allDatabaseTrackObjects.forEach((trackObject: TrackObject) => allDatabaseUris.push(trackObject.uri))
    // remove tracks that are not in map but that are in database
    for (const uriFromDatabase of allDatabaseUris) {
        if (!counter.has(uriFromDatabase)) {
            await db.webTracks.delete(uriFromDatabase)
        }
    }
    const urisToAdd: TrackUri[] = []
    // add tracks that are in map but not in database
    for (const localUri of counter.keys()) {
        // skip tracks that are in map and database
        if (allDatabaseUris.includes(localUri)) continue
        urisToAdd.push(localUri)
    }
    // add Tracks to database
    const trackObjects = await getTrackObject(urisToAdd)
    if (trackObjects && trackObjects.length >= 1) {
        await db.webTracks.bulkAdd(trackObjects)
    }
    Spicetify.showNotification("ReSync complete")
    console.log("ReSync complete")
}

/**
 * counter to store amount of times a track is in local library/ database
 */
// TODO Extract into Wrapper/Utils
export const counter = new Map<TrackUri, number>()

/**
 * initialize counter to represent the local state ob the users library
 * @param urisToSync as Array
 */
function initializeCounter(urisToSync: TrackUri[]) {
    if (urisToSync.length <= 0) return
    for (const uri of urisToSync) {
        if (!uri) continue
        // check if already exists
        if (counter.has(uri)) {
            const value = counter.get(uri)
            counter.set(uri, value! + 1)
        } else {
            counter.set(uri, 1)
        }
    }
}