const hamburgerHTML = `
<svg
  width="20px"
  height="20px"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  style="cursor: pointer; select: none"
>
  <path
    d="M4 18L20 18"
    stroke="#000000"
    stroke-width="2"
    stroke-linecap="round"
  />
  <path
    d="M4 12L20 12"
    stroke="#000000"
    stroke-width="2"
    stroke-linecap="round"
  />
  <path
    d="M4 6L20 6"
    stroke="#000000"
    stroke-width="2"
    stroke-linecap="round"
  />
</svg>`;

/**
 * @typedef {Object} Song
 * @property {string} title
 * @property {string} producer
 *
 * @param {Song} rows
 */
const generatePlaylistRows = (rows) => {
  const table = document.getElementById("playlist_table");

  const tbody = table.querySelector("tbody");

  const existingRows = tbody.querySelectorAll("tr:not(:has(th))");
  existingRows.forEach((row) => {
    row.remove();
  });

  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    const hamburgerTD = document.createElement("td");
    hamburgerTD.innerHTML = hamburgerHTML;
    tr.appendChild(hamburgerTD);

    const numberTD = document.createElement("td");
    numberTD.textContent = index + 1;
    tr.appendChild(numberTD);

    const titleTD = document.createElement("td");
    titleTD.textContent = row.title;
    tr.appendChild(titleTD);

    const producerTD = document.createElement("td");
    producerTD.textContent = row.producer;
    tr.appendChild(producerTD);

    tbody.appendChild(tr);
    const configureButtonTD = document.createElement("td");
    const configureButton = document.createElement("button");
    configureButton.innerHTML = "&#9881;";
    configureButtonTD.appendChild(configureButton);

    // I miss components ;(
    const configurationDialog = document.createElement("dialog");
    const configurationForm = document.createElement("form");
    configurationForm.style.display = "flex";
    configurationForm.style.flexDirection = "column";

    const configurationLabel = document.createElement("label");
    configurationLabel.textContent = "Title";
    const configurationInput = document.createElement("input");
    configurationInput.type = "text";
    configurationInput.value = row.title;
    const configurationMenu = document.createElement("menu");
    configurationMenu.type = "toolbar";

    const configurationDelete = document.createElement("button");
    configurationDelete.textContent = "Delete";
    configurationDelete.onclick = () => {
      tr.remove();
      configurationDialog.close();
    };
    const configurationSubmit = document.createElement("button");
    configurationSubmit.textContent = "Save";
    configurationSubmit.onclick = (e) => {
      e.preventDefault();
      if (configurationInput.value.length === 0) {
        alert("Title cannot be empty");
        return;
      }
      row.title = configurationInput.value;
      titleTD.textContent = configurationInput.value;
      configurationDialog.close();
    };
    configurationSubmit.style.marginLeft = "2px";
    configurationMenu.appendChild(configurationDelete);
    configurationMenu.appendChild(configurationSubmit);

    configurationForm.appendChild(configurationLabel);
    configurationForm.appendChild(configurationInput);
    configurationForm.appendChild(configurationMenu);
    configurationDialog.appendChild(configurationForm);
    configureButtonTD.appendChild(configurationDialog);
    configureButton.onclick = () => {
      configurationDialog.showModal();
    };

    tr.appendChild(configureButtonTD);
  });
};

/**
 * @typedef {Object} Timeslot
 * @property {Date} date
 * @property {number} start_time
 * @property {number} end_time
 * @property {Array<Song>} playlistRows
 * @property {bool} selected
 *
 * @param {Timeslot} items
 */
const generateTimeslotList = (items) => {
  const list = document.getElementById("timeslot_list");

  items.forEach((item, index) => {
    const li = document.createElement("li");

    const id = `timeslot_${index}`;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "timeslot";
    input.id = id;
    input.value = item.id;
    input.addEventListener("click", () => {
      generatePlaylistRows(item.playlistRows);
    });

    if (item.selected) {
      input.checked = true;
      generatePlaylistRows(item.playlistRows);
    }

    const label = document.createElement("label");
    label.for = id;
    label.textContent = `${item.date} ${item.start_time} - ${item.end_time}`;

    li.appendChild(input);
    li.appendChild(label);

    list.appendChild(li);
  });
};

const playlistRows = [
  { title: "Song 1", producer: "Producer 1" },
  { title: "Song 2", producer: "Producer 2" },
  { title: "Song 3", producer: "Producer 3" },
  { title: "Song 4", producer: "Producer 4" },
  { title: "Song 5", producer: "Producer 5" },
];

const timeslotList = [
  {
    id: 1,
    date: "1969-01-01",
    start_time: "10:00",
    end_time: "11:00",
    playlistRows: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (10am)`,
    })),
    selected: true,
  },
  {
    id: 2,
    date: "1969-01-01",
    start_time: "11:00",
    end_time: "12:00",
    playlistRows: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (11am)`,
    })),
    selected: false,
  },
  {
    id: 3,
    date: "1969-01-01",
    start_time: "12:00",
    end_time: "13:00",
    playlistRows: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (12pm)`,
    })),
    selected: false,
  },
  {
    id: 4,
    date: "1969-01-01",
    start_time: "13:00",
    end_time: "14:00",
    playlistRows: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (1pm)`,
    })),
    selected: false,
  },
  {
    id: 5,
    date: "1969-01-01",
    start_time: "14:00",
    end_time: "15:00",
    playlistRows: playlistRows.map((row) => ({
      ...row,
      title: `${row.title} (2pm)`,
    })),
    selected: false,
  },
];

generateTimeslotList(timeslotList);

const getMessageOfDay = () => {
  const motd = "MOTD Dynamic!";

  return motd;
};

const setMOTDElement = () => {
  const motd = getMessageOfDay();
  const motdElement = document.getElementById("motd");
  motdElement.textContent = motd;
};

setMOTDElement();
