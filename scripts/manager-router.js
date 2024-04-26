import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {Timeslot, Dj, Song, Playlist, Note } from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleAll = (app) => {
  handleDefault(app); 
  handleDateChange(app);
  handleForm(app);
  handleTableDelete(app);
  handleTableUndo(app);
  handleReport(app);   
};

const handleDefault = (app) => {
  app.get("/manager", async (req, res) => {
    // Default to today if no value
    if (req.session.selectedDay == null){
      req.session.selectedDay = new Date();
    }
    const selectedDay = new Date(req.session.selectedDay);

    const dateSplit = selectedDay.toLocaleDateString().split("/");
    const dateValue = dateSplit[2] + "-" + dateSplit[0].padStart(2, "0") 
                    + "-" + dateSplit[1].padStart(2, "0");
    const dateString = selectedDay.toDateString();

    // Set session variables 
    req.session.dateValue = dateValue; 
    req.session.dateString = dateString;
    
    if (req.session.overlap == null){
      req.session.overlap = false;
    }
    if (req.session.validDJ == null){
      req.session.validDJ = true;
    }
    const overlap = req.session.overlap;
    const validDJ = req.session.validDJ;  
    
    // Use the date to get all timeslots for today and store them in time_slots
    let times = await Timeslot.find({tdate: dateValue})
    let time_slots = []
    for (let t of times){
      let djObject = await Dj.find({_id: t.dj});
      let pListObject = await Playlist.find({timeslot: t._id}); 
      
      let slot = {
        start: getDateFromTime(t.start, selectedDay),
        end: getDateFromTime(t.end, selectedDay),
        dj: djObject[0].name,

        tObject: t, 
        pObject: pListObject[0]
      }; 
      time_slots.push(slot); 
    } 
    // Sort time_slots and store in session. 
    sortTimes(time_slots);
    req.session.time_slots = time_slots;

    // Undo stack
    if (!req.session.UNDO){
      req.session.UNDO = []; 
    }

    // Use the date to get all producer notes for today
    let prodNotes = await Note.find({pdate: dateValue});

    // Get the report
    if (!req.session.report){
      req.session.report = []; 
    }
    if (!req.session.reportTitle){
      req.session.reportTitle = "Report"; 
    }
    const report = req.session.report; 
    const reportTitle = req.session.reportTitle; 
    
    // Playlist title
    if (!req.session.playlistTitle){
      req.session.Playlist = null; 
    }
    const playlistTitle = req.session.playlistTitle;

    res.render(join(__dirname, "../views/Manager/manager.ejs") , {
      dateValue: dateValue,
      dateString: dateString,
      time_slots: time_slots,
      overlap: overlap,
      validDJ: validDJ,

      report: report,
      reportTitle: reportTitle,
      playlistTitle: playlistTitle,  

      prodNotes: prodNotes,
    });
    
    // Reset variables. 
    req.session.overlap = false;
    req.session.validDJ = true;  

  });
}

