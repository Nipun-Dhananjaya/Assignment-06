import {order_db} from "../db/Order_DB.js";
import {item_db} from "../db/Store_DB.js";
import {customer_db} from "../db/Customer_DB.js";
import {order_items_db} from "../db/Order_Items_DB.js";
import {OrderModel} from "../model/OrderModel.js";
import {OrderItemModel} from "../model/OrderItemModel.js";
import {ItemModel} from "../model/ItemModel.js";
import {CustomerModel} from "../model/CustomerModel.js";

//error alert
function showError(message) {
    Swal.fire({
        icon: 'error',
        text: message,
    });
}

//realtime date date input
$(document).ready(function () {
    function updateInputs() {
        $("#ord-id").prop("readonly", true);
        $("#ord-date").prop("readonly", true);
        $("#cust-name").prop("readonly", true);
        $("#cust-add").prop("readonly", true);
        $("#cust-cont").prop("readonly", true);
        $("#itm-desc").prop("readonly", true);
        $("#item-price").prop("readonly", true);
        $("#itm-qty-on-hand").prop("readonly", true);
        $("#balance").prop("readonly", true);
    }
    function updateDropdowns() {
        var now = new Date();
        var year = now.getFullYear();
        var month = (now.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
        var day = now.getDate().toString().padStart(2, '0'); // Add leading zero if needed

        var formattedDate = `${year}-${month}-${day}`;

        $("#ord-date").val(formattedDate);

        var dropdownMenuCust = document.getElementById('dropdown-menu-cusID');
        var existingItems = {}; // Object to store existing items

        // Clear previous dropdown items
        dropdownMenuCust.innerHTML = "";

        customer_db.forEach(function(item) {
            if (!existingItems[item.nic]) {
                existingItems[item.nic] = true;
                var listItem = document.createElement('li');
                var anchor = document.createElement('a');
                anchor.href = '#';
                anchor.classList.add('dropdown-item');
                anchor.textContent = item.nic;

                listItem.appendChild(anchor);

                dropdownMenuCust.appendChild(listItem);

                anchor.addEventListener('click', function(event) {
                    event.preventDefault();
                    var selectedValue = this.dataset.value;
                    var selectedItem = this.textContent;
                    document.getElementById('cust-id').textContent = selectedItem;
                    $("#cust-name").val(item.name);
                    $("#cust-add").val(item.address);
                    $("#cust-cont").val(item.contact);
                });
            }
        });

        var dropdownMenuItem = document.getElementById('dropdown-menu-itmId');
        existingItems = {}; // Reset existing items for item dropdown

        // Clear previous dropdown items
        dropdownMenuItem.innerHTML = "";

        item_db.forEach(function(item) {
            if (!existingItems[item.itemId]) {
                existingItems[item.itemId] = true; // Mark item as existing
                var listItem = document.createElement('li');
                var anchor = document.createElement('a');
                anchor.href = '#';
                anchor.classList.add('dropdown-item');
                anchor.textContent = item.itemId;

                listItem.appendChild(anchor);

                dropdownMenuItem.appendChild(listItem);

                anchor.addEventListener('click', function(event) {
                    event.preventDefault();
                    var selectedValue = this.dataset.value;
                    var selectedItem = this.textContent;
                    document.getElementById('item-code').textContent = selectedItem;
                    $("#item-price").val(item.price);
                    $("#itm-desc").val(item.itemName);
                    $("#itm-qty-on-hand").val(item.qtv);
                });
            }
        });
    }
    updateInputs();
    generateNextOrderId();
    updateDropdowns();
    setInterval(updateInputs, 1000);
    setInterval(updateDropdowns, 1000);
});

// clear inputs
function clearInputs() {
    $("#cust-name").val(""),
        $("#cust-add").val(""),
        $("#cust-cont").val(""),
        $("#item-price").val(""),
        $("#itm-desc").val(""),
        $("#itm-qty-on-hand").val(""),
        $("#item-qty").val(""),
        $("#balance").val(""),
        $("#discount").val(""),
        $("#cash").val(""),
        $("#subtot").text("0.00 /="),
        $("#tot").text("0.00 /=")
}

//check buying qty is have in stock
function checkBuyingQty() {
    let on_hand_qty = parseInt($("#itm-qty-on-hand").val());
    let buying_qty = parseInt($("#item-qty").val());

    if (isNaN(on_hand_qty) || isNaN(buying_qty)) {
        return false; // Handle non-numeric input
    }

    if (buying_qty < 1) {
        return false; // Buying quantity is less than 1
    }

    if (buying_qty > on_hand_qty) {
        return false; // Buying quantity is greater than on-hand quantity
    }

    return true; // Buying quantity is within the acceptable range
}
//check buying item is have in order list
function isAlreadyBuying(itemId,newQty,price) {
    let index=order_items_db.findIndex(item => item.itemId === itemId);
    if (index>-1) {
        order_items_db[index].qtv = parseFloat(order_items_db[index].qtv) + parseFloat(newQty);
        order_items_db[index].price = parseFloat(order_items_db[index].price) + (parseFloat(newQty) * parseFloat(price));
        return true;
    }
    return false; // item not in past list
}

//generate next order-id
function generateNextOrderId() {
    $("#ord-id").val("O00"+(order_db.length + 1));
}

// load all order items
function loadAllItems() {
    $("#order-item-table-body").empty();
    order_items_db.map((item, index) => {
        $("#order-item-table-body").append(`<tr><td class="item-name">${item.itemName}</td><td class="item-id">${item.itemId}</td><td class="qty">${item.qtv}</td><td class="price">${item.price}</td></tr>`);
    });
}

//reduce item count
function reduceItemCount(itemId,Qty) {
    let index = item_db.findIndex(item => item.itemId === itemId);
    item_db[index].qtv = parseInt(item_db[index].qtv) - parseInt(Qty);
}

//add item
let total=0;
$("#add-itm-btn").on('click', async () => {
    if(!checkBuyingQty()) {
        $("#item-qty").css("border","2px solid red");
        showError("Not valid quantity..");
        return;
    }

    if (!isAlreadyBuying(($("#item-code").text()), $("#item-qty").val(),$("#item-price").val())===true) {
        order_items_db.push(new OrderItemModel($("#item-code").text(), $("#itm-desc").val(), $("#item-qty").val(), (parseFloat($("#item-price").val()) * parseFloat($("#item-qty").val()))));
        await Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'item added!',
            showConfirmButton: false,
            timer: 1500
        });
        total=parseFloat($("#tot").text());
        total+=(parseFloat($("#item-price").val()) * parseFloat($("#item-qty").val()));
        $("#tot").text(total);

        await loadAllItems();
        await reduceItemCount($("#item-code").text(),$("#item-qty").val());
        $("#item-qty").val("");
        return;
    }
    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'item quantity changed!',
        showConfirmButton: false,
        timer: 1500
    });
    total=parseFloat($("#tot").text());
    total+=(parseFloat($("#item-price").val()) * parseFloat($("#item-qty").val()));
    $("#tot").text(total);

    await loadAllItems();
    await reduceItemCount($("#item-code").text(),$("#item-qty").val());
    $("#item-qty").val("");
});


