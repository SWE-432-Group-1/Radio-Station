// Query selector function 
function $(selector){
    return document.querySelector(selector); 
}

// Date input changed. 
async function date_changed(e){
    // Get the new date value
    const date_box = $("#date_box");
    let value = date_box.valueAsDate;
    value.setTime(value.getTime() + value.getTimezoneOffset()*60000); 

    // Pass this to the back end
    const resp = await fetch("/manager/newDate", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Set content type to JSON
        },
        body: JSON.stringify({date: value})
    });

    // Reload the page if it posted correctly. 
    if (resp.ok){
        location.reload(); 
    }
}

// "-" Button Clicked
async function minus_btn(e){
    const idx = e.target.dataset.idx; 
    // Pass this to the back end
    const resp = await fetch("/manager/table/delete/" + idx);
    if (resp.ok){
        location.reload(); 
    }
}

// UNDO button clicked 
async function onUndo(){
    // Pass this to the back end
    const resp = await fetch("/manager/table/undo");
    if (resp.ok){
        location.reload(); 
    }
}

// Report for selected date and time. 
async function getReport(e){
    const idx = e.target.dataset.idx; 
    // Pass this to the back end
    const resp = await fetch("/manager/report/" + idx);
    if (resp.ok){
        location.reload(); 
    } 
}

// FORM submitted
function onSubmit(e){ 
    if (e !== null){
        e.preventDefault();
    }
    // Validating the form on client side.

    const start_time = $("#start_time_box"); 
    const end_time = $("#end_time_box");

    const st_date = start_time.valueAsDate;
    const et_date = end_time.valueAsDate;

    let stVal = start_time.value;
    let etVal = end_time.value; 

    const DJ = $("#DJ_box"); 
    const DJVal = DJ.value; 

    const playlist = $("#playlist_box");
    const playlistVal = playlist.value; 

    // Reset to no borders 
    start_time.style.border = "0px solid black";
    end_time.style.border = "0px solid black";
    DJ.style.border = "0px solid black"; 
    playlist.style.border = "0px solid black";

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
    if (playlistVal.trim() == "" || playlistVal == null){
        playlist.style.border = "2px solid red";
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

    // Send to back end for more validation.
    $("#times_form").submit(); 
}

// When the user presses "U" it will undo a deletion from the times table.
document.addEventListener("keypress", (e) => {
    if (e.key == "u"){
        onUndo(); 
    }
});

// Exit session function. 
async function onExit(){
    await fetch("/manager/exit");
}

// Main function called when document is loaded. 
function main(){
    // Add change event to date box. 
    const date_box = $("#date_box"); 
    date_box.addEventListener("change", date_changed); 
    
    // Form validation event 
    const form = $("#times_form"); 
    form.addEventListener("submit", onSubmit);

    // Exit button
    const btnExit = $("#btnUser");
    btnExit.addEventListener("click", onExit); 
}

document.addEventListener("DOMContentLoaded", main);
