var isLogin = !!localStorage.getItem("token");
var dataToApi = [];
var dataToApiCate = [];
var dataToApiMoney = [];
var idCategories = [];
const nameIncome = "income";
const nameOutcome = "outcome";
// Đặt thời gian mặc định cho ô thời gian
setDefaultFirstDate();
setDefaultFinallyDate();
// Khai báo biểu đồ
var ctxDounghnut = document.getElementById('myChartBar');
var myChart = new Chart(ctxDounghnut, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Thu nhập',
            data: [],
            backgroundColor: [
            'rgb(14, 203, 116)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        indexAxis: 'x',
        scales: {
            y: {
            beginAtZero: true
            }
        }
    }
});

// Lấy token từ local storage 
const DA_token = localStorage.getItem("token");

// Hàm kiểm tra đăng nhập, nếu chưa thì đưa ra trang đăng nhập
function checkLogin(){
    if(isLogin != 1){
        window.location.href = "./login.html";
    }
    fillCategories(DA_token);
    getName();
    getAllIncomeTransactionOfUserToday();
    loadIncomeByMonth(DA_token);
    // loadOutcomeByMonth(DA_token);

    // Đặt giá trị mặc định cho chuỗi strid trong session storage
    sessionStorage.setItem("strid", "");
    sessionStorage.setItem("income", "0,0,0,0,0,0,0,0,0,0,0,0");
    sessionStorage.setItem("outcome", "0,0,0,0,0,0,0,0,0,0,0,0");
    var strIdCate = sessionStorage.getItem("strid");
    
    var dateFrom = $('#DA-dateFrom').val();
    var dateTo = $('#DA-dateTo').val();
    
    // Định dạng năm-tháng-ngày giờ:phút:giây
    const formattedDateFrom = formatDatetimeLocal(dateFrom);
    const formattedDateTo = formatDatetimeLocal(dateTo);
    getIncomeTransactions(DA_token, formattedDateFrom, formattedDateTo, strIdCate);
    
    
};

$(document).ready(function () {
    
});

