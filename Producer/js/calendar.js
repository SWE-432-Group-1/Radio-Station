// function to create calendar
function calendarDates() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
        '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26',
        '27', '28', '29']
    
    for(let d of days) {
        const doc = document.createElement('div');
        doc.innerHTML = d;
        document.querySelector('#calendar-body').appendChild(doc);
    }
}
// call function
calendarDates();