const ps = new PerfectScrollbar("#cells", { wheelSpeed: 2, wheelPropagation: true });
for (let i = 1; i <= 100; i++) {
    let n = i;
    let str = "";
    while (n > 0) {
        let rem = n % 26;
        if (rem == 0) {
            str += 'Z';
            n = Math.floor(n / 26) - 1;
        } else {
            str = String.fromCharCode((rem - 1) + 65) + str;
            n = Math.floor(n / 26);

        }
    }
    $("#columns").append(`<div class="column-name">${str}</div>`)
    $("#rows").append(`<div class="row-name">${i}</div>`)
}

// let cellData = [];
let cellData = {
    "Sheet1": {}
}
let selectedSheet = "Sheet1";
let totalSheets = 1;
let lastlyAddedSheet = 1;

let defaultProperties = {
    "font-family": "Noto Sans",
    "font-size": 14,
    "text": "",
    "bold": false,
    "italic": false,
    "underlined": false,
    "alingment": "left",
    "color": "#444",
    "bgcolor": "#fff"
};

for (let i = 1; i <= 100; i++) {
    let row = $(`<div class="cell-row"></div>`)

    for (let j = 1; j <= 100; j++) {

        row.append($(` <div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`));


    }
    $("#cells").append(row);
}

$("#cells").scroll(function (e) {
    $("#columns").scrollLeft(this.scrollLeft);
    $("#rows").scrollTop(this.scrollTop);

})

$(".input-cell").dblclick(function (e) {
    $(".input-cell.selected").removeClass("selected top-selected bottom-selected right-selected left-selected");
    $(this).addClass("selected");
    $(this).attr("contenteditable", "true");
    $(this).focus();
})

$(".input-cell").blur(function (e) {
    $(this).attr("contenteditable", "false");
    updateCellData("text", $(this).text());
})

function getRowCol(ele) {
    let id = $(ele).attr("id");
    let idArr = id.split("-");
    let rowId = parseInt(idArr[1]);
    let colId = parseInt(idArr[3]);
    return [rowId, colId];
}

function getTopLeftBottomRightCell(rowId, colId) {
    let topCell = $(`#row-${rowId - 1}-col-${colId}`);
    let leftCell = $(`#row-${rowId}-col-${colId - 1}`);
    let rightCell = $(`#row-${rowId}-col-${colId + 1}`);
    let bottomCell = $(`#row-${rowId + 1}-col-${colId}`);
    return [topCell, leftCell, bottomCell, rightCell];

}

$(".input-cell").click(function (e) {
    let [rowId, colId] = getRowCol(this);
    let [topCell, leftCell, bottomCell, rightCell] = getTopLeftBottomRightCell(rowId, colId);
    if ($(this).hasClass("selected") && e.ctrlKey) {
        unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    } else {
        selectCell(this, e, topCell, bottomCell, leftCell, rightCell);

    }

})

function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if ($(ele).attr("contenteditable") == "false") {
        if ($(ele).hasClass("top-selected")) {
            topCell.removeClass("bottom-selected");
        }
        if ($(ele).hasClass("bottom-selected")) {
            bottomCell.removeClass("top-selected");
        }
        if ($(ele).hasClass("left-selected")) {
            leftCell.removeClass("right-selected");
        }
        if ($(ele).hasClass("right-selected")) {
            rightCell.removeClass("left-selected");
        }

        $(ele).removeClass("selected top-selected bottom-selected right-selected left-selected");

    }
}

function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if (e.ctrlKey) {

        let topSelected;
        if (topCell) {
            topSelected = topCell.hasClass("selected");
        }
        let leftSelected;
        if (leftCell) {
            leftSelected = leftCell.hasClass("selected");
        }
        let rightSelected;
        if (rightCell) {
            rightSelected = rightCell.hasClass("selected");
        }
        let bottomSelected;
        if (bottomCell) {
            bottomSelected = bottomCell.hasClass("selected");
        }

        if (bottomSelected) {
            $(ele).addClass("bottom-selected");
            bottomCell.addClass("top-selected");

        }
        if (topSelected) {
            $(ele).addClass("top-selected");
            topCell.addClass("bottom-selected");

        }
        if (leftSelected) {
            $(ele).addClass("left-selected");
            leftCell.addClass("right-selected");

        }
        if (rightSelected) {
            $(ele).addClass("right-selected");
            rightCell.addClass("left-selected");

        }


    } else {
        $(".input-cell.selected").removeClass("selected top-selected bottom-selected right-selected left-selected");
    }
    $(ele).addClass("selected");
    changeHeader(getRowCol(ele));

}