//clicked raw set to input fields
let item_id;
$("#order-item-table-body").on('click', 'tr', async function () {
    item_id = $(this).find(".item-id").text();
    let index=item_db.findIndex(item => item.itemId === item_id);
    let indexOfOrdDb=order_db.findIndex(item => item.ordId === $("#ord-id").val());
    $("#item-code").text($(this).find(".item-id").text());
    $("#itm-desc").val($(this).find(".item-name").text());
    $("#item-price").val(item_db[index].price);
    let qty=parseFloat(item_db[index].qtv) + parseFloat($(this).find(".qty").text());
    item_db[index].qtv=qty;
    $("#itm-qty-on-hand").val(item_db[index].qtv);
    let indexOdItem=order_items_db.findIndex(item => item.itemId === item_id);
    order_items_db.splice(indexOdItem,1);
    $("#subtot").text("0.00 /=");
    let tot=parseFloat($("#tot").text())-(parseFloat($(this).find(".qty").text())*parseFloat(item_db[index].price));
    $("#tot").text(tot);
    order_db[indexOfOrdDb].total=tot;
    await loadAllItems();
});

//action on discount textfield
$("#discount").on("keyup", function(event) {
    if (event.keyCode === 13) {
        let tot=$("#tot").text();
        let discountAmount = (parseFloat(tot) * parseFloat($("#discount").val())) / 100;
        $("#subtot").text(tot - discountAmount);
    }
});
//action on cash textfield
$("#cash").on("keyup", function(event) {
    if (event.keyCode === 13) {
        let subtotal=$("#subtot").text();
        console.log(parseFloat($("#cash").val()));
        console.log(subtotal);
        $("#balance").val(parseFloat($("#cash").val())-parseFloat(subtotal));
    }
});

