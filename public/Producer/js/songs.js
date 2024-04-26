// get playlist for djs
document.querySelector("#djs").addEventListener("change", async function () {
    let dj = this.value;
    const res = await fetch(`/producer/playlist/${dj}`);
    if (res.ok) {
        location.reload();
    }
});

// add songs to a playlist
async function addSongToPlaylist() {
    const playlistName = prompt('Playlist name:');
    const songName = prompt('Song name:');
    const index = prompt('Order number:');
    if(!playlistName || !songName || !index)
        alert('One or more data was not provided!');
    else {
        const res = await fetch(`/producer/playlist/addsong/${playlistName}/${songName}/${index}`);
        if(res.ok)
            location.reload();
    }
}

// remove song from a playlist
async function removeSongFromPlaylist() {
    const playlistName = prompt('Playlist name:');
    const songName = prompt('Song name:');
    if(!playlistName || !songName)
        alert('One or more data was not provided!');
    else {
        const res = await fetch(`/producer/playlist/removesong/${playlistName}/${songName}`);
        if(res.ok)
            location.reload();
    }
}

// search a song
async function searchSong() {
    const song = document.querySelector("#song").value;
    if(!song)
        alert('Unable to search from empty query!');
    else {
        const res = await fetch(`/producer/search/${song}`);
        if(res.ok)
            location.reload();
    }
}

// reset data
async function reset() {
    const res = await fetch('/producer/reset');
    if(res.ok)
        location.reload();
}