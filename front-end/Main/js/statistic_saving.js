var isLogin = !!localStorage.getItem("token");
function checkLogin(){
    if(isLogin != 1){
        // window.location.href = "./login.html";
        var htmlSnippet = `
            <a class="nav-link text-white" href="./login.html" id="DA-HoVaTen">Đăng nhập</a>
                `;
        $('#DA-loginCheck').html(htmlSnippet);
    }
};
$(document).ready(function(){
    getStatisticSaving();
    getName();
    getTotalMoney();
  })
  const DA_token = localStorage.getItem("token");
var dataSaving = [];
  

  var ctxDounghnut = document.getElementById('myChartDounghnut');
  var myChartDoughnut = new Chart(ctxDounghnut, {
      type: 'doughnut',
      data: {
          labels: [],
          datasets: [{
              label: 'Phần trăm',
              data: [],
              backgroundColor: [
              'rgba(255, 99, 132)',
              'rgba(255, 159, 64)',
              'rgb(112, 48, 160)', 
              'rgb(255, 192, 0)',
              'rgb(246, 70, 93)',
              'rgb(246, 120, 93)',
              'rgb(246, 23, 13)',
              'rgb(246, 21, 102)',
              'rgb(254, 231, 215)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          indexAxis: 'y',
          scales: {
              y: {
              beginAtZero: true
              }
          }
      }
  });

  var ctxBar = document.getElementById('myChartBarY');
  var myChartBarY = new Chart(ctxBar, {
      type: 'bar',
      data: {
          labels: [],
          datasets: [{
              label: 'Số tiền',
              data: [],
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
          }]
      },
      options: {
          indexAxis: 'y',
          scales: {
              y: {
              beginAtZero: true
              }
          }
      }
  });

  var ctxBarX = document.getElementById('myChartBarX');
  var initdata = [10000, 20000, 45600, 11225, 54456, 17890];
  var myChartBarX = new Chart(ctxBarX, {
      type: 'bar',
      data: {
          labels: ['MB', 'Agribank', 'VPbank', 'TechcomBank', 'Viettel', 'Sacobank'],
          datasets: [{
              // label: 'Số lãi',
              data: initdata,
              backgroundColor: [
              'rgb(14, 203, 116, 0.5)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          indexAxis: 'y',
          scales: {
              y: {
              beginAtZero: true
              }
          }
      }
  });

  function getTotalMoney(){
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/saving/calculate',
        headers: {
            "Authorization": DA_token
        },
        success: function(data) {
            data = JSON.parse(data);
            $('#totalAmountSend').html(data.savingAmount.toLocaleString());
            $('#totalAmountInterest').text(data.interest.toLocaleString());
            $('#totalAmountNotSend').text(data.currentMoney.toLocaleString());
            $('#totalWithdrawalAmount').text((parseFloat(data.savingAmount) + parseFloat(data.interest) + parseFloat(data.currentMoney)).toLocaleString());


        },
        error: function(error, xhr) {
        }
    });

}

  function getStatisticSaving() {
    $.ajax({
        url: "http://localhost:8080/saving/",
        type: "GET",
        headers: {
            "Authorization": DA_token
        },
        processData: false,
        contentType: false,
        success: function(response) {
            renderListBankInfo(response);

            dataSaving = [];
            var dataToApiBank = [];
            var dataToApiMoney = [];
            var phanTram = [];
            for(var i=0; i<response.length; i++) {
                var objApi = {
                    bankinfo: response[i].bankInfo.bankName,
                    amount: response[i].amount
                };
                dataSaving.push(objApi);
            }
            dataSaving = mergeDuplicateElements(dataSaving)
            var tong = 0;
            // Chuyển dữ liệu thành mảng đơn 1 mảng là tên ngân hàng, 1 mảng là số tiền
            dataSaving.forEach(element => {
                dataToApiBank.push(element.bankinfo);
                dataToApiMoney.push(element.amount);
                tong+=element.amount;
            });
            dataToApiMoney.forEach(element => {
                var hv = (element/tong)*100;
                console.log(hv.toFixed(2));
                phanTram.push(hv.toFixed(2));
            });
            // Cập nhật biểu đồ các khoản gửi trong các ngân hàng
            myChartBarY.data.labels = dataToApiBank;
            myChartBarY.data.datasets[0].data = dataToApiMoney;
            myChartBarY.update();
            // Cập nhật biểu đồ tròn
            myChartDoughnut.data.labels = dataToApiBank;
            myChartDoughnut.data.datasets[0].data = phanTram;
            myChartDoughnut.update();

        },
        error: function(xhr, status, error) {
            // Xử lý lỗi
            console.log(xhr.status);
        }
    });
    }
// Hàm gộp các khoản tiết kiệm theo ngân hàng
  function mergeDuplicateElements(array) {
    const counts = {};
  
    array.forEach((element) => {
      if (counts[element.bankinfo]) {
        counts[element.bankinfo].amount += element.amount;
      } else {
        counts[element.bankinfo] = { bankinfo: element.bankinfo, amount: element.amount };
      }
    });
  
    const mergedArray = Object.values(counts);
  
    return mergedArray;
};
  
// Hàm render các khoản tiết kiệm trong các ngân hàng
function renderListBankInfo(param){
    param.forEach(element => {
        var dateFormated = formatDatetimeLocal(element.startDate)
        var htmlSnippet = `
        <li class="row mb-2 DA-bank-style" type="button" data-bs-toggle="collapse" data-bs-target="#DA-${element.id}-BankInfo" aria-expanded="false" aria-controls="DA-${param.id}-BankInfo">
                        <div class="col-sm-1 align-self-center" style="padding-left: 14px;">
                          <i class="fa-solid fa-circle" style="font-size: 8px !important; color: #f6465d;"></i>
                        </div>
                        <div class="col-sm-5 align-self-center" >
                          <label class="bankName">${element.bankInfo.bankName}</label>
                        </div>
                        <div class="col-sm-4 align-self-center" style="float: inline-end;">
                          <label class="bankAmount">${element.amount.toLocaleString()}</label>
                        </div>
                        <div class="col-sm-2 align-self-center" >
                          <label class="banklabel">VNĐ</label>
                        </div>
                      </li>
                      <div class="collapse" id="DA-${element.id}-BankInfo">
                        <div class="card card-body bg-dark mb-2 text-white p-3" style="font-size: 12px;">
                          <div class="row">
                            <b class="col-sm-3 text-success" style="padding-right: 6px;">Chi tiết:</b>
                            <label class="col-sm-9" style="padding-left: 0px;">${element.desc}</label>
                          </div>
                          <div class="row mt-2">
                            <b class="text-success" style="padding-right: 6px; display: inline-block; width: fit-content;">Ngày gửi:</b>
                            <label class="" style="padding-left: 4px; width: fit-content;">${dateFormated}</label>
                          </div>
                          <div class="row mt-2">
                            <b class="text-success" style="padding-right: 6px; display: inline-block; width: fit-content;">Khoản gửi:</b>
                            <label class="" style="padding-left: 4px; width: fit-content;">${element.amount.toLocaleString()}</label>
                          </div>
                          <div class="row mt-2">
                            <b class="text-success" style="padding-right: 6px; display: inline-block; width: fit-content;">Ngân hàng:</b>
                            <label class="" style="padding-left: 4px; width: fit-content;">${element.bankInfo.bankName}</label>
                          </div>
                          
                          <div class="row mt-2">
                            <div class="col-lg-6">
                              <b class="text-success" style="padding-right: 6px; display: inline-block; width: fit-content;">Lãi xuất:</b>
                              <label class="" style="padding-left: 4px; width: fit-content;">${element.bankInfo.interestRate}%</label>
                            </div>
                            <div class="col-lg-6">
                              <b class="text-success" style="padding-right: 6px; display: inline-block; width: fit-content;">Kỳ hạn:</b>
                              <label class="" style="padding-left: 4px; width: fit-content;">${element.bankInfo.term} tháng</label>
                            </div>
                          </div>
                        </div>
                      </div>
        `;
        $('#DA-listBank').append(htmlSnippet);
    });
}

function formatDatetimeLocal(param) {
    const ObjDate = new Date(param);
    const formattedDate = `${ObjDate.getDate()}-${ObjDate.getMonth() + 1}-${ObjDate.getFullYear()}`;
    return formattedDate;
}
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
