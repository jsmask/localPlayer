const Store = require("electron-store");
const uuidv4 = require("uuid/v4");
const path = require("path");

class DataStore extends Store {
    constructor(settings) {
        super(settings);
        this.tracks = this.get('tracks') || [];
        this.volume = this.get('volume') || 0.8;
    }
    saveVolume() {
        this.set('volume', this.volume);
        return this;
    }
    getVolume() {
        if(this.get("volume") == 0) return 0;
        return this.get("volume") || 0.8;
    }
    setVolume(n){
        this.volume = Math.min(Math.max(n,0),1);
        return this.saveVolume();
    }
    saveTracks() {
        this.set('tracks', this.tracks);
        return this;
    }
    getTracks() {
        return this.get('tracks') || [];
    }
    addTracks(tracks) {
        const tracksWidthProps = tracks.map(track => {
            return {
                id: uuidv4(),
                path: track,
                fileName: path.basename(track)
            }
        }).filter(track => {
            const currentTracksPath = this.tracks.map(tk => tk.path);
            return !currentTracksPath.includes(track.path);
        });
        this.tracks = [...this.tracks, ...tracksWidthProps];
        return this.saveTracks();
    }
    deleteTracks(id) {
        this.tracks = this.tracks.filter(track => {
            return track.id !== id;
        })
        return this.saveTracks();
    }
}

module.exports = DataStore;
