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
    $("#columns").append(`<div class="column-name column-${i}" id="${str}">${str}</div>`)
    $("#rows").append(`<div class="row-name">${i}</div>`)
}

// let cellData = [];
let cellData = {
    "Sheet1": {}
}
let selectedSheet = "Sheet1";
let totalSheets = 1;
let lastlyAddedSheet = 1;
let saved = true;

let defaultProperties = {
    "font-family": "Noto Sans",
    "font-size": 14,
    "text": "",
    "bold": false,
    "italic": false,
    "underlined": false,
    "alingment": "left",
    "color": "#444",
    "bgcolor": "#fff",
    "formula": "",
    "upStream": [],
    "downStream": []
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
    let [rowId, colId] = getRowCol(this);
    if (cellData[selectedSheet][rowId - 1][colId - 1].formula != "") {
      
        updateStreams(this,[]);
    }
    cellData[selectedSheet][rowId - 1][colId - 1].formula = "";
    updateCellData("text", $(this).text());
    let selfColCode = $(`.column-${colId}`).attr("id");
    evalFormula(selfColCode + rowId);
});

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
    $("#formula-input").text(data["formula"]);
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
            $(".input-cell.selected").attr("contenteditable", "false");

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
    let currentCellData = JSON.stringify(cellData);
    if (value != defaultProperties[property]) {
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            if (cellData[selectedSheet][rowId - 1] == undefined) {
                cellData[selectedSheet][rowId - 1] = {};
                cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties, "upStream": [], "downStream": [] };
                cellData[selectedSheet][rowId - 1][colId - 1][property] = value;
            } else {
                if (cellData[selectedSheet][rowId - 1][colId - 1] == undefined) {
                    cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties, "upStream": [], "downStream": [] };
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
    if (saved == true && currentCellData != JSON.stringify(cellData)) {
        saved = false;
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
                <div class="sheet-modal-title">${selectedSheet}</div>
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
    saved = false;


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
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
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
        saved = false;

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
    if ($(this).text() == "arrow_left") {
        if (selectedSheetIndex != 0) {
            selectSheet($(".sheet-tab.selected").prev()[0]);

        }
    } else {
        if (selectedSheetIndex != keysArrays.length - 1) {
            selectSheet($(".sheet-tab.selected").next()[0]);

        }
    }
    $(".sheet-tab.selected")[0].scrollIntoView();


});

$("#file").click(function (e) {
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
    $(".back-button").click(function (e) {
        $(".home-modal").remove();
    })

})
$("#menu-file").click(function (e) {
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
    }, 300);
    $(".close,.file-transparent,.new,.save,.open").click(function (e) {
        fileModal.animate({
            width: "0vw"
        }, 300)
        setTimeout(function (e) {
            fileModal.remove();

        }, 300);
    })

    $(".new").click(function (e) {
        if (JSON.stringify(cellData) == `{Sheet1 : {}}`) {
            newFile();
        } else {

            $(".container").append(`  <div class="sheet-modal-parent">
                <div class="sheet-delete-modal">
                    <div class="sheet-modal-title">${$(".title").text()}</div>
                    <div class="sheet-modal-detail-container">
                        <div class="sheet-modal-detail-title">Do you want to save changes?</div>
                    </div>
                    <div class="sheet-modal-confirmation">
        
                        <div class=" button yes-button">
                            Yes
                            </div>
                        <div class="button no-button">No</div>
                    </div>
                </div>
            </div>`);
            // $(".sheet-modal-parent").click();
            // $(".sheet-modal-parent").keydown(function(e){
            //     console.log("hello");
            //     if(e.key == "Enter"){
            //         console.log("hello");

            //         $(".yes-button").click();
            //     }
            // })


            $(".no-button").click(function (e) {
                $(".sheet-modal-parent").remove();
                newFile();

            })

            $(".yes-button").click(function (e) {
                $(".sheet-modal-parent").remove();
                if (!saved) {
                    saveFile(true);

                } else {
                    newFile();
                }
            })

        }


    })

    $(".save").click(() => {
        if (!saved) {
            saveFile();

        } else {
            alert("already saved");
        }
    })

    $(".open").click((e) => {
        openFile();

    })

})

function newFile() {
    emptyPreviousSheet();
    cellData = { "Sheet1": {} };
    $(".sheet-tab").remove();
    $(".sheet-tab-container").append(`<div class="sheet-tab selected">Sheet1</div>`);
    addSheetEvents();
    selectedSheet = "Sheet1";
    $(".title").text("Excel-Book");
    $("#row-1-col-1").click();
    totalSheets = 0;
    lastlyAddedSheet = 1;
}



