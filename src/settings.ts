import {SettingsSection} from "spcr-settings";
import {resyncDatabaseAndMap} from "./database.js";


enum Setting {
    welcomeUserToggle = "welcome-user-toggle",
    welcomeUserName = "welcome-user-name",
    playlistDescription = "playlist-description",
    folderName = "folder-name",
    selfOwnedToggle = "self-owned-toggle"
}

/**
 * create custom settings to get user defined settings
 */
export class Settings {
    settings = new SettingsSection("Filter known tracks", "filter-known-tracks-settings");

    /**
     * create all settings items
     */
    initializeSettings() {
        // welcome message
        this.settings.addToggle(Setting.welcomeUserToggle, "Cute little welcome message", false);
        this.settings.addInput(Setting.welcomeUserName, "Name for the welcome message", "Your Name");
        // playlist description
        const defaultValue = "Original playlist from: {creatorName} | Playlist created via a Spicetify extension developed by Franz3"
        this.settings.addInput(Setting.playlistDescription, "Description of the playlist created", defaultValue);
        // folder name
        this.settings.addInput(Setting.folderName, "Name of the folder where playlists will be saved in", "New Songs");
        // self owned playlists
        this.settings.addToggle(Setting.selfOwnedToggle, "Filter to only count self-owned playlists rather then the whole library (needs a restart or database resynchronization)", true);
        // resync on demand
        this.settings.addButton("resync", "Manually resynchronize the database", "Resynchronize Database", () => {
            resyncDatabaseAndMap().then().catch(error => {
                console.error("Error while manually resynchronizing the database: ", error)
            });
        });
        // save settings
        this.saveSettings()
        this.settings.rerender()
        // format broken button correctly
        const observer = new MutationObserver(function (mutationsList, observer) {
            for (const mutation of mutationsList) {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    if (document.getElementById("filter-known-tracks-settings.resync")) {
                        applyClassesToButton()
                        // observer.disconnect()
                        break
                    }
                }
            }
        })
        observer.observe(document.body, {childList: true, subtree: true});
        this.settings.rerender()
    }

    /**
     * save the settings structure after creating it
     */
    saveSettings() {
        this.settings.pushSettings().then().catch(error => {
            console.error("Error saving the Settings: ", error)
        })
    }

    /**
     * check if user wants a welcome message
     * @returns boolean
     */
    isWelcomeUserToggled() {
        return this.settings.getFieldValue(Setting.welcomeUserToggle) as boolean
    }

    /**
     * get the username for welcome message
     * @returns userName
     */
    getWelcomeUserName() {
        return this.settings.getFieldValue(Setting.welcomeUserName) as string
    }

    /**
     * get text that will be the description of the newly created playlist
     * {creatorName} being a placeholder for the artistName passed
     * @param artistName
     * @returns playlistDescription
     */
    getPlaylistDescription(artistName: string) {
        const description = this.settings.getFieldValue(Setting.playlistDescription) as string
        return description.replace("{creatorName}", artistName)
    }

    /**
     * get name of folder where playlists get saved to
     * @returns folderName
     */
    getFolderName() {
        return this.settings.getFieldValue(Setting.folderName) as string
    }

    /**
     * check if user wants to only compare to self owned playlists
     * @returns boolean
     */
    isSelfOwnedToggled() {
        return this.settings.getFieldValue(Setting.selfOwnedToggle) as boolean
    }
}

/**
 * sets the correct classes to fix the css for buttons
 */
function applyClassesToButton() {
    const newClasses = "Button-sc-y0gtbx-0 Button-small-buttonSecondary-useBrowserDefaultFocusStyle x-settings-button";
    const button = document.getElementById('filter-known-tracks-settings.resync') as HTMLElement;
    if (button) {
        button.className = newClasses;
        button.setAttribute("data-encore-id", "buttonSecondary")
    }
}