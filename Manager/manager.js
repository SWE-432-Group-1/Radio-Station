// Query selector function 
function $(selector){
    return document.querySelector(selector); 
}

// Sorts the rows in the times table based on time value. 
function times_sort(){
    const tb = $("#times_table tbody");
    // Get all of the rows
    let trs = tb.rows;
    if (trs.length === 0) return; // Don't do anything if no rows.
    // Convert the HTML Collection into a JS array. 
    let rows = []
    for (let row of trs){
        rows.push(row); 
    } 
    // Use the sort function 
    let sorted = rows.sort(function (a, b){
        // Sort by the start times
        let aVal = a.getElementsByTagName("td")[0].dataset.st; 
        let bVal = b.getElementsByTagName("td")[0].dataset.st; 
        if (aVal > bVal) return 1; 
        else if (bVal > aVal) return -1;
        else return 0; 
    })

    // Remove the rows and append them in the sorted order. 
    rows.forEach((item) => tb.removeChild(item)); 
    sorted.forEach((item) => tb.appendChild(item)); 
}

// Date input changed. 
function date_changed(e){
    // Get the new date value
    const date_box = $("#date_box");
    let value = date_box.valueAsDate;
    value.setTime(value.getTime() + value.getTimezoneOffset()*60000);
    
    // Update the article titles. 
    $("#times_title").innerText = "Bookings: " + value.toDateString();
    $("#report_title").innerText = "Report: " + value.toDateString() ;
    
    // Reset the times table
    UNDO_STACK = [];
    const times_tb = $("#times_table tbody");
    const times_trs = document.querySelectorAll("#times_table tbody tr");
    for (let tr of times_trs){
        times_tb.removeChild(tr); 
    }

    // Reset Report table
    for (let tr of document.querySelectorAll("#report_table tbody tr")){
        $("#report_table tbody").removeChild(tr); 
    }
    $("#report_title").innerText = "Report"; 

    // Update Producer Notes
    $(".producer_notes h3").innerText = "Producer's Notes: " + value.toDateString();
        // Reset notes
    const notes_list = $("#notes_list")
    for (let li of document.querySelectorAll("#notes_list li")){
        notes_list.removeChild(li); 
    }
        // Poulate Producer Notes list with mock data
        // Will use the database once developed.
    for (let note of NOTES){
        if (note.date === date_box.value){
            const li = document.createElement("li");
            li.innerText = "DJ " + note.dj + ": " + note.desc;
            li.style.padding = "1em"; 
            notes_list.appendChild(li);
        } 
    } 
}

// "-" Button Clicked
function minus_btn(e){
    const tr = e.target.parentNode.parentNode;
    const tbody = $("#times_table tbody");
    UNDO_STACK.push(tr); 
    tbody.removeChild(tr); 
}

// UNDO button clicked 
let UNDO_STACK = []; // Global variable 
function onUndo(){
    const tbody = $("#times_table tbody");
    if (UNDO_STACK.length != 0){
        let tr = UNDO_STACK.pop();
        tbody.appendChild(tr);
        times_sort(); // sort the table again 
    }
}

// Report for selected date and time. 
function getReport(e){
    // Update for the selected time
    let time_tr = e.target.parentNode.parentNode;
    let time = time_tr.getElementsByTagName("td")[0].innerText.slice(1); 
    $("#report_title").innerText = "Report: " + time; 

    // Reset report table if needed
    for (let tr of document.querySelectorAll("#report_table tbody tr")){
        $("#report_table tbody").removeChild(tr); 
    }

    // Populate the Report table with mock data.
    // Will use the database once developed. 
    for (let i = 1; i <= 100; i++){
        let song = "song " + i;  
        let report = new Report("Producer " + song, "DJ " + song); 
        report.render(); 
    }
}