function saveFile(newClicked) {

    $(".container").append(`   <div class="sheet-modal-parent">
    <div class="sheet-rename-modal">
        <div class="sheet-modal-title">Save File</div>
        <div class="sheet-modal-input-container">
            <span class="sheet-modal-input-title">File Name: </span>
            <input class="sheet-modal-input" value="${$(".title").text()}" type="text">
        </div>
        <div class="sheet-modal-confirmation">
            <div class="button yes-button">Save</div>
            <div class="button no-button">Cancel</div>
        </div>
    </div>
</div>`)
    $(".sheet-modal-input").focus();
    $(".sheet-modal-input").keypress(function (e) {
        if (e.key == "Enter") {
            $(".yes-button").click();
        }
    })

    $(".no-button").click(function (e) {
        $(".sheet-modal-parent").remove();
        if (newClicked) {
            newFile();
        }

    })
    $(".yes-button").click(function (e) {
        let a = document.createElement("a");
        a.href = `data:application/json,${encodeURIComponent(JSON.stringify(cellData))}`;
        a.download = `${$(".sheet-modal-input").val() + ".json"}`;
        $(".container").append(a);
        a.click();
        // a.remove();
        $(".sheet-modal-parent").remove();
        saved = true;
        if (newClicked) {
            newFile();
        }
    })

}

function openFile() {
    let inputFile = $(`<input accept="application/json" type="file" />`);
    $(".container").append(inputFile);
    inputFile.click();
    inputFile.change(function (e) {
        let file = e.target.files[0];
        $(".title").text(file.name.split(".json")[0]);
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            emptyPreviousSheet();
            $(".sheet-tab").remove();
            cellData = JSON.parse(reader.result);
            let sheets = Object.keys(cellData);
            lastlyAddedSheet = 1;
            for (i of sheets) {
                if (i.includes("Sheet")) {
                    let splittedSheetArray = i.split("Sheet")
                    if (splittedSheetArray.length == 2 && !isNaN(splittedSheetArray[1])) {
                        lastlyAddedSheet = parseInt(splittedSheetArray);
                    }

                }
                $(".sheet-tab-container").append($(`<div class="sheet-tab selected">${i}</div>`));
            }
            addSheetEvents();
            $(".sheet-tab").removeClass("selected");
            $($(".sheet-tab")[0]).addClass("selected");
            selectedSheet = sheets[0];
            totalSheets = sheets.length;
            loadCurrentSheet();
            inputFile.remove();
            saved = true;
        }

    })
}
let contentCutted = false;
let clipBoard = { startCell: [], cellData: {} };
$("#copy,#cut").click(function (e) {
    if ($(this).text() == "content_cut") {
        contentCutted = true;
    }
    clipBoard = { startCell: [], cellData: {} };

    let [rowId, colId] = getRowCol($(".input-cell.selected")[0]);
    clipBoard.startCell = [rowId, colId];
    $(".input-cell.selected").each(function (index, data) {
        let [rowId, colId] = getRowCol(data);
        if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
            if (!clipBoard.cellData[rowId]) {
                clipBoard.cellData[rowId] = {};
            }
            clipBoard.cellData[rowId][colId] = { ...cellData[selectedSheet][rowId - 1][colId - 1] };
        }

    })
})

$("#paste").click(function (e) {
    if (contentCutted) {
        emptyPreviousSheet();
    }
    let startCell = getRowCol($(".input-cell.selected")[0]);
    let rows = Object.keys(clipBoard.cellData);
    for (let i of rows) {
        let cols = Object.keys(clipBoard.cellData[i]);
        for (let j of cols) {
            if (contentCutted) {
                delete cellData[selectedSheet][i - 1][j - 1];
                if (Object.keys(cellData[selectedSheet][i - 1]).length == 0) {
                    delete cellData[selectedSheet][i - 1];
                }
            }



        }
    }
    for (let i of rows) {
        let cols = Object.keys(clipBoard.cellData[i]);
        for (let j of cols) {

            let rowDistance = parseInt(i) - parseInt(clipBoard.startCell[0]);
            let colDistance = parseInt(j) - parseInt(clipBoard.startCell[1]);
            if (!cellData[selectedSheet][startCell[0] + rowDistance - 1]) {
                cellData[selectedSheet][startCell[0] + rowDistance - 1] = {};
            }
            cellData[selectedSheet][startCell[0] + rowDistance - 1][startCell[1] + colDistance - 1] = { ...clipBoard.cellData[i][j] }



        }
    }
    loadCurrentSheet();
    if (contentCutted) {
        contentCutted = false;
        clipBoard = { startCell: [], cellData: {} };

    }
})

//#region

// $("#formula-input").blur(function (e) {
//     if ($(".input-cell.selected").length > 0) {
     
