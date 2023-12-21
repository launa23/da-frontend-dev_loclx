var isLogin = !!localStorage.getItem("token");
const TOKEN = localStorage.getItem("token");
var idSub = sessionStorage.getItem('IDSub');

function checkLogin(){
    if(isLogin != 1){
        // window.location.href = "./login.html";
        var htmlSnippet = `
            <a class="nav-link text-white" href="./login.html" id="DA-HoVaTen">Đăng nhập</a>
                `;
        $('#DA-loginCheck').html(htmlSnippet);
    }
};
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    datasets: [
      {
        label: 'Thu nhập',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Chi Tiêu',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        stacked: false
      },
      y: {
        stacked: false
      }
    }
  }
});
$(document).ready(function () {
    setDefaultFirstDate();
    setDefaultFinallyDate();
    getIncomeSubByDate();
    getOutcomeSubByDate();
    getName();
    getInfoSubToSession();
    getAndCalculateTotalIncomeSub();
    getAndCalculateTotalOutcomeSub();
    // compareIncomeWithOutcome();
    getAndhandleTransactionByMonth();
});

$('#DA-btnFilterIncome').click(function () {
    getIncomeSubByDate();
});
$('#DA-btnFilterOutcome').click(function () {
    getOutcomeSubByDate();
});
$('#DA-btnSwitch').click(function () {
    if(myChart.config.type == 'line'){
        myChart.config.type = 'bar';
    }
    else{
        myChart.config.type = 'line';
    }
    myChart.update();
});

