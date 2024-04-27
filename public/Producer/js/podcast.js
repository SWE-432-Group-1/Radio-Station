// // function for list of podcasts
// function podcastList() {
//     const podcasts = [
//         { name: 'The Chill Podcast', episode: '9', duration: '1hr 30min' },
//         { name: 'Vibe Podcast', episode: '10', duration: '1hr' },
//         { name: 'Bookclub Podcast', episode: '1', duration: '1hr 45min' },
//         { name: 'Therapy Podcast', episode: '12', duration: '1hr 50min' },
//         { name: 'Gamers Podcast', episode: '5', duration: '1hr 30min' },
//         { name: 'Car Guys Podcast', episode: '7', duration: '1hr 35min' },
//         { name: 'Shoe Lovers Podcast', episode: '3', duration: '2hr' },
//     ];
    
//     for(let p of podcasts) {
//         const doc = document.createElement('div');
//         const name = document.createElement('td');
//         const episode = document.createElement('td');
//         const duration = document.createElement('td');
//         name.innerHTML = `<strong>Name</strong>: ${p.name}`;
//         episode.innerHTML = `<strong>Episode</strong>: ${p.episode}`;
//         duration.innerHTML = `<strong>Duration</strong>: ${p.duration}`;
//         doc.appendChild(name);
//         doc.appendChild(episode);
//         doc.appendChild(duration);
//         document.querySelector('#pods').appendChild(doc);
//     }
// }
// // call function
// podcastList();