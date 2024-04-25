import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import {Timeslot, Dj, Song, Playlist, Note } from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ObjectId = mongoose.Types.ObjectId;

/* All these global variables should become session variables! */

// Date object for the selected day 
var selectedDay = null;
var dateValue = null; 
var dateString = null;  

// List of slot objects. {start, end, dj}.  
var time_slots = [];
var overlap = false; 

// Undo Stack
var UNDO = [];

// Report Table
var report = [];
var reportTitle = "Report"; 

// Whether the DJ was found or not. 
var validDJ = true; 

// List of producer notes
var prodNotes = [
  {
    prod: "Frank",
    comment: "The DJ did not show up!"
  },
  {
    prod: "Pete",
    comment: "He's a fun guy, we should try to book him for more times."
  },
]

/* End session variables */ 

const handleAll = (app) => {
  // Pass the db into each and update each method to use DB. 
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
    if (selectedDay == null){
      selectedDay = new Date();
    }
    dateValue = selectedDay.toLocaleDateString().split("/");
    dateValue = dateValue[2] + "-" + dateValue[0].padStart(2, "0") 
                    + "-" + dateValue[1].padStart(2, "0");

    dateString = selectedDay.toDateString();
    
    // Use the date to get all timeslots for today and store them in time_slots
    let times = await Timeslot.find({tdate: dateValue})
    time_slots = []
    for (let t of times){
      let djObject = await Dj.find({_id: t.dj});
      let slot = {
        start: getDateFromTime(t.start),
        end: getDateFromTime(t.end),
        dj: djObject[0].name,

        _id: t._id,
        startString: t.start,
        endString: t.end,
        dj_id: t.dj
      }; 
      time_slots.push(slot); 
    } 
    // Sort time_slots. 
    sortTimes(); 


    // Use the date to get all producer notes for today
    prodNotes = await Note.find({pdate: dateValue});

    
    res.render(join(__dirname, "../views/Manager/manager.ejs") , {
      dateValue: dateValue,
      dateString: dateString,
      time_slots: time_slots,
      overlap: overlap,
      validDJ: validDJ,

      report: report,
      reportTitle: reportTitle, 

      prodNotes: prodNotes,
    });
    
    // Reset variables. 
    overlap = false; 
    validDJ = true; 

  });
}

const handleDateChange = (app) => {
  app.post("/manager/newDate", (req, res) => {
    // Get the date obj from the JSON and update values. 
    selectedDay = new Date(req.body.date);
    
    // Reset times
    time_slots = [];
    UNDO = []; 
    overlap = false;
    validDJ = true; 

    // Reset Producer Notes
    prodNotes = [];

    // Reset Report
    report = [];
    reportTitle = "Report"; 

    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}

const handleForm = (app) => {
  app.post("/manager/form", async (req, res) => {
    let startTime = req.body.start_time; 
    let endTime = req.body.end_time;
    let dj = req.body.DJ; 

    // Check that the DJ is valid
    validDJ = true;
    const foundDJs = await Dj.find({name: new RegExp('^'+dj+"$", "i")}); 
    if (foundDJs.length <= 0){
      validDJ = false;
      res.redirect("/manager");
      return; 
    }

    // If valid DJ, keep checking.  
    let startTimeDate = getDateFromTime(startTime);
    let endTimeDate = getDateFromTime(endTime); 
    
    // Check for overlaps with other time slots. 
    overlap = timeOverlap(startTimeDate, endTimeDate); 
    
    if (!overlap){ 
      // No overlap, make the slot
      const slot = {
        tdate: dateValue, 
        start: startTime, 
        end: endTime,
        dj: foundDJs[0]._id
      };
      // Add it to the data base
      await Timeslot.create(slot); 
    }

    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}

const handleTableDelete = (app) => {
  app.get("/manager/table/delete/:idx", async (req, res) => {
    // Get the index 
    const idx = req.params.idx; 
    const slot = time_slots[idx]; 
    // Store it in the undo list
    UNDO.push(slot); 
    
    // Remove from the collection
    await Timeslot.deleteOne({_id: slot._id}); 
    
    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}

const handleTableUndo = (app) => {
  app.get("/manager/table/undo", async (req, res) => {
    // Pop from undo and put into time slots.
    if (UNDO.length != 0){
      let slot = UNDO.pop();
      // Add back to the collection
      await Timeslot.create({
        tdate: dateValue,
        start: slot.startString,
        end: slot.endString,
        dj: slot.dj_id
      }); 
    }
    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}

const handleReport = (app) => {
  app.get("/manager/report/:idx", (req, res) => {
    const idx = req.params.idx; 

    // Mock Data: Instead, get the report from the database
    report = [];
    for (let i = 0; i < 101; i++){
      report.push({
        prod: "Producer Song " + i, 
        dj: "DJ Song " + i
      })
    }

    // Fix title
    let st = time_slots[idx].start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    let et = time_slots[idx].end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    reportTitle = "Report: " + st + " to " + et; 

    // Redirect to the manager page. 
    res.redirect("/manager"); 
  });
}


export default {
  handleAll,
};






/* Helper functions Below */


// Ensure end time is after start time
 
function getDateFromTime(time){
  let timeSplit = time.split(":");
  let d = new Date(selectedDay); 
  d.setHours(timeSplit[0]);
  d.setMinutes(timeSplit[1]);
  d.setSeconds(0);
  return d; 
}

// Check for overlapping times
function timeOverlap(st_date, et_date){
  let overlap = false; 
  for (let slot of time_slots){
    const otherSt = slot.start.getTime();
    const otherEt = slot.end.getTime();
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
function sortTimes(){
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

/* Creating Mock Data Below 

const prodNotes = [
  {
      prod: "Frank",
      comment: "The DJ did not show up!"
  },
  {
      prod: "Pete",
      comment: "He's a fun guy, we should try to book him for more times."
  },
  {
      prod: "Bob",
      comment: "The DJ was 10 minutes late and I had to stall the crowd."
  },
  {
      prod: "Billy",
      comment: "This guy was amazing, he played all the right songs!" 
  }
];
*/ 
