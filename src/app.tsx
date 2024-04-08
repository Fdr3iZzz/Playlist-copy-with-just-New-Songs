import {likedEventHandler, playlistEventHandler, trackEventHandler} from "./listener.js";
import {resyncDatabaseAndMap} from "./database.js";
import {Settings} from "./settings.js";
import {contextMenu} from "./helperFunctions.js";

async function main() {
    // wait for the ability to show messages
    while (!Spicetify?.showNotification) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Show welcome message
    const settings = new Settings();
    settings.initializeSettings()
    if (settings.isWelcomeUserToggled()) {
        Spicetify.showNotification(`Hello ${settings.getWelcomeUserName()}, welcome back <3`);
    }
    // wait for everything necessary to loaded
    while (!Spicetify?.Platform?.PlaylistAPI?.getPlaylist) {
        // @ts-ignore
        await new Promise(res => Spicetify.Events.platformLoaded.on(res))
    }
    await resyncDatabaseAndMap()
    contextMenu.register()
    // register event listener for adding/ removing songs
    Spicetify.Platform.PlaylistAPI.getEvents().addListener("operation_complete", trackEventHandler);
    Spicetify.Platform.RootlistAPI.getEvents().addListener("operation_complete", playlistEventHandler);
    Spicetify.Platform.LibraryAPI.getEvents().addListener("operation_complete", likedEventHandler);
}

export default main;
