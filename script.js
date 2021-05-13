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

for (let i = 1; i <= 100; i++) {
    let row = $(`<div class="cell-row"></div>`)

    for (let j = 1; j <= 100; j++) {
        row.append($(`                    <div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>
        `))

    }
    $("#cells").append(row);
}

$("#cells").scroll(function (e) {
    $("#columns").scrollLeft(this.scrollLeft);
    $("#rows").scrollTop(this.scrollTop);

})

$(".input-cell").dblclick(function (e) {
    $(".input-cell.selected").removeClass("selected top-selected bottom-selected right-selected left-selected");
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

}

let startCellSelected = false;
let startCell = {};
let endCell = {};
let scrollXrStarted = false;
let scrollXlStarted = false;
let scrollYdStarted = false;
$(".input-cell").mousemove(function (e) {
    e.preventDefault();

    if (e.buttons == 1) {
        if(e.pageX > ($(window).width()) - 10 && !scrollXrStarted){
                  scrollXR();

        }else if(e.pageX < 10 && !scrollXlStarted){
            scrollXL();
        }
        // console.log(e.pageY,$(window).height());

        if(e.pageY > ($(window).height()) - 50 && !scrollYdStarted){
            scrollYD();
        }

        

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
        if(e.pageX < $(window).width()-10 && scrollXrStarted){
            clearInterval(scrollXrInterval);
            scrollXrStarted = false;
        }
        if(e.pageX > 10 && scrollXlStarted){
            clearInterval(scrollXlInterval);
            scrollXlStarted = false;
        }

        if(e.pageY < $(window).height()-50 && scrollYdStarted){
            clearInterval(scrollYdInterval);
            scrollYdStarted = false;
        }


        let [rowId, colId] = getRowCol(this);
        endCell = { "rowId": rowId, "colId": colId };
        selectAllBetweenCells(startCell, endCell);
        console.log(endCell);
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
function scrollXR(){
    scrollXrStarted = true;
    scrollXrInterval = setInterval(() => {
        $("#cells").scrollLeft($("#cells").scrollLeft() + 100);

    },100);
}
function scrollXL(){
    scrollXlStarted = true;
    scrollXlInterval = setInterval(() => {
        $("#cells").scrollLeft($("#cells").scrollLeft() - 100);

    },100);
}
function scrollYD(){
    scrollYdStarted = true;
    scrollYdInterval = setInterval(() => {
        $("#cells").scrollTop($("#cells").scrollTop() + 50);

    },100);

}

$(".data-container").mousemove(function(e){
    if (e.buttons == 1) {
        if(e.pageX > ($(window).width()) - 10 && !scrollXrStarted){
                  scrollXR();

        }else if(e.pageX < 10 && !scrollXlStarted){
            scrollXL();
        }

        
    
    }
})


$(".data-container").mouseup(function(e){
    console.log("hello");
    clearInterval(scrollXrInterval);
    clearInterval(scrollXlInterval);
    clearInterval(scrollYdInterval);
    scrollYdStarted = false;
    scrollXlStarted = false;
    scrollXrStarted = false;
});

