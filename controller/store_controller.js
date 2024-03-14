import {ItemModel} from "../model/ItemModel.js";
import {item_db} from "../db/Store_DB.js";

//item id make read only
$(document).ready(function () {
    function itemIdMakeReadonly() {
        $("#itm-code").prop("readonly",true);
    }
    itemIdMakeReadonly();
    generateNextItemId();
    setInterval(itemIdMakeReadonly,1000);
});

//clear add inputs
function clearAddInputs() {
    $("#itm-code").val("");
    $("#itm-name").val("");
    $("#itm-price").val("");
    $("#itm-qty").val("");
}

//load all item to table
function loadAll() {
    $("#itm-tbl-body").empty();
    item_db.map((item, index) => {
        let item_row = `<tr><td class="itemId">${item.itemId}</td><td class="itemName">${item.itemName}</td><td class="qtv">${item.qtv}</td><td class="price">${item.price}</td></tr>`;
        $("#itm-tbl-body").append(item_row);
    })
}

//error alert
function showError(message) {
    Swal.fire({
        icon: 'error',
        text: message,
    });
}

// validation patterns
const namePattern = /^[A-Za-z\s\-']+$/;
const nameLengthPattern = /^[A-Za-z\s\-']{3,15}$/;
const pricePattern = /^\d+(\.\d{2})?$/;
var quantityPattern = /^\d+$/;

//save item
$("#itm-save").on('click', async () => {
    if (!$("#itm-code").val() || !$("#itm-name").val() || !$("#itm-price").val() || !$("#itm-qty").val()) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!namePattern.test($("#itm-name").val())) {
        showError("Name must start with a letter and can only include letters, hyphens, and apostrophes.");
        return;
    }

    if (!nameLengthPattern.test($("#itm-name").val())) {
        showError("Name must be 3 to 15 characters long.");
        return;
    }

    if (!pricePattern.test($("#itm-price").val())) {
        showError("invalid price, Enter only numbers.( maximum 2 cents )");
        return;
    }

    if (!quantityPattern.test($("#itm-qty").val())) {
        showError("Invalid quantity, Enter only whole numbers");
        return;
    }

    item_db.push(new ItemModel($("#itm-code").val(), $("#itm-name").val(), $("#itm-price").val(), $("#itm-qty").val()));
    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'item saved successfully',
        showConfirmButton: false,
        timer: 1500
    });
    await loadAll();
    await clearAddInputs();
    await generateNextItemId();
});

//clicked raw set to input fields
let item_id;
$("#itm-tbl-body").on('click', 'tr', function () {
    $("#itm-code").val($(this).find(".itemId").text());
    $("#itm-name").val($(this).find(".itemName").text());
    $("#itm-price").val($(this).find(".price").text());
    $("#itm-qty").val($(this).find(".qtv").text());
    item_id = $(this).find(".itemId").text();
});

//update item
$("#itm-update").on('click', async () => {
    if (!$("#itm-code").val() || !$("#itm-name").val() || !$("#itm-price").val() || !$("#itm-qty").val()) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!namePattern.test($("#itm-name").val())) {
        showError("Name must start with a letter and can only include letters, hyphens, and apostrophes.");
        return;
    }

    if (!nameLengthPattern.test($("#itm-name").val())) {
        showError("Name must be 3 to 15 characters long.");
        return;
    }

    if (!pricePattern.test($("#itm-price").val())) {
        showError("invalid price, Enter only numbers.( maximum 2 cents )");
        return;
    }

    if (!quantityPattern.test($("#itm-qty").val())) {
        showError("Invalid quantity, Enter only whole numbers");
        return;
    }

    item_db[item_db.findIndex(item => item.itemId === $("#itm-code").val())] =  new ItemModel($("#itm-code").val(), $("#itm-name").val(),$("#itm-price").val(), $("#itm-qty").val());

    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'item updated successfully',
        showConfirmButton: false,
        timer: 1500
    });

    await loadAll();
    await clearAddInputs();
    generateNextItemId();
});

//remove item
$("#itm-delete").on('click', () => {
    item_db.splice(item_db.findIndex(item => item.itemId === item_id), 1);
    loadAll();
    clearAddInputs();
});

//load all data
$("#item-crudButtons>button[type='button']").eq(3).on('click', () => {
    // loadAll();
});

//generate next item id
function generateNextItemId() {
    $("#itm-code").val("I00"+(item_db.length + 1));
}

//generate next item id when click register button
$("#item-crudButtons>button").eq(0).on('click', () => {
    generateNextItemId();
});

//search item
$("#store-search").on("input", function () {
    $("#itm-tbl-body").empty();
    item_db.map((item, index) => {
        if(item.itemId.toLowerCase().startsWith($("#store-search").val().toLowerCase()) || item.itemName.toLowerCase().startsWith($("#store-search").val().toLowerCase())) {
            $("#itm-tbl-body").append(`<tr><td class="itemId">${item.itemId}</td><td class="itemName">${item.itemName}</td><td class="price">${item.price}</td><td class="qtv">${item.qtv}</td></tr>`);
        }
    })
});
