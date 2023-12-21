
    var isLogin = !!localStorage.getItem("token");
    const TOKEN = localStorage.getItem("token");

    var infoUser;

    function checkLogin(){
        if(isLogin != 1){
            window.location.href = "./login.html";
        }
        else{
            const DA_token = localStorage.getItem("token");
            $.ajax({
                url: 'http://localhost:8080/user/current',
                type: 'GET',
                headers: {
                    "Authorization": DA_token
                },
                // data: JSON.stringify(data),
                processData: false,
                contentType: 'application/json',
                success: function(response) {
                    infoUser = response;
                   renderData(response);
                   if(response.parent != ""){
                    $('#RemoveParent').addClass('DA-showRemoveBtn');
                   }
                   else{
                    $('#RemoveParent').removeClass('DA-showRemoveBtn');
                   }
                },
                    error: function(error, xhr) {

                }
              });
        }
    };
    function renderData(res){
        $('#DA-HoVaTen').text(res.name);
        $('#identifyID').text(res.id);
        $('#fullname').text(res.name);
        $('#DA-role').text(res.role);
        if(res.role == '[ROLE_user]'){
            $('#DA-role').text('Người dùng');
        }
        else{
        $('#DA-role').text('Admin');
        }
        if(res.enabled == 1){
            $('#DA-enable').text('Hoạt động');
        }
        else{
            $('#DA-enable').text('Không hoạt động');
        }
        if(res.identifyCode == null){
            $('#DA-CCCD').text('Chưa có');
        }
        else{
            $('#DA-CCCD').text(res.identifyCode);
        }
        $('#DA-DoB').text(formatDefauleDate(res.dateOfBirth));
        $('#DA-phoneNumber').text(res.phoneNumber);
        $('#DA-Email').text(res.email);
        if(res.parent == ""){
            $('#DA-parentId').text('Không có');
        }
        else{
        $('#DA-parentId').text(res.parent);
        }
        $('#DA-money').text(res.money.toLocaleString());
    };
    // Đăng xuất
    $('#DA-logout').click(function () {
        localStorage.removeItem('token');
        window.location.href = "./login.html";
    });


    $('#RemoveParent').click(function () {
        var con = confirm("Bạn có chắc muốn xóa liên kết tài khoản parent không?");
        if(con == true) {
            $.ajax({
                url: 'http://localhost:8080/user/removeparent',
                type: 'PUT',
                headers: {
                    "Authorization": TOKEN
                },
                // data: JSON.stringify(data),
                processData: false,
                contentType: 'application/json',
                success: function(response) {
                    location.reload();
                },
                error: function(error, xhr) {
                    
                    console.log(err);
                }
            });
        }
        
    });

$('#DA-bntAddParent').click(function () {
    var idParent = $('#DA-IDParent').val();
    $.ajax({
        url: 'http://localhost:8080/user/setparent/'+idParent,
        type: 'POST',
        headers: {
            "Authorization": TOKEN
        },
        // data: JSON.stringify(data),
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            location.reload();
        },
        error: function(error, xhr) {
            $('#DA-errorAddParent').addClass('DA-show');
            $('#DA-errorAddParent').text('ID tài khoản cha không hợp lệ');
            console.log(err);
        }
    });
});
AddParent
$('#AddParent').click(function () {
    
    $('#DA-errorAddParent').removeClass('DA-show');
    $('#DA-IDParent').val("");
        
});
// Sua userInfor
$(document).ready(function() {
    getSubAccount();
    $('.fa-pen-to-square').click(function () {
        $('#editUserInfoModal').modal('show');
    });

    $('#editUserInfoModal .btn-info').click(function () {
        const userDoB = $('#userDoB').val();
        const userName = $('#userName').val();
        const userPhone = $('#userPhone').val();
        const userEmail = $('#userEmail').val();
        const userIdentifyCode = $('#userIdentifyCode').val();
        
        const DA_token = localStorage.getItem("token");

        $.ajax({
            url: 'http://localhost:8080/user/update',
            method: 'PUT',
            data: JSON.stringify({
                dateOfBirth: userDoB,
                phoneNumber: userPhone,
                email: userEmail,
                identifyCode: userIdentifyCode,
                name: userName
            }),
            processData: false,
            contentType: 'application/json',
            headers: {
                "Authorization": DA_token
            },
            success: function(response) {
                location.reload();

            },
            error: function(error) {
                
                console.error('Error updating user information:', error);
            }
        });
    });

    const DA_token = localStorage.getItem("token");
    $.ajax({
        url: 'http://localhost:8080/user/current',
        type: 'GET',
        headers: {
            "Authorization": DA_token
        },
        // data: JSON.stringify(data),
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            infoUser = response;

            $("#userDoB").val(infoUser.dateOfBirth);
            $("#userName").val(infoUser.name);
            $("#userPhone").val(infoUser.phoneNumber);
            $("#userEmail").val(infoUser.email);
            $("#userIdentifyCode").val(infoUser.identifyCode);
        },
            error: function(error, xhr) {

        }
    });
});
function getSubAccount(){
    $.ajax({
        url: 'http://localhost:8080/user/child',
        type: 'GET',
        headers: {
            "Authorization": TOKEN
        },
        // data: JSON.stringify(data),
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            response.forEach(element => {
                var htmlSnippet = `
                <div class="card mt-3 bg-info text-white">
                            <div class="card-body p-2 row">
                                <div class="col-md-4 ">
                                    <label style="font-weight: 700;">${element.id}</label>
                                    <input id="DA-idSubAcc-${element.id}" value=${element.id} style="display: none;">
                                </div>
                                <div class="col-md-6 p-0">
                                    <label style="font-size: 12px; font-weight: 600; color: #ffff00;">${element.name}</label>
                                </div>
                                <div class="col-md-2 p-0">
                                    <label style="margin-right: 8px;" id="DA-btnShowSubAcc-${element.id}"><i class="fa-solid fa-eye"></i></label>
                                    <a href=""><i class="fa-solid fa-trash"></i></a>
                                </div>
                            </div>
                        </div>
                `;
                $('#DA-listSubAccount').append(htmlSnippet);
                $(`#DA-btnShowSubAcc-${element.id}`).on("click", function() {
                    console.log(element.id);
                    sessionStorage.setItem("IDSub", element.id);
                    sessionStorage.setItem("NameSub", element.name);
                    if(element.identifyCode == null){
                        sessionStorage.setItem("CCCDSub", "Chưa nhập CCCD");
                    }
                    else{
                        sessionStorage.setItem("CCCDSub", element.identifyCode);
                    }
                    sessionStorage.setItem("DOBSub", element.dateOfBirth);
                    sessionStorage.setItem("EmailSub", element.email);
                    sessionStorage.setItem("SDTSub", element.phoneNumber);
                    if(element.money == null){
                        sessionStorage.setItem("SoDuSub", "0");
                    }
                    else{
                        sessionStorage.setItem("SoDuSub", element.money.toLocaleString());
                    }
                    window.location.href = "./sub_account.html";
                });
            });
            
        },
            error: function(error, xhr) {
        }
    });
}
function formatDefauleDate(param) {
    var date = new Date(param);
  
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
  
    var formattedDateTime = day + "/" + month + "/" + year;
    return formattedDateTime; 
  }