// FORM submitted
function onSubmit(e){ 
    if (e !== null){
        e.preventDefault();
    }
    // Validating the form
    /*
        NOTE: 
            - More validation will be done to ensure a proper DJ name once
              the database is developed. 
    */
    const start_time = $("#start_time_box"); 
    const end_time = $("#end_time_box");
    const st_date = start_time.valueAsDate;
    const et_date = end_time.valueAsDate;
    st_date.setTime(st_date.getTime() + st_date.getTimezoneOffset()*60000);
    et_date.setTime(et_date.getTime() + et_date.getTimezoneOffset()*60000);
    const etVal = et_date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const stVal = st_date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    const DJ = $("#DJ_box"); 
    const DJVal = DJ.value; 

    // Reset to no borders 
    start_time.style.border = "0px solid black";
    end_time.style.border = "0px solid black";
    DJ.style.border = "0px solid black"; 

    // Ensure none of the fields are empty
    let empty = false; 
    if (stVal == "" || stVal == null){
        start_time.style.border = "2px solid red";
        empty = true; 
    }
    if (etVal == "" || etVal == null){
        end_time.style.border = "2px solid red";
        empty = true; 
    }
    if (DJVal.trim() == "" || DJVal == null){ 
        DJ.style.border = "2px solid red";
        empty = true; 
    }
    if (empty){
        alert("One or more fields of the form are empty."); 
        return; 
    }

    // Ensure end time is after start time
    if (st_date.getTime() > et_date.getTime()){
        start_time.style.border = "2px solid red";
        end_time.style.border = "2px solid red";
        alert("Start time should be before end time.");
        return; 
    }

    // Check for time slot overlaps
    const tb = $("#times_table tbody");
    let overlap = false; 
    for (let tr of tb.rows){
        const tr_td = tr.getElementsByTagName("td")[0];
        const tr_st = tr_td.dataset.st;
        const tr_et = tr_td.dataset.et;
        if (st_date.getTime() >= tr_st && st_date.getTime() <= tr_et){
            // Event being added starts during this one
            overlap = true; 
        }
        if (et_date.getTime() >= tr_st && et_date.getTime() <= tr_et){
            // Event being added ends during this one
            overlap = true; 
        }
        if (tr_st >= st_date.getTime() && tr_st <= et_date.getTime()){
            // Event in table starts during this one
            overlap = true;
        }
        if (tr_et >= st_date.getTime() && tr_et <= et_date.getTime()){
            // Event in table ends during this one
            overlap = true; 
        }  
    }
    if (overlap){
        start_time.style.border = "2px solid red";
        end_time.style.border = "2px solid red";
        alert("Time slot overlaps with a booked one.");
        return; 
    }

    // After validating, add the entry to the table. 
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td"); 
    const btn = document.createElement("button");
    const btn2 = document.createElement("button"); 
    const time_text_string = " " + stVal + " to " + etVal;
    const time_text = document.createTextNode(time_text_string); 
    const DJ_text = document.createTextNode(DJVal); 
        // Delete Button
    btn.innerText = "-";
    btn.addEventListener("click", minus_btn);
        // View Report button
    btn2.innerText = "Report";
    btn2.style.marginRight = "2em"; 
    btn2.padding = "1em";
    btn2.addEventListener("click", getReport); 
        // Create first table data
    td1.appendChild(btn);
    td1.appendChild(time_text);
    td1.dataset.st = st_date.getTime();  // store date times
    td1.dataset.et = et_date.getTime(); 
        // Create second table data
    td2.appendChild(btn2); 
    td2.appendChild(DJ_text);    
        // Append to table. 
    tr.appendChild(td1);
    tr.appendChild(td2);
    tb.appendChild(tr); 

    // Sort the table
    times_sort(); 

    // Reset the form after it's been submitted.
    $("#times_form").reset(); 
}

// Main function called when document is loaded. 
function main(){
    const date_box = $("#date_box"); 
    date_box.addEventListener("change", date_changed); 
    
    // Set today as the default date.
    const date = new Date(); 
    date_box.valueAsDate = new Date(date.getTime() - date.getTimezoneOffset()*60000);
    date_changed(); 
    
    // Form validation event 
    const form = $("#times_form"); 
    form.addEventListener("submit", onSubmit);
}

document.addEventListener("DOMContentLoaded", main);

// When the user presses "U" it will undo a deletion from the times table.
document.addEventListener("keypress", (e) => {
    if (e.key == "u"){
        onUndo(); 
    }
});

// Creating mock data for the Report and Producer Notes
class Report{
    constructor(assigned, played){
        this.assigned = assigned;
        this.played = played; 
    }
    
    render(){
        const tb = $("#report_table tbody");
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        const td2 = document.createElement("td");
        td1.innerText = this.assigned;
        td2.innerText = this.played;
        tr.appendChild(td1);
        tr.appendChild(td2);
        tb.appendChild(tr);  
    }
}

const NOTES = [
    {
        dj: "Frank",
        date: "2024-03-11", 
        desc: "The DJ did not show up!"
    },
    {
        dj: "Pete",
        date: "2024-03-11",
        desc: "He's a fun guy, we should try to book him for more times."
    },
    {
        dj: "Bob",
        date: "2024-03-12",
        desc: "The DJ was 10 minutes late and I had to stall the crowd."
    },
    {
        dj: "Billy",
        date: "2024-03-12",
        desc: "This guy was amazing, he played all the right songs!" 
    }
];