//purchase order
$("#purchase").on('click', async () => {
    if(order_items_db.length===0) {
        showError("Item list is empty");
        return;
    }
    if($("#discount").val()==="") {
        showError("Discount field is empty");
        return;
    }
    if($("#cash").val()==="") {
        showError("Cash field is empty");
        return;
    }
    if($("#balance").val()==="") {
        showError("Balance field is empty");
        return;
    }
    console.log($("#cust-id").text());
    let indexOdCust=customer_db.findIndex(item => item.nic ===  $("#cust-id").text());
    console.log(indexOdCust);

    let temp=[];
    for (let i = 0; i < order_items_db.length; i++) {
        temp.push(order_items_db[i]);
    }

    order_db.push(new OrderModel($("#ord-id").val(), $("#ord-date").val(), customer_db[indexOdCust],temp,
        parseFloat($("#tot").text()),parseFloat($("#discount").val()),parseFloat($("#subtot").text())));
    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Order added!',
        showConfirmButton: false,
        timer: 1500
    });
    clearInputs();
    generateNextOrderId();
    order_items_db.length=0;
    loadAllItems();
});
//purchase item
$("#all-orders-btn").on('click', async () => {
    var tableBody = document.getElementById("all-order-tbl");
    var html = "";

    order_db.forEach(function(order) {
        html += "<tr>";
        html += "<td>" + order.ordId + "</td>";
        html += "<td><ul>";
        order.items.forEach(function(item) {
            html += "<li>" + item.itemId + "</li>";
        });
        html += "</ul></td>";
        html += "<td><ul>";
        order.items.forEach(function(item) {
            html += "<li>" + item.itemName + "</li>";
        });
        html += "</ul></td>";
        html += "<td><ul>";
        order.items.forEach(function(item) {
            html += "<li>" + item.qtv + "</li>";
        });
        html += "</ul></td>";
        html += "<td>" + order.cust.nic + "</td>";
        html += "<td>" + order.cust.name + "</td>";
        html += "</tr>";
    });

    tableBody.innerHTML = html;

    var rows = document.querySelectorAll("#all-order-tbl tr");
    rows.forEach(function(row) {
        row.addEventListener("click", function() {
            var cells = row.getElementsByTagName("td");
            var rowData = [];
            for (var i = 0; i < cells.length; i++) {
                rowData.push(cells[i].innerText);
            }
            console.log("Clicked row data:", rowData);
            let indexOrd=order_db.findIndex(item => item.ordId ===  rowData[0]);
            $("#ord-id").val(order_db[indexOrd].ordId),
            $("#ord-date").val(order_db[indexOrd].ordDate),
            $("#cust-id").text(order_db[indexOrd].cust.nic),
            $("#cust-name").val(order_db[indexOrd].cust.name),
                $("#cust-add").val(order_db[indexOrd].cust.address),
                $("#cust-cont").val(order_db[indexOrd].cust.contact),
                $("#discount").val(order_db[indexOrd].discount),
                $("#subtot").text(order_db[indexOrd].subtot),
                $("#tot").text(order_db[indexOrd].total);
            //order_items_db=order_db[indexOrd].items;
            for (let i = 0; i < order_db[indexOrd].items.length; i++) {
                order_items_db.push(order_db[indexOrd].items[i]);
            }
            loadAllItems();
            $("#customer-window").css("display","none");
            $("#login").css("display","none");
            $("#signup-window").css("display","none");
            $("#store-window").css("display","none");
            $("#order-window").css("display","block");
            $("#all-order-window").css("display","none");
        });
    });
});

