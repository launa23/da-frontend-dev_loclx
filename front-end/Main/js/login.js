const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const main = document.getElementById('main');

    signUpButton.addEventListener('click', () => {
        main.classList.add("right-panel-active");
    });
    signInButton.addEventListener('click', () => {
        main.classList.remove("right-panel-active");
    });

    const btn_signIn = document.getElementById('btn-signIn');
    const error_mess = document.getElementById('error-mess');
    
    var isLogin = !!localStorage.getItem("token");

    function checkLogin(){
      if(isLogin){
        window.location.href = "./income.html";
      }
    };
    $(document).ready(function (){
        $('.DA-icon-eyes').click(function () {
            $(this).toggleClass('fa-eye-slash fa-eye');
            var passwordInput = $('#signIn_password');
            var passwordFieldType = passwordInput.attr('type');
            if (passwordFieldType === 'password') {
                passwordInput.attr('type', 'text');
            } else {
                passwordInput.attr('type', 'password');
            }
        });

        // Xử lý đăng ký
        $('#signUp_form').submit(function(event) {
            event.preventDefault(); // Ngăn chặn gửi form mặc định
            var dob = $('#NgaySinh').val();
            // Tạo một đối tượng Date từ ngày tháng nhập vào
            var date = new Date(dob);
            // Lấy ngày hôm nay
            var today = new Date();
            // So sánh ngày tháng nhập vào với ngày hôm nay
            if (date > today) {
              $('#signUp-error-dob').addClass('DA-show');
            } else {
              $('#signUp-error-dob').removeClass('DA-show');
            };

            var name = $('#HoVaTen').val();
            var dob = $('#NgaySinh').val();
            var email = $('#email').val();
            var phone = $('#Sdt').val();
            var username = $('#signUp_username').val();
            var password = $('#signUp_password').val();
            console.log(password);
            var data = {
                username: username,
                password: password,
                phoneNumber: phone,
                email: email,
                name: name,
                dateOfBirth: dob
            };
            
            var pswd = $('#signUp_password').val();
            var rpswd = $('#signUp_rpassword').val();
            if(pswd != rpswd) {
              $('#signUp-error-password').addClass('DA-show');
            }
            else{
              console.log(data)
              $('#signUp-error-password').removeClass('DA-show');
              $.ajax({
                url: 'http://localhost:8080/user/create',
                type: 'POST',
                data: JSON.stringify(data),
                processData: false,
                contentType: 'application/json',
                success: function(response, textStatus, xhr) {
                  // Xử lý phản hồi thành công
                  // Đặt lại các ô input là rỗng
                  $('.DA-toast').addClass('DA-show-flex');
                  $('#HoVaTen').val('');
                  $('#NgaySinh').val('');
                  $('#email').val('');
                  $('#Sdt').val('');
                  $('#signUp_username').val('');
                  $('#signUp_password').val('');
                  $('#signUp_rpassword').val('');
                  main.classList.remove("right-panel-active");
                  setTimeout(function(){
                    $('.DA-toast').removeClass('DA-show-flex');
                  }, 4000);
                },
                error: function(error, xhr, status) {
                  console.log(xhr);
                  $('#signUp-error-name').addClass('DA-show');
                }
              });
            }
        });

        // xử lý đăng nhập
        $('#signIn_form').submit(function(event) {
            event.preventDefault(); // Ngăn chặn gửi form mặc định
            var username = $('#signIn_username').val();
            var password = $('#signIn_password').val();
            
            const formData = new FormData();
                formData.append('username', username);
                formData.append('password', password);
            console.log(formData);
            $.ajax({
                url: "http://localhost:8080/login",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    // Xử lý phản hồi từ máy chủ
                    var token = response.token;
                    localStorage.setItem('token', token);
                    error_mess.classList.remove("DA-show");
                    isLogin = true;
                    checkLogin();
                },
                error: function(xhr, status, error) {
                  // Xử lý lỗi
                  console.log(xhr.status);
                  error_mess.classList.add("DA-show");
                  $('#signIn_password').val('');
                }
              });
        });
        $('.toast__close').click(function(){
          $('.DA-toast').removeClass('DA-show-flex');
         });
  });
  sessionStorage.clear();