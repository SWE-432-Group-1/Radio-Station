const createDraggableTable = (table_id) => {
  "use strict";

  const table = document.getElementById(table_id);
  const tbody = table.querySelector("tbody");
  const titles = table.querySelectorAll("tr > th");
  const numberColumnIndex = Array.from(titles).findIndex(
    (el) => el.id === "number_column"
  );

  let currRow = null,
    dragElem = null,
    mouseDownY = 0,
    mouseY = 0,
    mouseDrag = false;
  let rows = [];

  const init = () => {
    bindMouse();
    rows = getRows();
  };

  const bindMouse = () => {
    document.addEventListener("mousedown", (event) => {
      if (event.button != 0) return true;

      const target = getTargetRow(event.target);
      if (!target) {
        return;
      }

      currRow = target;
      addDraggableRow(target);

      currRow.classList.add("is-dragging");

      mouseDownY = event.clientY;
      mouseDrag = true;
    });

    document.addEventListener("mousemove", (event) => {
      if (!mouseDrag) return;

      mouseY = event.clientY - mouseDownY;

      moveRow(mouseY);
    });

    document.addEventListener("mouseup", (event) => {
      if (!mouseDrag) return;

      currRow.classList.remove("is-dragging");
      table.removeChild(dragElem);

      dragElem = null;
      mouseDrag = false;
      rows = getRows();
      fixNumberColumn();
    });
  };

  const swapRow = (row, index) => {
    const currIndex = Array.from(tbody.children).indexOf(currRow),
      row1 = currIndex > index ? currRow : row,
      row2 = currIndex > index ? row : currRow;

    tbody.insertBefore(row1, row2);
    rows = getRows();
  };

  const moveRow = (y) => {
    dragElem.style.transform = "translate3d(0, " + y + "px, 0)";

    const dPos = dragElem.getBoundingClientRect(),
      currStartY = dPos.y,
      currEndY = currStartY + dPos.height;

    for (let i = 0; i < rows.length; i++) {
      const rowElem = rows[i],
        rowSize = rowElem.getBoundingClientRect(),
        rowStartY = rowSize.y,
        rowEndY = rowStartY + rowSize.height;

      if (
        currRow !== rowElem &&
        isIntersecting(currStartY, currEndY, rowStartY, rowEndY)
      ) {
        if (Math.abs(currStartY - rowStartY) < rowSize.height / 2)
          swapRow(rowElem, i);
      }
    }
  };

  const addDraggableRow = (target) => {
    dragElem = target.cloneNode(true);
    dragElem.classList.add("draggable-table__drag");
    dragElem.style.height = getStyle(target, "height");
    for (let i = 0; i < target.children.length; i++) {
      const oldTD = target.children[i],
        newTD = dragElem.children[i];
      newTD.style.width = getStyle(oldTD, "width");
      newTD.style.height = getStyle(oldTD, "height");
      newTD.style.padding = getStyle(oldTD, "padding");
      newTD.style.margin = getStyle(oldTD, "margin");
    }

    table.appendChild(dragElem);

    const tPos = target.getBoundingClientRect(),
      dPos = dragElem.getBoundingClientRect();
    dragElem.style.bottom = dPos.y - tPos.y + "px";
    dragElem.style.left = "-1px";

    document.dispatchEvent(
      new MouseEvent("mousemove", {
        view: window,
        cancelable: true,
        bubbles: true,
      })
    );
  };

  const getRows = () => {
    return table.querySelectorAll(`table#${table_id} tbody tr:has(td)`);
  };

  const getTargetRow = (target) => {
    const elemName = target.tagName.toLowerCase();
    const parentName = target.parentElement.tagName.toLowerCase();

    if (elemName !== "svg" || parentName !== "td") return;

    return target.closest("tr");
  };

  const getStyle = (target, styleName) => {
    const compStyle = getComputedStyle(target),
      style = compStyle[styleName];

    return style ? style : null;
  };

  const isIntersecting = (min0, max0, min1, max1) => {
    return (
      Math.max(min0, max0) >= Math.min(min1, max1) &&
      Math.min(min0, max0) <= Math.max(min1, max1)
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