//Update order
$("#update-ord").on('click', async () => {
    if(order_items_db.length===0) {
        showError("Item list is empty");
        return;
    }
    if($("#discount").val()==="") {
        showError("Discount field is empty");
        return;
    }
    if($("#cash").val()==="") {
        showError("Cash field is empty");
        return;
    }
    if($("#balance").val()==="") {
        showError("Balance field is empty");
        return;
    }
    console.log($("#cust-id").text());
    let indexOdCust=customer_db.findIndex(item => item.nic ===  $("#cust-id").text());
    console.log(indexOdCust);

    let temp=[];
    for (let i = 0; i < order_items_db.length; i++) {
        temp.push(order_items_db[i]);
    }

    order_db[order_db.findIndex(item => item.ordId === $("#ord-id").val())] = new OrderModel($("#ord-id").val(), $("#ord-date").val(), customer_db[indexOdCust],temp,
        parseFloat($("#tot").text()),parseFloat($("#discount").val()),parseFloat($("#subtot").text()));
    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Order updated!',
        showConfirmButton: false,
        timer: 1500
    });
    clearInputs();
    generateNextOrderId();
    order_items_db.length=0;
    loadAllItems();
});
//Delete order
$("#delete-ord").on('click', async () => {
    order_db.splice(order_db.findIndex(item => item.ordId === $("#ord-id").val()),1)
    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Do you want to remove order?',
        showConfirmButton: false,
        timer: 1500
    });
    clearInputs();
    generateNextOrderId();
    order_items_db.length=0;
    loadAllItems();
});