function changeHeader([rowId, colId]) {
    let data;
    if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
        data = cellData[selectedSheet][rowId - 1][colId - 1];
    } else {
        data = defaultProperties;

    }
    $(".alignment.selected").removeClass("selected");
    $(`.alignment[data-type = ${data.alingment}]`).addClass("selected");

    addRemoveSelectFromFontStyle(data, "bold");
    addRemoveSelectFromFontStyle(data, "italic");

    addRemoveSelectFromFontStyle(data, "underlined");
    $("#fill-color").css("border-bottom", `4px solid ${data.bgcolor}`);
    $("#text-color").css("border-bottom", `4px solid ${data.color}`);
    $("#font-family").val(data["font-family"]);
    $("#font-size").val(data["font-size"]);
    $("#font-family").css("font-family", data["font-family"]);
}

function addRemoveSelectFromFontStyle(data, property) {
    if (data[property]) {
        $(`#${property}`).addClass("selected");
    } else {
        $(`#${property}`).removeClass("selected");

    }
}

let startCellSelected = false;
let startCell = {};
let endCell = {};
let scrollXrStarted = false;
let scrollXlStarted = false;
let scrollYdStarted = false;
let scrollYuStarted = false;
$(".input-cell").mousemove(function (e) {
    e.preventDefault();

    if (e.buttons == 1) {
        if (e.pageX > ($(window).width()) - 10 && !scrollXrStarted) {
            scrollXR();

        } else if (e.pageX < 10 && !scrollXlStarted) {
            scrollXL();
        }

        if (e.pageY > ($(window).height()) - 50 && !scrollYdStarted) {
            scrollYD();
        }
        // else if(e.pageY < 190 && !scrollYuStarted){
        //     scrollYU();
        // }



        if (!startCellSelected) {
            let [rowId, colId] = getRowCol(this);
            startCell = { "rowId": rowId, "colId": colId };
            selectAllBetweenCells(startCell, startCell);

            startCellSelected = true;

        }
    } else {
        startCellSelected = false;
    }


});

$(".input-cell").mouseenter(function (e) {
    if (e.buttons == 1) {
        if (e.pageX < $(window).width() - 10 && scrollXrStarted) {
            clearInterval(scrollXrInterval);
            scrollXrStarted = false;
        }
        if (e.pageX > 10 && scrollXlStarted) {
            clearInterval(scrollXlInterval);
            scrollXlStarted = false;
        }

        if (e.pageY < $(window).height() - 50 && scrollYdStarted) {
            clearInterval(scrollYdInterval);
            scrollYdStarted = false;
        }

        if (e.pageY > 190 && scrollYuStarted) {
            clearInterval(scrollYuInterval);
            scrollYuStarted = false;
        }


        let [rowId, colId] = getRowCol(this);
        endCell = { "rowId": rowId, "colId": colId };
        selectAllBetweenCells(startCell, endCell);
    }
})

function selectAllBetweenCells(start, end) {
    $(".input-cell.selected").removeClass("selected top-selected bottom-selected right-selected left-selected");

    for (let i = Math.min(start.rowId, end.rowId); i <= Math.max(start.rowId, end.rowId); i++) {
        for (let j = Math.min(start.colId, end.colId); j <= Math.max(start.colId, end.colId); j++) {

            let [topCell, leftCell, bottomCell, rightCell] = getTopLeftBottomRightCell(i, j);
            selectCell($(`#row-${i}-col-${j}`)[0], { "ctrlKey": "true" }, topCell, bottomCell, leftCell, rightCell);


        }
    }
}