//         let formula = $(this).text();
//         let tempElements = formula.split(" ");
//         let elements = [];
//         for (let i of tempElements) {
//             if (i.length >= 2) {
//                 i = i.replace("(", "");
//                 i = i.replace(")", "");
//                 if(!elements.includes(i)){
//                     elements.push(i);

//                 }

//             }
//         }
//         $(".input-cell.selected").each(function(index,data){
//             if(updateStreams(data,elements)){

//             }else{
//                 alert("Not valid formula");
//             }

//         })
    
//     } else {
//         alert("select a cell first");
//     }
// })

// function isFormulaValid(){


// }
// function updateStreams(ele,elements){
//     let [rowId,colId] = getRowCol(ele);
//     let selfCode = $(`.column-${colId}`).attr("id");
//     if(elements.includes(selfCode + rowId)){
//         return false;
//     }
//     if(!cellData[selectedSheet][rowId-1]){
//         cellData[selectedSheet[rowId-1]] = {};
//         cellData[selectedSheet][rowId-1][colId-1] = {...defaultProperties , "upStream" : [...elements] , "downStream" : []};
//     }else if(!cellData[selectedSheet][rowId-1][colId-1]){
//         cellData[selectedSheet][rowId-1][colId-1] = {...defaultProperties , "upStream" : [...elements] , "downStream" : []};

//     }else{
//         let downstream =cellData[selectedSheet][rowId-1][colId-1].downStream;
//         for(let i of downstream){
//             if(elements.includes(i)){
//                 return false;
//             }
//         }
//         let upstream =cellData[selectedSheet][rowId-1][colId-1].upStream;
//         for(let i of upstream){
//             let [calRowId,calCalId] = codeToValue(i);
//             let index = cellData[selectedSheet][calRowId-1][calCalId-1].downStream.indexOf()
//         }
//         cellData[selectedSheet][rowId-1][colId-1].upStream = [...elements];

 
//     }
//     for(i of elements){
//         let [calRowId,calCalId] = codeToValue(i);
//         if(!cellData[selectedSheet][calrowId-1]){
//             cellData[selectedSheet[calrowId-1]] = {};
//             cellData[selectedSheet][calrowId-1][calcolId-1] = {...defaultProperties , "upStream" : [] , "downStream" : [selfCode + rowId]};
//         }else if(!cellData[selectedSheet][calrowId-1][calcolId-1]){
//             cellData[selectedSheet][calrowId-1][calcolId-1] = {...defaultProperties , "upStream" : [] , "downStream" : [selfCode + rowId]};
    
//         }else{
//            if(!cellData[selectedSheet][calrowId-1][calcolId-1].downStream.includes(selfCode+rowId)){

//                cellData[selectedSheet][calrowId-1][calcolId-1].downStream.push(selfCode+rowId);
//            }
     
//         }

//     }
    
//     return true;
// }

// function codeToValue(code){
//     let colCode = "";
//     let rowCode = "";
//     for(let i=0;i<code;i++){
//         if(!NaN(code.charAt(i))){
//             rowCode += code.charAt(i);
//         }else{
//             colCode += code.charAt(i);

//         }
//     }

//     let colId = parseInt($(`#${colCode}`).attr("class").split(" ")[1].split("-")[1]);
//     let rowId = parseInt(rowCode);
//     return [rowId,colId];

// }


//#endregion




$("#formula-input").blur(function (e) {
    if ($(".input-cell.selected").length > 0) {
        let formula = $(this).text();
        let tempElements = formula.split(" ");
        let elements = [];
        for (let i of tempElements) {
            if (i.length >= 2) {
                i = i.replace("(", "");
                i = i.replace(")", "");
                if (!elements.includes(i)) {
                    elements.push(i);
                }
            }
        }
        $(".input-cell.selected").each(function (index, data) {
            if (updateStreams(data, elements, false)) {
                let [rowId, colId] = getRowCol(data);
                cellData[selectedSheet][rowId - 1][colId - 1].formula = formula;
                let selfColCode = $(`.column-${colId}`).attr("id");
                evalFormula(selfColCode + rowId);
            } else {
                alert("Formula is not valid");
            }
        })
    } else {
        alert("!Please select a cell First");
    }
});