//Search Order
$("#all-order-search").on("input", function () {
    $("#all-order-tbl").empty();
    var tableBody = document.getElementById("all-order-tbl");
    var html = "";
    order_db.map((order, index) => {
        console.log(order.ordId)
        if(order.ordId.toLowerCase().startsWith($("#all-order-search").val().toLowerCase()) ||
            order.cust.name.toLowerCase().startsWith($("#all-order-search").val().toLowerCase())) {
            console.log(order);
            html += "<tr>";
            html += "<td>" + order.ordId + "</td>";
            html += "<td><ul>";
            order.items.forEach(function(item) {
                html += "<li>" + item.itemId + "</li>";
            });
            html += "</ul></td>";
            html += "<td><ul>";
            order.items.forEach(function(item) {
                html += "<li>" + item.itemName + "</li>";
            });
            html += "</ul></td>";
            html += "<td><ul>";
            order.items.forEach(function(item) {
                html += "<li>" + item.qtv + "</li>";
            });
            html += "</ul></td>";
            html += "<td>" + order.cust.nic + "</td>";
            html += "<td>" + order.cust.name + "</td>";
            html += "</tr>";
        }
    });

    tableBody.innerHTML = html;

    var rows = document.querySelectorAll("#all-order-tbl tr");
    rows.forEach(function(row) {
        row.addEventListener("click", function() {
            var cells = row.getElementsByTagName("td");
            var rowData = [];
            for (var i = 0; i < cells.length; i++) {
                rowData.push(cells[i].innerText);
            }
            console.log("Clicked row data:", rowData);
            let indexOrd=order_db.findIndex(item => item.ordId ===  rowData[0]);
            $("#ord-id").val(order_db[indexOrd].ordId),
                $("#ord-date").val(order_db[indexOrd].ordDate),
                $("#cust-id").text(order_db[indexOrd].cust.nic),
                $("#cust-name").val(order_db[indexOrd].cust.name),
                $("#cust-add").val(order_db[indexOrd].cust.address),
                $("#cust-cont").val(order_db[indexOrd].cust.contact),
                $("#discount").val(order_db[indexOrd].discount),
                $("#subtot").text(order_db[indexOrd].subtot),
                $("#tot").text(order_db[indexOrd].total);
            //order_items_db=order_db[indexOrd].items;
            for (let i = 0; i < order_db[indexOrd].items.length; i++) {
                order_items_db.push(order_db[indexOrd].items[i]);
            }
            loadAllItems();
            $("#customer-window").css("display","none");
            $("#login").css("display","none");
            $("#signup-window").css("display","none");
            $("#store-window").css("display","none");
            $("#order-window").css("display","block");
            $("#all-order-window").css("display","none");
        });
    });
});
$("#ord-search-btn").on("click", function () {
    $("#all-order-tbl").empty();
    var tableBody = document.getElementById("all-order-tbl");
    var html = "";
    order_db.map((order, index) => {
        if(order.ordId.toLowerCase().startsWith($("#all-order-search").val().toLowerCase()) ||
            order.cust.name.toLowerCase().startsWith($("#all-order-search").val().toLowerCase())) {
            html += "<tr>";
            html += "<td>" + order.ordId + "</td>";
            html += "<td><ul>";
            order.items.forEach(function(item) {
                html += "<li>" + item.itemId + "</li>";
            });
            html += "</ul></td>";
            html += "<td><ul>";
            order.items.forEach(function(item) {
                html += "<li>" + item.itemName + "</li>";
            });
            html += "</ul></td>";
            html += "<td><ul>";
            order.items.forEach(function(item) {
                html += "<li>" + item.qtv + "</li>";
            });
            html += "</ul></td>";
            html += "<td>" + order.cust.nic + "</td>";
            html += "<td>" + order.cust.name + "</td>";
            html += "</tr>";
        }
    });

    tableBody.innerHTML = html;

    var rows = document.querySelectorAll("#all-order-tbl tr");
    rows.forEach(function(row) {
        row.addEventListener("click", function() {
            var cells = row.getElementsByTagName("td");
            var rowData = [];
            for (var i = 0; i < cells.length; i++) {
                rowData.push(cells[i].innerText);
            }
            console.log("Clicked row data:", rowData);
            let indexOrd=order_db.findIndex(item => item.ordId ===  rowData[0]);
            $("#ord-id").val(order_db[indexOrd].ordId),
                $("#ord-date").val(order_db[indexOrd].ordDate),
                $("#cust-id").text(order_db[indexOrd].cust.nic),
                $("#cust-name").val(order_db[indexOrd].cust.name),
                $("#cust-add").val(order_db[indexOrd].cust.address),
                $("#cust-cont").val(order_db[indexOrd].cust.contact),
                $("#discount").val(order_db[indexOrd].discount),
                $("#subtot").text(order_db[indexOrd].subtot),
                $("#tot").text(order_db[indexOrd].total);
            //order_items_db=order_db[indexOrd].items;
            for (let i = 0; i < order_db[indexOrd].items.length; i++) {
                order_items_db.push(order_db[indexOrd].items[i]);
            }
            loadAllItems();
            $("#customer-window").css("display","none");
            $("#login").css("display","none");
            $("#signup-window").css("display","none");
            $("#store-window").css("display","none");
            $("#order-window").css("display","block");
            $("#all-order-window").css("display","none");
        });
    });
});
