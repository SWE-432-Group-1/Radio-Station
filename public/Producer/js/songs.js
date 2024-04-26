// get playlist for djs
document.querySelector("#djs").addEventListener("change", async function () {
    let dj = this.value;
    const response = await fetch(`/producer/playlist/${dj}`);
    if (response.ok) {
        location.reload();
    }
});

// add songs to playlists
async function addSongToPlaylist() {
    const playlistName = prompt('Playlist name:');
    const songName = prompt('Song name:');
    const index = prompt('Order number:');
    if(!playlistName || !songName || !index)
        alert('One or more data was not provided!');
    else {
        const response = await fetch(`/producer/playlist/addsong/${playlistName}/${songName}/${index}`);
        if(response.ok) {
            location.reload();
        }
    }
}