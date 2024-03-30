function DJ(name, experience, availability) {
    this.name = name;
    this.experience = experience;
    this.availability = availability;
}

var djNamesList = [];

// function to book a dj
function bookDJ(djName, djAvailability) {
    let num = 0;
    for (let dj of djNamesList) {
        num += 1;
        if (dj === djName) {
            const doc = document.createElement('option');
            doc.value = `dj${num}`;
            doc.textContent = dj;
            document.querySelector("#djs").appendChild(doc);
            alert(`${dj} has been booked on ${djAvailability}!`);
        }
    }
}

// list of djs that can be booked
function djList() {
    const djs = [
        { name: "John Smith", experience: "7 yrs", availability: "Mon 8am - 5pm" },
        { name: "John Doe", experience: "2 yrs", availability: "Fri 10am - 3pm" },
        { name: "Jane Doe", experience: "1 yrs", availability: "Wed 11am - 2pm" },
        { name: "Joe Joe", experience: "0 yrs", availability: "Tue 10am - 12pm" },
        { name: "Jack Smith", experience: "10 yrs", availability: "Thu 7am - 7pm" },
    ];

    for (let d of djs) {
        const person = new DJ(d.name, d.experience, d.availability);
        const doc = document.createElement('tr');
        const button = document.createElement('td');
        const djName = document.createElement('td');
        const djExperience = document.createElement('td');
        const djAvailability = document.createElement('td');
        djName.innerHTML = `<strong>Name</strong>: ${person.name}`;
        djExperience.innerHTML = `<strong>Experience</strong>: ${person.experience}`;
        djAvailability.innerHTML = `<strong>Availability</strong>: ${person.availability}`;
        djNamesList.push(person.name);
        button.onclick = function () { bookDJ(person.name, person.availability) };
        button.textContent = "Book";
        doc.appendChild(djName);
        doc.appendChild(djExperience);
        doc.appendChild(djAvailability);
        doc.appendChild(button);
        document.querySelector("#dj-names").appendChild(doc);
    }
}

// list of songs for a dj
function songsListDJ1() {
    const songs = [
        { name: 'Valor', artist: 'scRem' },
        { name: 'Pearl', artist: 'Jonna' },
        { name: "Good ol' days", artist: 'Ollie Wood' },
        { name: 'Easy out', artist: 'Jack Man' },
        { name: 'Lost', artist: 'Paralysis' },
        { name: 'Hands Down', artist: 'G.O.A.T' },
        { name: 'Chime in', artist: 'Kelly Rose' },
        { name: 'Peace', artist: 'Z' },
        { name: 'Journey', artist: 'Grace Holt' },
    ];

    for (let s of songs) {
        const doc = document.createElement('tr');
        const name = document.createElement('td');
        const artist = document.createElement('td');
        name.innerHTML = `<strong>Name</strong>: ${s.name}`;
        artist.innerHTML = `<strong>Artist</strong>: ${s.artist}`;
        doc.appendChild(name);
        doc.appendChild(artist);
        document.querySelector('#song-names').appendChild(doc);
    }
}

// list of songs for a dj
function songsListDJ2() {
    const songs = [
        { name: 'Good vibes', artist: 'Heaven' },
        { name: 'Chained', artist: 'Past' },
        { name: 'Beyond Reason', artist: 'Maggie C.' },
        { name: 'Denial', artist: 'toxic' },
        { name: 'Grove and Move', artist: 'AJ' },
        { name: 'Jokes on YOU', artist: 'mANIAC' },
        { name: 'Despair and Darkness', artist: 'hopeless' },
        { name: 'Time of your life', artist: 'Blank' },
        { name: 'Free of Charge', artist: '$oney' },
    ];

    for (let s of songs) {
        const doc = document.createElement('tr');
        const name = document.createElement('td');
        const artist = document.createElement('td');
        name.innerHTML = `<strong>Name</strong>: ${s.name}`;
        artist.innerHTML = `<strong>Artist</strong>: ${s.artist}`;
        doc.appendChild(name);
        doc.appendChild(artist);
        document.querySelector('#song-names').appendChild(doc);
    }
}

// a default list of songs for dj
function defaultList() {
    const songs = [
        { name: 'Vibin', artist: 'Joe Smith' },
        { name: 'Back to back', artist: 'Jim Jones' },
        { name: 'Ghosted', artist: 'Polly Grace' },
        { name: 'Golden Dust', artist: 'Shiny' },
        { name: 'Whispers', artist: 'Paranoia' },
        { name: 'Our Galaxy', artist: 'Cosmos' },
        { name: 'Dreamy', artist: 'Andy A.' },
        { name: 'Vast Landscape', artist: 'Hustler' },
        { name: 'Night thoughts', artist: 'Y' },
    ];

    for (let s of songs) {
        const doc = document.createElement('tr');
        const name = document.createElement('td');
        const artist = document.createElement('td');
        name.innerHTML = `<strong>Name</strong>: ${s.name}`;
        artist.innerHTML = `<strong>Artist</strong>: ${s.artist}`;
        doc.appendChild(name);
        doc.appendChild(artist);
        document.querySelector('#song-names').appendChild(doc);
    }
}

// logic for list of songs
document.querySelector("#djs").addEventListener("change", function () {
    let dj = this.value;
    if (dj === "dj1") {
        document.querySelector('#song-names').innerHTML = "";
        songsListDJ1();
    }
    else if (dj === "dj2") {
        document.querySelector('#song-names').innerHTML = "";
        songsListDJ2();
    }
    else {
        document.querySelector('#song-names').innerHTML = "";
        defaultList();
    }
    // else if (dj != "dj1" && dj != "dj2") {
    //     document.querySelector('#song-names').innerHTML = "";
    //     defaultList();
    // }
});
// call function
// defaultList();
djList();