// $('#DA-btnClose').click(function () {
//     console.log($('#DA-checkBox').val());
// });
// Lấy tên người dùng hiện tại
function getName(){
    $.ajax({
        url: 'http://localhost:8080/user/current',
        type: 'GET',
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            $('#DA-HoVaTen').text(response.name);
        },
            error: function(error, xhr) {
        }
    });
}
// Hàm tính tổng thu nhập của sub acc
function getAndCalculateTotalIncomeSub(){
    var idSub = sessionStorage.getItem('IDSub');
    $.ajax({
        url: 'http://localhost:8080/transaction/statistic/income?start_date=2003-08-19 01:00:00&type=income&child=' + idSub,
        type: 'GET',
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            // console.log(response);
            var tong = 0;
            for(var i=0; i<response.length; i++) {
                tong += response[i].amount;
            }
            $('#totalIncomeSub').text(tong.toLocaleString());
        },
            error: function(error, xhr) {
        }
    });
}
// Hàm tính tổng chi tiêu sub acc
function getAndCalculateTotalOutcomeSub(){
    $.ajax({
        url: 'http://localhost:8080/transaction/statistic/outcome?start_date=2003-08-19 01:00:00&type=outcome&child=' + idSub,
        type: 'GET',
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            // console.log(response);
            var tong = 0;
            for(var i=0; i<response.length; i++) {
                tong += response[i].amount;
            }
            $('#totalOutcomeSub').text(tong.toLocaleString());
        },
            error: function(error, xhr) {
        }
    });
}
// Hàm lấy thu nhập của sub acc theo time
function getIncomeSubByDate(){
    $('#DA-listIncomeSub').empty();
    var dateStart = $('#DA-filterIncomeStart').val();
    var dateEnd = $('#DA-filterIncomeEnd').val();
    $.ajax({
        url: 'http://localhost:8080/transaction/statistic/income?start_date='+dateStart+' 01:00:00&end_date='+dateEnd+' 23:00:00&type=income&child=' + idSub,
        type: 'GET',
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            response.sort((a, b) => {
                const dateA = new Date(a.time);
                const dateB = new Date(b.time);
                return dateB - dateA;
              });
            console.log(response);
            if(response.length > 0) {
                response.forEach(element => {
                    var htmlSnippet = `
                    <div class="card DA-border-radius mb-2 bg-dark">
                        <label class="DA-dateTransaction">${formatDefauleDate(element.time)}</label>
                        <div class="row card-body padding-12px">
                            <div class="col-sm-7" style="line-height: 62px;">
                                <div class="row">
                                    <div class="img-icon DA-today col-md-3">
                                        <img src="${element.icon}" alt="">
                                    </div>
                                    <div class="DA-name-cate col-md-9" style="display: flex; align-items: center; padding: 0px;">
                                        <h6 style="margin: 0px; font-size: 14px; color: #fff;">${element.desc}</h6>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-5 pr-0">
                                <label class="DA-title ">${element.category}</label>
                                <div style="float: inline-end;">
                                    <h5 style="display: inline-block; color: rgb(15, 216, 0);">${element.amount.toLocaleString()}</h5>
                                    <u style="color: yellow;">đ</u>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    $('#DA-listIncomeSub').append(htmlSnippet);
                });
            }
            else{
                $('#DA-listIncomeSub').append('<center style="color: #4b4f55;">Không có khoản thu nào</center>');
            }
        },
            error: function(error, xhr) {
        }
    });
}

// function compareIncomeWithOutcome(){
//     var checkHide = sessionStorage.getItem('checkHide');
//     $.ajax({
//         url: 'http://localhost:8080/transaction/statistic/outcome?start_date=2003-08-19 01:00:00&type=outcome&child=' + idSub,
//         type: 'GET',
//         headers: {
//             "Authorization": TOKEN
//         },
//         processData: false,
//         contentType: 'application/json',
//         success: function(response) {
//             var tongOut = 0;
//             for(var i=0; i<response.length; i++) {
//                 tongOut += response[i].amount;
//             }
//             $.ajax({
//                 url: 'http://localhost:8080/transaction/statistic/income?start_date=2003-08-19 01:00:00&type=income&child=' + idSub,
//                 type: 'GET',
//                 headers: {
//                     "Authorization": TOKEN
//                 },
//                 processData: false,
//                 contentType: 'application/json',
//                 success: function(response) {
//                     var tongIn = 0;
//                     for(var i=0; i<response.length; i++) {
//                         tongIn += response[i].amount;
//                     }
//                     if(tongIn > tongOut && checkHide != 1){
//                         $('#DA-overlayNullorMoney').addClass('DA-show');
//                         $('#modalMoneyStart').addClass('DA-show');
//                     }
//                 },
//                     error: function(error, xhr) {
//                 }
//             });
//         },
//             error: function(error, xhr) {
//         }
//     });
// }
// Hàm so sánh tổng thu và tổng chi
function getAndCalculateTotalOutcomeSub(){
    $.ajax({
        url: 'http://localhost:8080/transaction/statistic/outcome?start_date=2003-08-19 01:00:00&type=outcome&child=' + idSub,
        type: 'GET',
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            // console.log(response);
            var tong = 0;
            for(var i=0; i<response.length; i++) {
                tong += response[i].amount;
            }
            $('#totalOutcomeSub').text(tong.toLocaleString());
        },
            error: function(error, xhr) {
        }
    });
}

// Hàm lấy chi chi của sub acc theo time
function getOutcomeSubByDate(){
    $('#DA-listOutcomeSub').empty();
    var dateStart = $('#DA-filterOutcomeStart').val();
    var dateEnd = $('#DA-filterOutcomeEnd').val();
    $.ajax({
        url: 'http://localhost:8080/transaction/statistic/Outcome?start_date='+dateStart+' 01:00:00&end_date='+dateEnd+' 23:00:00&type=Outcome&child=' + idSub,
        type: 'GET',
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: 'application/json',
        success: function(response) {
            response.sort((a, b) => {
                const dateA = new Date(a.time);
                const dateB = new Date(b.time);
                return dateB - dateA;
              });
            console.log(response);
            if(response.length > 0) {
                response.forEach(element => {
                    var htmlSnippet = `
                    <div class="card DA-border-radius mb-2 bg-dark">
                        <label class="DA-dateTransaction">${formatDefauleDate(element.time)}</label>
                        <div class="row card-body padding-12px">
                            <div class="col-sm-7" style="line-height: 62px;">
                                <div class="row">
                                    <div class="img-icon DA-today col-md-3">
                                        <img src="${element.icon}" alt="">
                                    </div>
                                    <div class="DA-name-cate col-md-9" style="display: flex; align-items: center; padding: 0px;">
                                        <h6 style="margin: 0px; font-size: 14px; color: #fff;">${element.desc}</h6>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-5 pr-0">
                                <label class="DA-title ">${element.category}</label>
                                <div style="float: inline-end;">
                                    <h5 style="display: inline-block; color: rgb(220,53,69);">${element.amount.toLocaleString()}</h5>
                                    <u style="color: yellow;">đ</u>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    $('#DA-listOutcomeSub').append(htmlSnippet);
                });
            }
            else{
                $('#DA-listOutcomeSub').append('<center style="color: #4b4f55;">Không có khoản chi nào</center>');
            }
        },
            error: function(error, xhr) {
        }
    });
}

