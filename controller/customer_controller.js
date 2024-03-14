// customer db
import {CustomerModel} from "../model/CustomerModel.js";
import {customer_db} from "../db/Customer_DB.js";

// clear inputs
function clearInputs() {
    $("#customer-address").val("");
    $("#customer-name").val("");
    $("#customer-nic").val("");
    $("#customer-sal").val("");
    $("#customer-search").val("");
}

// load all customers to table
function loadAll() {
    $("#customer-t-body").empty();
    customer_db.map((item, index) => {
        let customer =
            `<tr><td class="customer-name">${item.name}</td><td class="customer-nic">${item.nic}</td><td class="address">${item.address}</td><td class="salary">${item.contact}</td></td></tr>`
        $("#customer-t-body").append(customer);
    })
}

//regex pattern
const namePattern = /^[A-Za-z\s\-']+$/;
const nameLengthPattern = /^[A-Za-z\s\-']{3,20}$/;
const nicPattern = /^\d{12}(v)?$/;
const addressPattern = /^[A-Za-z0-9'\/\.\,  ]{5,}$/;
const phoneNumberPattern = /^(07[0125678]\d{7})$/;

//error alert
function showError(message) {
    Swal.fire({
        icon: 'error',
        text: message,
    });
}

//save customer
$("#c-save-btn").on('click', async () => {
    const customerCont = $("#customer-sal").val();
    const customerName = $("#customer-name").val();
    const customerNic = $("#customer-nic").val();
    const address = $("#customer-address").val();

    if (!customerCont || !customerName || !customerNic || !address) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!namePattern.test(customerName)) {
        showError("Name must start with a letter and can only include letters, hyphens, and apostrophes.");
        return;
    }

    if (!nameLengthPattern.test(customerName)) {
        showError("Name must be 3 to 20 characters long.");
        return;
    }

    if (!nicPattern.test(customerNic)) {
        showError("Enter a valid NIC number (e.g., 200224000741 or 200224000741v).");
        return;
    }

    if (!addressPattern.test(address)) {
        showError("Enter a valid address.");
        return;
    }

    if (!phoneNumberPattern.test(customerCont)) {
        showError("Enter a valid phone number (e.g., 0772461021).");
        return;
    }

    customer_db.push(new CustomerModel(customerName, customerNic,address,  customerCont));

    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Customer saved successfully',
        showConfirmButton: false,
        timer: 1500,

    });

    await clearInputs();
    await loadAll();
});

// clicked raw set to input fields
let cus_nic;
$("#customer-t-body").on('click', ("tr"), function () {
    $("#customer-name").val($(this).find(".customer-name").text());
    $("#customer-nic").val($(this).find(".customer-nic").text());
    $("#customer-address").val($(this).find(".address").text());
    $("#customer-sal").val($(this).find(".salary").text());
    cus_nic = $(this).find(".nic").text();
});

//update customer
$("#c-update-btn").on('click', () => {
    const customerCont = $("#customer-sal").val();
    const customerName = $("#customer-name").val();
    const customerNic = $("#customer-nic").val();
    const address = $("#customer-address").val();

    if (!customerCont || !customerName || !customerNic || !address) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!namePattern.test(customerName)) {
        showError("Name must start with a letter and can only include letters, hyphens, and apostrophes.");
        return;
    }

    if (!nameLengthPattern.test(customerName)) {
        showError("Name must be 3 to 20 characters long.");
        return;
    }

    if (!nicPattern.test(customerNic)) {
        showError("Enter a valid NIC number (e.g., 200224000741 or 200224000741v).");
        return;
    }

    if (!addressPattern.test(address)) {
        showError("Enter a valid address.");
        return;
    }

    if (!phoneNumberPattern.test(customerCont)) {
        showError("Enter a valid phone number (e.g., 0772461021).");
        return;
    }

    customer_db[customer_db.findIndex(item => item.nic === customerNic)] = new CustomerModel(customerName, customerNic,address,  customerCont);
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Customer updated successfully',
        showConfirmButton: false,
        timer: 1500,
    });
    loadAll();
    clearInputs()
});

// delete customer
$("#c-crudButtons>button[type='button']").eq(2).on('click', () => {

});

$("#c-delete-btn").on('click', () => {
    customer_db.splice(customer_db.findIndex(item => item.nic === cus_nic), 1);
    loadAll();
    clearInputs();
});

//search customer
$("#customer-search").on("input", function () {
    $("#customer-t-body").empty();
    customer_db.map((item, index) => {
        if(item.nic.toLowerCase().startsWith($("#customer-search").val().toLowerCase()) || item.name.toLowerCase().startsWith($("#customer-search").val().toLowerCase()) || item.address.toLowerCase().startsWith($("#customer-search").val().toLowerCase())) {
            $("#customer-t-body").append(`<tr><td class="customer-name">${item.name}</td><td class="customer-nic">${item.nic}</td><td class="address">${item.address}</td><td class="salary">${item.contact}</td></td></tr>`);
        }
    })
});
$("#customer-search-btn").on("click", function () {
    $("#customer-t-body").empty();
    customer_db.map((item, index) => {
        if(item.nic.toLowerCase()===($("#customer-search").val().toLowerCase()) || item.name.toLowerCase()===($("#customer-search").val().toLowerCase()) || item.address.toLowerCase()===($("#customer-search").val().toLowerCase())) {
            $("#customer-t-body").append(`<tr><td class="customer-name">${item.name}</td><td class="customer-nic">${item.nic}</td><td class="address">${item.address}</td><td class="salary">${item.contact}</td></td></tr>`);
        }
    })
});