let scrollXrInterval;
let scrollXlInterval;
let scrollYdInterval;
let scrollYuInterval;
function scrollXR() {
    scrollXrStarted = true;
    scrollXrInterval = setInterval(() => {
        $("#cells").scrollLeft($("#cells").scrollLeft() + 100);

    }, 100);
}
function scrollXL() {
    scrollXlStarted = true;
    scrollXlInterval = setInterval(() => {
        $("#cells").scrollLeft($("#cells").scrollLeft() - 100);

    }, 100);
}
function scrollYD() {
    scrollYdStarted = true;
    scrollYdInterval = setInterval(() => {
        $("#cells").scrollTop($("#cells").scrollTop() + 50);

    }, 100);

}
function scrollYU() {
    scrollYuStarted = true;
    scrollYuInterval = setInterval(() => {
        $("#cells").scroll($("#cells").scroll() + 50);

    }, 100);

}

$(".data-container").mousemove(function (e) {
    if (e.buttons == 1) {
        if (e.pageX > ($(window).width()) - 10 && !scrollXrStarted) {
            scrollXR();

        } else if (e.pageX < 10 && !scrollXlStarted) {
            scrollXL();
        }



    }
})


$(".data-container").mouseup(function (e) {
    console.log("hello");
    clearInterval(scrollXrInterval);
    clearInterval(scrollXlInterval);
    clearInterval(scrollYdInterval);
    clearInterval(scrollYuInterval);
    scrollYuStarted = false;
    scrollYdStarted = false;
    scrollXlStarted = false;
    scrollXrStarted = false;
});

$(".alignment").click(function (e) {

    let alingment = $(this).attr("data-type");
    $(".alignment.selected").removeClass("selected");
    $(this).addClass("selected");
    $(".input-cell.selected").css("text-align", alingment);

    updateCellData("alingment", alingment);
});


$("#bold").click(function (e) {
    setStyle(this, "bold", "font-weight", "bold");

});
$("#italic").click(function (e) {
    setStyle(this, "italic", "font-style", "italic");

});
$("#underlined").click(function (e) {
    setStyle(this, "underlined", "text-decoration", "underline");

});

function setStyle(ele, property, key, value) {
    if ($(ele).hasClass("selected")) {
        $(ele).removeClass("selected");
        $(".input-cell.selected").css(key, "");

        updateCellData(property, false);


    } else {
        $(ele).addClass("selected");

        $(".input-cell.selected").css(key, value);

        updateCellData(property, true);
    }
}


$(".pick-color").colorPick({
    'initial-color': '#abcd',
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function () {
        if (this.color != '#ABCD') {
            if ($(this.element.children()[1]).attr("id") == "fill-color") {
                $(".input-cell.selected").css("backgroundColor", this.color);
                $("#fill-color").css("border-bottom", `4px solid ${this.color}`);

                updateCellData("bgcolor", this.color);
            }
            if ($(this.element.children()[1]).attr("id") == "text-color") {
                $(".input-cell.selected").css("color", this.color);
                $("#text-color").css("border-bottom", `4px solid ${this.color}`);

                updateCellData("color", this.color)

            }
        }
    }
});

$("#fill-color").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
})
$("#text-color").click(function (e) {
    setTimeout(() => {
        $(this).parent().click();
    }, 10);
});
$(".menu-selector").change(function (e) {
    let value = $(this).val();
    let key = $(this).attr("id");
    if (key == "font-family") {
        $("#font-family").css(key, value);

    }
    if (!isNaN(value)) {
        value = parseInt(value);
    }
    $(".input-cell.selected").css(key, value);

    updateCellData(key, value);

})

function updateCellData(property, value) {
    if (value != defaultProperties[property]) {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            if (cellData[selectedSheet][rowId - 1] == undefined) {
                cellData[selectedSheet][rowId - 1] = {};
                cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
            } else {
                if (cellData[selectedSheet][rowId - 1][colId - 1] == undefined) {
                    cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties };
                    cellData[selectedSheet][rowId - 1][colId - 1][property] = value;

                } else {
                    cellData[selectedSheet][rowId - 1][colId - 1][property] = value;

                }
            }
        })
    } else {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
                if (JSON.stringify(cellData[selectedSheet][rowId - 1][colId - 1]) == JSON.stringify(defaultProperties)) {
                    delete cellData[selectedSheet][rowId - 1][colId - 1];
                    if (Object.keys(cellData[selectedSheet][rowId - 1]).length == 0) {
                        delete cellData[selectedSheet][rowId] - 1;
                    }
                }
            }
        })
    }
}