// Hàm xử lý và lấy thông tin các khoản thu, chi theo tháng
function getAndhandleTransactionByMonth() {
    var firstDate = setFirstDateByYear();
    var EndDate = setFinallyDateByYear();
    $.ajax({
        url: 'http://localhost:8080/transaction/statistic/income?start_date='+firstDate+' 01:00:00&end_date='+EndDate+' 23:00:00&type=income&child=' + idSub,
        type: "GET",
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: false,
        success: function(response) {
               
        var dataMonthlyIn = filterIncomeByMonth(response);
        // console.log(dataMonthlyIn);
        $.ajax({
            url: 'http://localhost:8080/transaction/statistic/outcome?start_date='+firstDate+' 01:00:00&end_date='+EndDate+' 23:00:00&type=outcome&child=' + idSub,
            type: "GET",
            headers: {
                "Authorization": TOKEN
            },
            processData: false,
            contentType: false,
            success: function(response) {
                   
            var dataMonthlyOut = filterIncomeByMonth(response);
            // console.log(dataMonthlyOut);
            myChart.data.datasets[0].data = dataMonthlyIn;
            myChart.data.datasets[1].data = dataMonthlyOut;
            myChart.update();
    
            },
            error: function(xhr, status, error) {
              // Xử lý lỗi
              console.log(xhr.status);
            }
        });

        },
        error: function(xhr, status, error) {
          // Xử lý lỗi
          console.log(xhr.status);
        }
    });
};

// Lấy thông tin sub acc từ session
function getInfoSubToSession(){
    $('#SubHoVaTen').text(sessionStorage.getItem("NameSub"));
    $('#SubCCCD').text(sessionStorage.getItem("CCCDSub"));
    $('#SubNgaySinh').text(sessionStorage.getItem("DOBSub"));
    $('#SubEmail').text(sessionStorage.getItem("EmailSub"));
    $('#SubHoVaten').text(sessionStorage.getItem("EmailSub"));
    $('#SubSDT').text(sessionStorage.getItem("SDTSub"));
    $('#SubMoney').text(sessionStorage.getItem("SoDuSub"));
}
// Đặt thời gian mặc định là đầu tháng hiện tại
function setDefaultFirstDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = 1; // Ngày đầu tháng
    
    var defaultValue = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    document.getElementById('DA-filterIncomeStart').value = defaultValue;
    document.getElementById('DA-filterOutcomeStart').value = defaultValue;
  }
// Đặt thời gian hiện tại là cuối tháng
function setDefaultFinallyDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var lastDay = new Date(year, month, 0).getDate(); // Ngày cuối tháng
    
    var defaultValue = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    document.getElementById('DA-filterIncomeEnd').value = defaultValue;
    document.getElementById('DA-filterOutcomeEnd').value = defaultValue;
  }
//   định dạng lại thời gian theo dd/mm/yyyy
  function formatDefauleDate(param) {
    var date = new Date(param);
  
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
  
    var formattedDateTime = day + "/" + month + "/" + year;
    return formattedDateTime; 
  }
  function setFirstDateByYear() {
    var now = new Date(); // Lấy thời gian hiện tại
    var currentYear = now.getFullYear(); // Lấy năm hiện tại
  
    var startOfYear = new Date(currentYear, 0, 1); // Đặt thời gian là đầu năm
    var formattedDate = formatDate(startOfYear); // Định dạng thời gian
    return formattedDate;

  }
  // Lọc dữ liệu theo tháng trong năm hiện tại
function filterIncomeByMonth(incomeData) {
    var monthlyIncome = [];
    
    var currentYear = new Date().getFullYear(); // Lấy năm hiện tại
    
    // Khởi tạo một đối tượng chứa thông tin về tất cả các tháng
    var allMonths = {};
    
    // Lặp qua mảng dữ liệu thu nhập và tính tổng số tiền của từng tháng trong năm hiện tại
    for (var i = 0; i < incomeData.length; i++) {
      var income = incomeData[i];
      var date = new Date(income.time);
      var year = date.getFullYear();
      
      // Kiểm tra xem khoản thu nhập có trong năm hiện tại không
      if (year === currentYear) {
        var month = date.getMonth() + 1;
        var amount = income.amount;
  
        // Kiểm tra xem tháng đã tồn tại trong đối tượng allMonths chưa
        if (allMonths[month]) {
          allMonths[month] += amount; // Cộng tổng số tiền vào tháng đã tồn tại
        } else {
          allMonths[month] = amount; // Tạo một tháng mới và gán giá trị số tiền
        }
      }
    }
    
    // Lặp qua tất cả các tháng trong năm hiện tại
    for (var m = 1; m <= 12; m++) {
      var total = allMonths[m] || 0; // Nếu tháng không tồn tại, gán giá trị 0
      
      // Thêm thông tin về tháng và tổng số tiền vào mảng monthlyIncome
      monthlyIncome.push(total);
    }
    
    return monthlyIncome;
}
  // Lấy thời gian là cuối năm
  function setFinallyDateByYear() {
    var now = new Date(); // Lấy thời gian hiện tại
    var currentYear = now.getFullYear(); // Lấy năm hiện tại
  
    var startOfYear = new Date(currentYear, 11, 31); // Đặt thời gian là cuối năm
    var formattedDate = formatDate(startOfYear); // Định dạng thời gian
    return formattedDate;
  }
  function formatDate(date) {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
  }
$('#DA-logout').click(function () {
    localStorage.removeItem('token');
    window.location.href = "./login.html";
});