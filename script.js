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

let cellData = [];
// let cellData = {
//     "Sheet1" : {}
// }
// let selectedSheet = "Sheet1";
// let totalSheets = 1;

for (let i = 1; i <= 100; i++) {
    let row = $(`<div class="cell-row"></div>`)
    let rowArray = [];

    for (let j = 1; j <= 100; j++) {

        row.append($(` <div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`));
        rowArray.push({
            "font-family": "Noto Sans",
            "font-size": 14,
            "text": "",
            "bold": false,
            "italic": false,
            "underlined": false,
            "alingment": "left",
            "color": "#444",
            "bgcolor": "#fff"
        })

    }
    cellData.push(rowArray);
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
    let data = cellData[rowId - 1][colId - 1];
    $(".alignment.selected").removeClass("selected");
    $(`.alignment[data-type = ${data.alingment}]`).addClass("selected");
   
  addRemoveSelectFromFontStyle(data,"bold");
  addRemoveSelectFromFontStyle(data,"italic");

  addRemoveSelectFromFontStyle(data,"underlined");  
  $("#fill-color").css("border-bottom",`4px solid ${data.bgcolor}`);
  $("#text-color").css("border-bottom",`4px solid ${data.color}`);
  $("#font-family").val(data["font-family"]);
  $("#font-size").val(data["font-size"]);
  $("#font-family").css("font-family",data["font-family"]);
}

function addRemoveSelectFromFontStyle(data,property){
    if(data[property]){
        $(`#${property}`).addClass("selected");
    }else{
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
    $(".input-cell.selected").each(function (index, data) {
        let [rowId, colId] = getRowCol(data);
        cellData[rowId - 1][colId - 1].alingment = alingment;
    })
});

$("#bold").click(function(e){
    setStyle(this,"bold","font-weight","bold");
 
});
$("#italic").click(function(e){
    setStyle(this,"italic","font-style","italic");
 
});
$("#underlined").click(function(e){
    setStyle(this,"underlined","text-decoration","underline");
 
});

function setStyle(ele,property,key,value){
    if($(ele).hasClass("selected")){
        $(ele).removeClass("selected");
        $(".input-cell.selected").css(key,"");
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            cellData[rowId - 1][colId - 1][property]= false;
        })


    }else{
        $(ele).addClass("selected");
       
        $(".input-cell.selected").css(key,value);
        $(".input-cell.selected").each(function (index, data) {
            let [rowId, colId] = getRowCol(data);
            cellData[rowId - 1][colId - 1][property] = true;             //not .property as its a variable and with . its considered as a key
        })
    }
}


$(".pick-color").colorPick({
    'initial-color' : '#abcd',
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function() {
         if(this.color != '#ABCD'){
             if($(this.element.children()[1]).attr("id") == "fill-color"){
                 $(".input-cell.selected").css("backgroundColor",this.color);
                 $("#fill-color").css("border-bottom",`4px solid ${this.color}`);
                 $(".input-cell.selected").each((index,data) => {
                     let [rowId,colId] = getRowCol(data);
                     
                     cellData[rowId-1][colId-1].bgcolor = this.color;


                 })
             }
             if($(this.element.children()[1]).attr("id") == "text-color"){
                $(".input-cell.selected").css("color",this.color);
                $("#text-color").css("border-bottom",`4px solid ${this.color}`);
                $(".input-cell.selected").each((index,data) => {
                    let [rowId,colId] = getRowCol(data);
                    cellData[rowId-1][colId-1].color = this.color;
                    

                })

            }
         }
    }
  });

  $("#fill-color").click(function(e){
       setTimeout(()=>{
                $(this).parent().click();
       },10);
  })
  $("#text-color").click(function(e){
    setTimeout(()=>{
             $(this).parent().click();
    },10);
});
$(".menu-selector").change(function(e){
    let value = $(this).val();
    let key = $(this).attr("id");
    if(key == "font-family"){
        $("#font-family").css(key,value);

    }
    if(!isNaN(value)){
        value = parseInt(value);
    }
    $(".input-cell.selected").css(key,value);
    $(".input-cell.selected").each((index,data)=>{
        let [rowId,colId] = getRowCol(data);
        cellData[rowId-1][colId-1][key] = value;
    })

})