const handleDateChange = (app) => {
  app.post("/manager/newDate", (req, res) => {
    // Get the date obj from the JSON and update values. 
    req.session.selectedDay = new Date(req.body.date);
    
    // Reset times
    req.session.UNDO = []; 
    req.session.overlap = false;
    req.session.validDJ = true; 

    // Reset Report
    req.session.report = [];
    req.session.reportTitle = "Report";
    req.session.playlistTitle = null;  

    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}

const handleForm = (app) => {
  app.post("/manager/form", async (req, res) => {
    let startTime = req.body.start_time; 
    let endTime = req.body.end_time;
    let dj = req.body.DJ;
    let pName = req.body.pName; 

    // Check that the DJ is valid
    let valid = true;
    const foundDjs = await Dj.find({name: new RegExp('^'+dj+"$", "i")}); 
    if (foundDjs.length <= 0){
      valid = false;
      req.session.validDJ = valid;
      res.redirect("/manager");
      return; 
    }
    req.session.validDJ = valid;
    
    const selectedDay = req.session.selectedDay;
    const dateValue = req.session.dateValue;
    const time_slots = req.session.time_slots; 

    // Check for overlaps with other time slots. 
    let overlap = timeOverlap(getDateFromTime(startTime, selectedDay), 
                            getDateFromTime(endTime, selectedDay), 
                            time_slots, selectedDay); 
    
    // No overlap, make the slot
    if (!overlap){ 
      await createEntry(dateValue, startTime, endTime, foundDjs[0]._id, pName, []);
    }
    req.session.overlap = overlap; 

    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}

const handleTableDelete = (app) => {
  app.get("/manager/table/delete/:idx", async (req, res) => {
    // Get the index
    const time_slots = req.session.time_slots;  
    const idx = req.params.idx; 
    const slot = time_slots[idx]; 
    // Store it in the undo list
    req.session.UNDO.push(slot); 
    
    // Remove from the collection
    await Timeslot.deleteOne({_id: slot.tObject._id});
    await Playlist.deleteOne({_id: slot.pObject._id}); 
    
    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}

const handleTableUndo = (app) => {
  app.get("/manager/table/undo", async (req, res) => {
    // Pop from undo and put into time slots.
    if (req.session.UNDO.length != 0){
      let slot = req.session.UNDO.pop();
      let t = slot.tObject;
      let p = slot.pObject;
      const dateValue = req.session.dateValue;  
      // Add back to the collection
      await createEntry(dateValue, t.start, t.end, t.dj, p.name, p.songs);  
    }
    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}

// TO DO: get playlists from collection 
const handleReport = (app) => {
  app.get("/manager/report/:idx", async (req, res) => {
    const idx = req.params.idx; 
    const time_slots = req.session.time_slots;
    const slot = time_slots[idx]; 
    const songs = slot.pObject.songs;  

    let prodSongs = []
    let djSongs = []
    let pCounter = 1;
    let dCounter = 1; 

    for (let item of songs){
      const song = await Song.find({_id: item.song})
      const songTitle = song[0].title; 
      const songArtist = song[0].artist; 
      const songString = songTitle + " by " + songArtist 

      if (item.producer_created){
        prodSongs.push( pCounter + ". " + songString);
        pCounter += 1; 
      }
      if (item.dj_played){
        djSongs.push( dCounter + ". " + songString);
        dCounter += 1
      }
    }
    if (pCounter != dCounter){
      makeSameSize(prodSongs, djSongs); 
    }

    let rep = []
    for (let i=0; i < prodSongs.length; i++){
      rep.push({
        prod: prodSongs[i],
        dj: djSongs[i]
      });
    }
    req.session.report = rep; 

    // Create new title for report 
    const selectedDay = req.session.selectedDay; 
    
    let st = getDateFromTime(slot.tObject.start, selectedDay);
    let et = getDateFromTime(slot.tObject.end, selectedDay);
    st = st.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    et = et.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    req.session.playlistTitle = "Playlist: " + slot.pObject.name; 
    req.session.reportTitle = "Report: " + st + " to " + et;
     

    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}


export default {
  handleAll,
};


/* Helper functions Below */

// Ensure end time is after start time
function getDateFromTime(time, selectedDay){
  let timeSplit = time.split(":");
  let d = new Date(selectedDay); 
  d.setHours(timeSplit[0]);
  d.setMinutes(timeSplit[1]);
  d.setSeconds(0);
  return d; 
}

// Check for overlapping times
function timeOverlap(st_date, et_date, time_slots, selectedDay){
  let overlap = false; 
  for (let slot of time_slots){
    const otherSt = getDateFromTime(slot.tObject.start, selectedDay).getTime();
    const otherEt = getDateFromTime(slot.tObject.end, selectedDay).getTime();
    
    if (st_date.getTime() >= otherSt && st_date.getTime() <= otherEt){
        // Event being added starts during this one
        overlap = true;
    }
    if (et_date.getTime() >= otherSt && et_date.getTime() <= otherEt){
        // Event being added ends during this one
        overlap = true;
    }
    if (otherSt >= st_date.getTime() && otherSt <= et_date.getTime()){
        // Event in table starts during this one
        overlap = true;
    }
    if (otherEt >= st_date.getTime() && otherEt <= et_date.getTime()){
        // Event in table ends during this one
        overlap = true; 
    } 
  }
  return overlap; 
}

// Sort all of the times. 
function sortTimes(time_slots){
  // Use the sort function 
  let sorted = time_slots.sort(function (a, b){
    // Sort by the start times
    let aVal = a.start.getTime(); 
    let bVal = b.start.getTime(); 
    if (aVal > bVal) return 1; 
    else if (bVal > aVal) return -1;
    else return 0; 
  })
  time_slots = sorted; 
}

/* 
Create a Timeslot and Playlist entry. 
The relationship is 1:1 
*/
async function createEntry(dateValue, start, end, djID, pName, pSongs){
  const createdSlot = await Timeslot.create({
    tdate: dateValue, 
    start: start, 
    end: end,
    dj: djID
  }); 
  
  // Make the playlist
  await Playlist.create({
    name: pName, 
    dj: createdSlot.dj, 
    songs: pSongs, 
    timeslot: createdSlot._id
  }); 
}

function makeSameSize(arr1, arr2){
  let l1 = arr1.length;
  let l2 = arr2.length;
  let diff = Math.abs(l1 - l2); 

  if (l1 < l2){
    for (let i=0; i < diff; i++){ 
      arr1.push(""); 
    }
  } else{
      for (let i=0; i < diff; i++){
        arr2.push(""); 
      }
  } 
}