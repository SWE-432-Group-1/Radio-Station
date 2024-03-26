const createDraggableTable = (table_id) => {
  "use strict";

  const table = document.getElementById(table_id);
  const tbody = table.querySelector("tbody");
  const titles = table.querySelectorAll("tr > th");
  const numberColumnIndex = Array.from(titles).findIndex(
    (el) => el.id === "number_column"
  );

  let selected_row = null,
    dragged_element = null,
    mouse_click_y = 0,
    last_mouse_y = 0,
    currently_dragging = false;
  let rows = [];

  const init = () => {
    createMouseEventListeners();
    rows = queryForRows();
  };

  const createMouseEventListeners = () => {
    document.addEventListener("mousedown", (e) => {
      if (e.button != 0) return true;

      const target = getTargetRow(e.target);
      if (!target) {
        return;
      }

      selected_row = target;
      addDraggableRow(target);

      selected_row.classList.add("is-dragging");

      mouse_click_y = e.clientY;
      currently_dragging = true;
    });

    document.addEventListener("mousemove", (e) => {
      if (!currently_dragging) return;

      last_mouse_y = e.clientY - mouse_click_y;

      dragRow(last_mouse_y);
    });

    document.addEventListener("mouseup", (_e) => {
      if (!currently_dragging) return;

      selected_row.classList.remove("is-dragging");
      table.removeChild(dragged_element);

      dragged_element = null;
      currently_dragging = false;
      rows = queryForRows();
      fixNumberColumn();
    });
  };

  const swapRow = (swap_row, i) => {
    const selected_index = Array.from(tbody.children).indexOf(selected_row),
      r1 = selected_index > i ? selected_row : swap_row,
      r2 = selected_index > i ? swap_row : selected_row;

    tbody.insertBefore(r1, r2);
    rows = queryForRows();
  };

  const dragRow = (y) => {
    dragged_element.style.transform = "translate3d(0, " + y + "px, 0)";

    const drag_position = dragged_element.getBoundingClientRect(),
      drag_bot = drag_position.y,
      drag_top = drag_bot + drag_position.height;

    for (let i = 0; i < rows.length; i++) {
      const el = rows[i],
        r_position = el.getBoundingClientRect(),
        r_bot = r_position.y,
        r_top = r_bot + r_position.height;

      if (
        linesIntersect(drag_bot, drag_top, r_bot, r_top) &&
        selected_row !== el
      ) {
        if (Math.abs(drag_bot - r_bot) < r_position.height / 2) {
          swapRow(el, i);
          break;
        }
      }
    }
  };

  const addDraggableRow = (target) => {
    dragged_element = target.cloneNode(true);
    dragged_element.classList.add("draggable-table__drag");

    const cloneStyle = (src, tgt, prop) => {
      tgt.style[prop] = src.style[prop];
    };

    cloneStyle(target, dragged_element, "height");

    for (let i = 0; i < target.children.length; i++) {
      const oldTD = target.children[i],
        newTD = dragged_element.children[i];

      ["width", "height", "padding", "margin"].forEach((style) =>
        cloneStyle(oldTD, newTD, style)
      );
    }

    table.appendChild(dragged_element);

    const target_position = target.getBoundingClientRect(),
      dragged_position = dragged_element.getBoundingClientRect();
    dragged_element.style.bottom =
      dragged_position.y - target_position.y + "px";
    dragged_element.style.left = "-1px";
  };

  const queryForRows = () => {
    return table.querySelectorAll(`table#${table_id} tbody tr:has(td)`);
  };

  const getTargetRow = (target) => {
    const elemName = target.tagName.toLowerCase();
    const parentName = target.parentElement.tagName.toLowerCase();

    if (elemName !== "svg" || parentName !== "td") return;

    return target.closest("tr");
  };

  const linesIntersect = (b0, t0, b1, t1) => {
    return (
      Math.max(b0, t0) >= Math.min(b1, t1) &&
      Math.min(b0, t0) <= Math.max(b1, t1)
    );
  };

  const fixNumberColumn = () => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const numberColumn = row.children[numberColumnIndex];
      numberColumn.textContent = i + 1;
    }
  };

  init();
};

createDraggableTable("playlist_table");