function updateStreams(ele, elements, update, oldUpstream) {
    let [rowId, colId] = getRowCol(ele);
    let selfColCode = $(`.column-${colId}`).attr("id");
    if (elements.includes(selfColCode + rowId)) {
        return false;
    }
    if (cellData[selectedSheet][rowId - 1] && cellData[selectedSheet][rowId - 1][colId - 1]) {
        let downStream = cellData[selectedSheet][rowId - 1][colId - 1].downStream;
        let upStream = cellData[selectedSheet][rowId - 1][colId - 1].upStream;
        for (let i of downStream) {
            if (elements.includes(i)) {
                return false;
            }
        }
        for (let i of downStream) {
            let [calRowId, calColId] = codeToValue(i);
            updateStreams($(`#row-${calRowId}-col-${calColId}`)[0], elements, true, upStream);
        }
    }

    if (!cellData[selectedSheet][rowId - 1]) {
        cellData[selectedSheet][rowId - 1] = {};
        cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties, "upStream": [...elements], "downStream": [] };
    } else if (!cellData[selectedSheet][rowId - 1][colId - 1]) {
        cellData[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties, "upStream": [...elements], "downStream": [] };
    } else {

        let upStream = [...cellData[selectedSheet][rowId - 1][colId - 1].upStream];
        if (update) {
            for (let i of oldUpstream) {
                let [calRowId, calColId] = codeToValue(i);
                let index = cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.indexOf(selfColCode + rowId);
                cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.splice(index, 1);
                if (JSON.stringify(cellData[selectedSheet][calRowId - 1][calColId - 1]) == JSON.stringify(defaultProperties)) {
                    delete cellData[selectedSheet][calRowId - 1][calColId - 1];
                    if (Object.keys(cellData[selectedSheet][calRowId - 1]).length == 0) {
                        delete cellData[selectedSheet][calRowId - 1];
                    }
                }
                index = cellData[selectedSheet][rowId - 1][colId - 1].upStream.indexOf(i);
                cellData[selectedSheet][rowId - 1][colId - 1].upStream.splice(index, 1);
            }
            for (let i of elements) {
                cellData[selectedSheet][rowId - 1][colId - 1].upStream.push(i);
            }
        } else {
            for (let i of upStream) {
                let [calRowId, calColId] = codeToValue(i);
                let index = cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.indexOf(selfColCode + rowId);
                cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.splice(index, 1);
                if (JSON.stringify(cellData[selectedSheet][calRowId - 1][calColId - 1]) == JSON.stringify(defaultProperties)) {
                    delete cellData[selectedSheet][calRowId - 1][calColId - 1];
                    if (Object.keys(cellData[selectedSheet][calRowId - 1]).length == 0) {
                        delete cellData[selectedSheet][calRowId - 1];
                    }
                }
            }
            cellData[selectedSheet][rowId - 1][colId - 1].upStream = [...elements];
        }
    }

    for (let i of elements) {
        let [calRowId, calColId] = codeToValue(i);
        if (!cellData[selectedSheet][calRowId - 1]) {
            cellData[selectedSheet][calRowId - 1] = {};
            cellData[selectedSheet][calRowId - 1][calColId - 1] = { ...defaultProperties, "upStream": [], "downStream": [selfColCode + rowId] };
        } else if (!cellData[selectedSheet][calRowId - 1][calColId - 1]) {
            cellData[selectedSheet][calRowId - 1][calColId - 1] = { ...defaultProperties, "upStream": [], "downStream": [selfColCode + rowId] };
        } else {
            cellData[selectedSheet][calRowId - 1][calColId - 1].downStream.push(selfColCode + rowId);
        }
    }
    return true;

}

function codeToValue(code) {
    let colCode = "";
    let rowCode = "";
    for (let i = 0; i < code.length; i++) {
        if (!isNaN(code.charAt(i))) {
            rowCode += code.charAt(i);
        } else {
            colCode += code.charAt(i);
        }
    }
    let colId = parseInt($(`#${colCode}`).attr("class").split(" ")[1].split("-")[1]);
    let rowId = parseInt(rowCode);
    return [rowId, colId];
}

function evalFormula(cell) {
    let [rowId, colId] = codeToValue(cell);
    let formula = cellData[selectedSheet][rowId - 1][colId - 1].formula;
    if (formula != "") {
        let upStream = cellData[selectedSheet][rowId - 1][colId - 1].upStream;
        let upStreamValue = [];
        for (let i in upStream) {
            let [calRowId, calColId] = codeToValue(upStream[i]);
            let value;
            if (cellData[selectedSheet][calRowId - 1][calColId - 1].text == "") {
                value = "0";
            }
             else {
                value = cellData[selectedSheet][calRowId - 1][calColId - 1].text;
            }
            upStreamValue.push(value);
            formula = formula.replace(upStream[i], upStreamValue[i]);
        }
        cellData[selectedSheet][rowId - 1][colId - 1].text = eval(formula);
        loadCurrentSheet();
    }
    let downStream = cellData[selectedSheet][rowId - 1][colId - 1].downStream;
    for (let i = downStream.length - 1; i >= 0; i--) {
        evalFormula(downStream[i]);
    }

}