// Hàm lấy thông tin người dùng
function getName(){
    $.ajax({
        url: 'http://localhost:8080/user/current',
        type: 'GET',
        headers: {
            "Authorization": DA_token
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
// Khai báo datatables
$('#example').DataTable({
    autoWidth: false,
    columnDefs: [
        {
            targets: ['_all'],
            className: 'mdc-data-table__cell',
        },
    ],
});
// Đăng xuất
$('#DA-logout').click(function () {
    localStorage.removeItem('token');
    window.location.href = "./login.html";
});
// Hàm gộp danh mục
function mergeDuplicateElements(array) {
    const counts = {};
  
    array.forEach((element) => {
      if (counts[element.cate]) {
        counts[element.cate].amount += element.amount;
      } else {
        counts[element.cate] = { cate: element.cate, amount: element.amount };
      }
    });
  
    const mergedArray = Object.values(counts);
  
    return mergedArray;
};
// Sự kiện click vào nút lọc 
$('#btn-filter').click(function() {
    console.log(sessionStorage.getItem("strid"));
    var strIdCate = sessionStorage.getItem("strid");
    var dateFrom = $('#DA-dateFrom').val();
    var dateTo = $('#DA-dateTo').val();
    
    // Định dạng năm-tháng-ngày giờ:phút:giây
    const formattedDateFrom = formatDatetimeLocal(dateFrom);
    const formattedDateTo = formatDatetimeLocal(dateTo);

    getIncomeTransactions(DA_token, formattedDateFrom, formattedDateTo, strIdCate);
});


function getIncomeTransactions(tk, dateFrom, dateTo, str) {
    $.ajax({
        url: "http://localhost:8080/transaction/statistic/income?start_date=" + dateFrom + "&end_date=" + dateTo + "&type=income" + "&cate=" + str,
        type: "GET",
        headers: {
            "Authorization": tk
        },
        processData: false,
        contentType: false,
        success: function(response) {
            dataToApi = [];
            dataToApiCate = [];
            dataToApiMoney = [];
            
            for(var i=0; i<response.length; i++) {
                objApi = {
                    cate: response[i].category,
                    amount: response[i].amount
                };
                dataToApi.push(objApi);
            }
            dataToApi = mergeDuplicateElements(dataToApi);  
            dataToApi.forEach(element => {
                dataToApiCate.push(element.cate);
                dataToApiMoney.push(element.amount);
            });
            // Thay đổi dữ liệu trong chart
            myChart.data.labels = dataToApiCate;
            myChart.data.datasets[0].data = dataToApiMoney;
            myChart.update();
            
        },
        error: function(xhr, status, error) {
            // Xử lý lỗi
            console.log(xhr.status);
            
        }
    });
}
// Sự kiện click vào tên danh mục thì bôi đen danh mục đó
$("#DA-listCategories").on("click", "option", function() {
    $(this).parent().toggleClass("DA-selected");
});

// Đổ dữ liệu category
function fillCategories(tk){
    $.ajax({
        url: "http://localhost:8080/category/income",
        type: "GET",
        headers: {
            "Authorization": tk
        },
        processData: false,
        contentType: false,
        success: function(response) {
            const dataCategories = response.map((cate) => {
                return {
                    name: cate.name,
                    id: cate.id,
                    icon: cate.icon
                };
            });
            dataCategories.forEach(element => {
                var htmlSnippet = `
                <li style = "margin-bottom: 4px;">
                    <div class="img-icon">
                        <img src="${element.icon}" alt="">
                    </div>
                    <option class = "DA-opIcon" value=${element.id}>${element.name}</option>
                </li>
                `;
                $('#DA-listCategories').append(htmlSnippet);
            });
            $(".DA-opIcon").on("click", function() {
                onClickIconName(idCategories, $(this).val())
            });
        },
        error: function(xhr, status, error) {
          // Xử lý lỗi
          console.log(xhr.status);
        }
      });
}
// Hàm thêm hoặc xóa id trong 1 mảng, có thì xóa mà không có thì thêm
function addOrRemoveElementFromArray(arr, element) {
    if (arr.includes(element)) {
      arr.splice(arr.indexOf(element), 1);
    } else {
      arr.push(element);
    }
}
// Hàm định dạng lại thời gian để gửi API
function formatDatetimeLocal(param) {
    const ObjDate = new Date(param);
    const formattedDate = `${ObjDate.getFullYear()}-${ObjDate.getMonth() + 1}-${ObjDate.getDate()} ${ObjDate.getHours()}:${ObjDate.getMinutes()}:${ObjDate.getSeconds()}`;
    return formattedDate;
}
// Hàm bắt sự kiện click vào tên danh mục thì thêm id của danh mục vào mảng 
function onClickIconName(arr, param) {
    addOrRemoveElementFromArray(arr, param)
    var strId = arr.join();
    // Lưu chuỗi id vào session storage
    sessionStorage.setItem("strid", strId);
}

// Đặt thời gian mặc định là đầu tháng hiện tại
function setDefaultFirstDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = 1; // Ngày đầu tháng
    
    var defaultValue = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00`;
    document.getElementById('DA-dateFrom').value = defaultValue;
  }
// Đặt thời gian hiện tại là cuối tháng
  function setDefaultFinallyDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var lastDay = new Date(year, month, 0).getDate(); // Ngày cuối tháng
    
    var defaultValue = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}T23:59`;
    document.getElementById('DA-dateTo').value = defaultValue;
  }

// Hàm load các khoản thu theo tháng
function loadIncomeByMonth(tk) {
    $.ajax({
        url: "http://localhost:8080/transaction/income",
        type: "GET",
        headers: {
            "Authorization": tk
        },
        processData: false,
        contentType: false,
        success: function(response) {
            var arr = response;
            dataToApi = [];
            for(var i=0; i<arr.length; i++) {
                objApi = {
                    date: arr[i].time,
                    amount: arr[i].amount
                };
                dataToApi.push(objApi);
            }
            console.log(dataToApi);   
            var dataMonthly = filterIncomeByMonth(dataToApi);
            handleArrayAndSaveSession(dataMonthly, nameIncome);
            var sum = 0;
            // Tính tổng số tiền
            for(var i=0; i<dataMonthly.length; i++){
                sum+=dataMonthly[i].total;
            }
            $('#DA-Jan-income').text(`${dataMonthly[0].total.toLocaleString()}`); 
            $('#DA-Feb-income').text(`${dataMonthly[1].total.toLocaleString()}`); 
            $('#DA-Mar-income').text(`${dataMonthly[2].total.toLocaleString()}`); 
            $('#DA-Apr-income').text(`${dataMonthly[3].total.toLocaleString()}`); 
            $('#DA-May-income').text(`${dataMonthly[4].total.toLocaleString()}`); 
            $('#DA-Jun-income').text(`${dataMonthly[5].total.toLocaleString()}`); 
            $('#DA-Jul-income').text(`${dataMonthly[6].total.toLocaleString()}`); 
            $('#DA-Aug-income').text(`${dataMonthly[7].total.toLocaleString()}`); 
            $('#DA-Sep-income').text(`${dataMonthly[8].total.toLocaleString()}`); 
            $('#DA-Oct-income').text(`${dataMonthly[9].total.toLocaleString()}`); 
            $('#DA-Nov-income').text(`${dataMonthly[10].total.toLocaleString()}`); 
            $('#DA-Dec-income').text(`${dataMonthly[11].total.toLocaleString()}`); 
            $('#DA-income-sum').text(`${sum.toLocaleString()}`); 
            loadOutcomeByMonth(DA_token);

        },
        error: function(xhr, status, error) {
          // Xử lý lỗi
          console.log(xhr.status);
        }
    });
};
// Hàm load các khoản chi theo tháng
function loadOutcomeByMonth(tk) {
    $.ajax({
        url: "http://localhost:8080/transaction/outcome",
        type: "GET",
        headers: {
            "Authorization": tk
        },
        processData: false,
        contentType: false,
        success: function(response) {
            
            var arr = response;
            dataToApi = [];
            for(var i=0; i<arr.length; i++) {
                objApi = {
                    date: arr[i].time,
                    amount: arr[i].amount
                };
                dataToApi.push(objApi);
            }
            console.log(dataToApi);   
            var dataMonthly = filterIncomeByMonth(dataToApi);
            handleArrayAndSaveSession(dataMonthly, nameOutcome);
            var sum = 0;
            // Tính tổng số tiền
            for(var i=0; i<dataMonthly.length; i++){
                sum+=dataMonthly[i].total;
            }
            $('#DA-Jan-outcome').text(`${dataMonthly[0].total.toLocaleString()}`); 
            $('#DA-Feb-outcome').text(`${dataMonthly[1].total.toLocaleString()}`); 
            $('#DA-Mar-outcome').text(`${dataMonthly[2].total.toLocaleString()}`); 
            $('#DA-Apr-outcome').text(`${dataMonthly[3].total.toLocaleString()}`); 
            $('#DA-May-outcome').text(`${dataMonthly[4].total.toLocaleString()}`); 
            $('#DA-Jun-outcome').text(`${dataMonthly[5].total.toLocaleString()}`); 
            $('#DA-Jul-outcome').text(`${dataMonthly[6].total.toLocaleString()}`); 
            $('#DA-Aug-outcome').text(`${dataMonthly[7].total.toLocaleString()}`); 
            $('#DA-Sep-outcome').text(`${dataMonthly[8].total.toLocaleString()}`); 
            $('#DA-Oct-outcome').text(`${dataMonthly[9].total.toLocaleString()}`); 
            $('#DA-Nov-outcome').text(`${dataMonthly[10].total.toLocaleString()}`); 
            $('#DA-Dec-outcome').text(`${dataMonthly[11].total.toLocaleString()}`); 
            $('#DA-outcome-sum').text(`${sum.toLocaleString()}`); 
            var arrOut = sessionStorage.getItem("outcome");
            var arrIn = sessionStorage.getItem("income");
                // console.log(arrOut);
            calculateDiffirence(arrIn, arrOut);
        },
        error: function(xhr, status, error) {
          // Xử lý lỗi
          console.log(xhr.status);
        }
    });
};
// Lọc dữ liệu theo tháng trong năm hiện tại
function filterIncomeByMonth(incomeData) {
    var monthlyIncome = [];
    
    var currentYear = new Date().getFullYear(); // Lấy năm hiện tại
    
    // Khởi tạo một đối tượng chứa thông tin về tất cả các tháng
    var allMonths = {};
    
    // Lặp qua mảng dữ liệu thu nhập và tính tổng số tiền của từng tháng trong năm hiện tại
    for (var i = 0; i < incomeData.length; i++) {
      var income = incomeData[i];
      var date = new Date(income.date);
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
      monthlyIncome.push({ month: m, total: total });
    }
    
    return monthlyIncome;
}

// Hàm xử lý mảng là lưu vào session storage
function handleArrayAndSaveSession(arr, nameSes){
    var dataResult = [];
    for(var i = 0; i < arr.length; i++){
        dataResult.push(arr[i].total);
    }
    sessionStorage.setItem(nameSes, dataResult);
}

// Hàm xử lý chuỗi thành mảng số
function handleStringToArray(arr){
    var strArray = arr.split(',');
    // Chuyển đổi các phần tử thành số
    var numberArray = strArray.map(function(item) {
        return parseInt(item, 10);
    });
    return numberArray;
}

// Hàm tính chênh lệch giữa thu và chi trong năm theo tháng
function calculateDiffirence(param1, param2) {
    var arrNumberIncome = handleStringToArray(param1);
    var arrNumberOutcome = handleStringToArray(param2);
    var result = [];
    var tr;
    for(var i = 0; i < arrNumberIncome.length; i++) {
        tr = arrNumberIncome[i] - arrNumberOutcome[i];
        result.push(tr);
    }
    console.log(result);
    // Tính tổng số tiền
    var sum = 0;
    for(var i=0; i<result.length; i++){
        sum+=result[i];
    }
    $('#DA-Jan-sum').text(`${result[0].toLocaleString()}`); 
    $('#DA-Feb-sum').text(`${result[1].toLocaleString()}`); 
    $('#DA-Mar-sum').text(`${result[2].toLocaleString()}`); 
    $('#DA-Apr-sum').text(`${result[3].toLocaleString()}`); 
    $('#DA-May-sum').text(`${result[4].toLocaleString()}`); 
    $('#DA-Jun-sum').text(`${result[5].toLocaleString()}`); 
    $('#DA-Jul-sum').text(`${result[6].toLocaleString()}`); 
    $('#DA-Aug-sum').text(`${result[7].toLocaleString()}`); 
    $('#DA-Sep-sum').text(`${result[8].toLocaleString()}`); 
    $('#DA-Oct-sum').text(`${result[9].toLocaleString()}`); 
    $('#DA-Nov-sum').text(`${result[10].toLocaleString()}`); 
    $('#DA-Dec-sum').text(`${result[11].toLocaleString()}`); 
    $('#DA-diff-sum').text(`${sum.toLocaleString()}`); 
}

function getAllIncomeTransactionOfUserToday() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let startDate = year + '-' + month + '-' + day + ' 00:00:00';
    let endDate = year + '-' + month + '-' + day + ' 23:59:59';

    console.log(startDate);
    $.ajax({
        url: "http://localhost:8080/transaction/statistic/income",
        type: "GET",
        headers: {
            "Authorization": DA_token
        },
        data: {
            start_date: startDate,
            end_date: endDate,
            type: 'income',
            param2: 'value2'
        },
        success: function (data) {
            console.log(data);
            renderIncomeTransactionToday(data);
        }
    })
};

function renderIncomeTransactionToday(dataIncomeTransToday) {
    let listIncomeTransToday = document.getElementById("myIncomeTransToday");
    if(dataIncomeTransToday.length > 0) {
        let htmlsIncomeTransToday = dataIncomeTransToday.map(function (incomeTrans) {
            if (incomeTrans.active == true) {
                return `
                <div class="card DA-border-radius mb-2 bg-dark">
                    <div class="row card-body padding-12px">
                        <div class="col-sm-7" style="line-height: 62px;">
                            <div class="row">
                                <div class="img-icon DA-today col-md-3">
                                    <img src="${incomeTrans.icon}" alt="">
                                </div>
                                <div class="DA-name-cate col-md-9" style="display: flex; align-items: center; padding: 0px;">
                                    <h6 style="margin: 0px; font-size: 14px; color: #fff;">${incomeTrans.desc}</h6>
                                </div>
                            </div>
                            
                        </div>
                        <div class="col-sm-5 pr-0">
                            <label class="DA-title ">${incomeTrans.category}</label>
                            <div style="float: inline-end;">
                                <h5 style="display: inline-block; color: rgb(15, 216, 0);">${incomeTrans.amount.toLocaleString()}</h5>
                                <u style="color: yellow;">đ</u>
                            </div>
                        </div>
                    </div>
                </div>
                `
            }
        });
    
        listIncomeTransToday.innerHTML = htmlsIncomeTransToday.join(" ");
    }
    else{
        $('#myIncomeTransToday').append('<center style="color: black;">Không có khoản thu nào trong hôm nay</center>')
    }
};
sessionStorage.clear();