$(".container").click(function (e) {
    $(".sheet-options-modal").remove();

})

function addSheetEvents() {

    $(".sheet-tab.selected").on("contextmenu", function (e) {          //if context menu opens runs this function
        e.preventDefault();

        selectSheet(this);

        $(".sheet-options-modal").remove();
        let modal = $(`<div class="sheet-options-modal">
        <div class="option sheet-rename">
            Rename
        </div>
        <div class="option sheet-delete">
            Delete
        </div>
    </div>`);
        modal.css({ "left": e.pageX });
        $(".container").append(modal);
        $(".sheet-rename").click(function (e) {
            console.log("hey there");
            let renameModal = $(`<div class="sheet-modal-parent">
        <div class="sheet-rename-modal">
            <div class="sheet-modal-title">Rename Sheet</div>
            <div class="sheet-modal-input-container">
                <span class="sheet-modal-input-title">Rename Sheet to : </span>
                <input class="sheet-modal-input" type="text">
            </div>
            <div class="sheet-modal-confirmation">
                <div class="button yes-button">OK</div>
                <div class="button no-button">Cancel</div>
            </div>
        </div>
    </div>`);
            $(".container").append(renameModal);
            $(".sheet-modal-input").focus();
            $(".no-button").click(function (e) {
                $(".sheet-modal-parent").remove();
            });
            $(".yes-button").click(function (e) {
                renameSheet();
            });
            $(".sheet-modal-input").keypress(function (e) {
                if (e.key == "Enter") {
                    renameSheet();
                }
            })


        });
        $(".sheet-delete").click(function (e) {
            if (totalSheets > 1) {
                let deleteModal = $(`<div class="sheet-modal-parent">
            <div class="sheet-delete-modal">
                <div class="sheet-modal-title">Delete Sheet</div>
                <div class="sheet-modal-detail-container">
                    <div class="sheet-modal-detail-title">Are You Sure?</div>
                </div>
                <div class="sheet-modal-confirmation">
    
                    <div class=" button yes-button">
                        <div class="material-icons delete-icon">delete</div>
                        Delete
                        </div>
                    <div class="button no-button">Cancel</div>
                </div>
            </div>
        </div>`);
                $(".container").append(deleteModal);
                $(".no-button").click(function (e) {
                    $(".sheet-modal-parent").remove();
                });
                $(".yes-button").click(function (e) {
                    deleteSheet();
                })

            } else {
                let alertModal = $(`<div class="sheet-modal-parent">
            <div class="alert-modal-delete">
            Sorry,Not Possible</div></div>`);
                $(".container").append(alertModal);
                setTimeout(function (e) {
                    alertModal.remove();
                }, 1000)
            }

        })


    });


    $(".sheet-tab.selected").click(function (e) {

        selectSheet(this);


    })
}
addSheetEvents();



$(".add-sheet").click(function (e) {
    lastlyAddedSheet++;
    totalSheets++;
    cellData[`Sheet${lastlyAddedSheet}`] = {};
    $(".sheet-tab.selected").removeClass("selected");
    $(".sheet-tab-container").append(`  <div class="sheet-tab selected">Sheet${lastlyAddedSheet}</div>
    `);
    selectSheet();
    addSheetEvents();
    $(".sheet-tab.selected")[0].scrollIntoView();


})


function selectSheet(ele) {
    if (ele && !$(ele).hasClass("selected")) {
        $(".sheet-tab.selected").removeClass("selected");
        $(ele).addClass("selected");
    }
    emptyPreviousSheet();
    selectedSheet = $(".sheet-tab.selected").text();
    loadCurrentSheet();
    $("#row-1-col-1").click();



}
function emptyPreviousSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        console.log(colKeys, rowKeys);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            console.log(cell);
            cell.text("");
            cell.css({
                "font-family": "Noto Sans",
                "font-size": 14,
                "color": "#444",
                "font-weight": "",
                "font-style": "",
                "text-align": "left",
                "text-decoration": "",
                "background-color": "#fff"
            });
        }
    }
}

function loadCurrentSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        console.log(colKeys, rowKeys);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);

            cell.text(data[rowId][colId].text);
            cell.css({
                "font-family": data[rowId][colId]["font-family"],
                "font-size": data[rowId][colId]["font-size"],
                "color": data[rowId][colId].color,
                "font-weight": data[rowId][colId].bold ? "bold" : "",
                "font-style": data[rowId][colId].italic ? "italic" : "",
                "text-align": data[rowId][colId].alingment,
                "text-decoration": data[rowId][colId].underlined ? "underline" : "",
                "background-color": data[rowId][colId]["bgcolor"]
            });
        }
    }

}

function renameSheet() {
    let newSheetName = $(".sheet-modal-input").val();
    if (newSheetName && !Object.keys(cellData).includes(newSheetName)) {
        let newCellData = {};
        for (let i of Object.keys(cellData)) {
            if (i == selectedSheet) {
                newCellData[newSheetName] = cellData[selectedSheet];
            } else {
                newCellData[i] = cellData[i];
            }
        }
        cellData = newCellData;

        selectedSheet = newSheetName;
        $(".sheet-tab.selected").text(newSheetName);
        $(".sheet-modal-parent").remove();
        console.log(cellData);
    } else {
        $(".rename-error").remove();
        $(".sheet-modal-input-container").append(`<div class="rename-error">
        Sheet name not valid or Sheet already exists!!
        </div>`)
    }

}

function deleteSheet() {
    $(".sheet-modal-parent").remove();
    let sheetIndex = Object.keys(cellData).indexOf(selectedSheet);
    let currentSelectedSheet = $(".sheet-tab.selected");
    if (sheetIndex == 0) {
        selectSheet(currentSelectedSheet.next()[0]);
    } else {
        selectSheet(currentSelectedSheet.prev()[0]);
    }
    delete cellData[currentSelectedSheet.text()];
    currentSelectedSheet.remove();
    totalSheets--;

}

$(".left-scroller,.right-scroller").click(function (e) {
    let keysArrays = Object.keys(cellData);
    let selectedSheetIndex = keysArrays.indexOf(selectSheet);
    if($(this).text() == "arrow_left"){
        if(selectedSheetIndex != 0){
            selectSheet($(".sheet-tab.selected").prev()[0]);

        }
    }else{
        if(selectedSheetIndex != keysArrays.length-1){
            selectSheet($(".sheet-tab.selected").next()[0]);

        }
    }
    $(".sheet-tab.selected")[0].scrollIntoView();


});

$("#file").click(function(e){
    let modal = $(`       <div class="home-modal">
    <div class="home-modal-left">
        <div class="home-modal-left-top">
            <div class="back-button home-modal-left-top-items">
                <div class="material-icons" style="margin-right: 15px;">arrow_back</div>
               
            </div>
            <div class="home-modal-home home-modal-left-top-items">
                <div class="material-icons" style="margin-right: 15px;">home</div>
               Home
            </div>
            <div class="home-modal-new home-modal-left-top-items" >
                <div class="material-icons" style="margin-right: 15px;">note_add</div>
               New
            </div>
            <div class="home-modal-open home-modal-left-top-items">
                <div class="material-icons" style="margin-right: 15px;">folder_open</div>
               Open
            </div>
        </div>
    
    </div>
    <div class="home-modal-right">jsfkjsakf</div>
</div>`)
    $(".container").append(modal);
    $(".back-button").click(function(e){
        $(".home-modal").remove();
    })

})
$("#menu-file").click(function(e){
    let fileModal = $(`     
    <div class="file-modal">
        <div class="file-options-modal">
            <div class="close">
                <div class="material-icons close-icon ">arrow_circle_down</div>
                <div>Close</div>
            </div>
            <div class="new">
                <div class="material-icons new-icon ">insert_drive_file</div>
                <div>New</div>
            </div>
            <div class="open">
                <div class="material-icons open-icon ">folder-open</div>
                <div>Open</div>
            </div>
            <div class="save">
                <div class="material-icons save-icon ">save</div>
                <div>Save</div>
            </div>
        </div>
        <div class="file-recent-modal"></div>
        <div class="file-transparent"></div>
    </div>
`);
$(".container").append(fileModal);
fileModal.animate({
    width: "100vw"
},300);
$(".close,.file-transparent").click(function(e){
    fileModal.animate({
        width: "0vw"
    },300)
    setTimeout(function(e){
        fileModal.remove();

    },300);
})

})






