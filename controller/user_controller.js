import {user_db} from "../db/User_DB.js  ";
import {UserModel} from "../model/UserModel.js";


//regex pattern
const emailPattern = /(^[a-zA-Z0-9_.-]+)@([a-zA-Z]+)([\.])([a-zA-Z]+)$/;

//error alert
function showError(message) {
    Swal.fire({
        icon: 'error',
        text: message,
    });
}

//save customer
$("#signup-btn").on('click', async () => {
    const comPassword = $("#floatingPassword-2").val();
    const password = $("#floatingPassword-1").val();
    const email = $("#floatingInputSignup").val();

    if (!comPassword || !password || !email) {
        showError("Please fill in all fields correctly.");
        return;
    }

    if (!emailPattern.test(email)) {
        showError("Invalid Email!");
        return;
    }

    user_db.push(new UserModel(email, password));

    await Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'User saved successfully',
        showConfirmButton: false,
        timer: 1500,
    });

    $("#customer-window").css("display","block");
    $("#login").css("display","none");
    $("#signup-window").css("display","none");
    $("#store-window").css("display","none");
    $("#order-window").css("display","none");
    $("#all-order-window").css("display","none");
});

//update customer
$("#login-btn").on('click', async () => {
    const password = $("#floatingPassword").val();
    const email = $("#floatingInputLogin").val();

    if (!password || !email) {
        showError("Please fill in all fields correctly!");
        return;
    }

    if (!emailPattern.test(email)) {
        showError("Invalid Email!");
        return;
    }

    let index=user_db.findIndex(item => item.ordId === email);
    if (index>-1) {
        if (password===user_db[index].password){
            await Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'User logged in successfully',
                showConfirmButton: false,
                timer: 1500,
            });
            $("#customer-window").css("display","block");
            $("#login").css("display","none");
            $("#signup-window").css("display","none");
            $("#store-window").css("display","none");
            $("#order-window").css("display","none");
            $("#all-order-window").css("display","none");
        }else{
            showError("Invalid Password!");
            return;
        }
    }else{
        showError("User not found!");
        return;
    }
});