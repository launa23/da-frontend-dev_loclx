var isLogin = !!localStorage.getItem("token");
const TOKEN = localStorage.getItem("token");
function checkLogin(){
    if(isLogin != 1){
        // window.location.href = "./login.html";
        var htmlSnippet = `
            <a class="nav-link text-white" href="./login.html" id="DA-HoVaTen">Đăng nhập</a>
                `;
        $('#DA-loginCheck').html(htmlSnippet);
    }
};
// khi ma load trang web no se goi den ham nay $document.ready()
$(document).ready(function () {
    getName();
    getIncomeGoal();
    setDefaultStartDate();
    setDefaultEndDate();
    filterIncomeGoalByDate();
    filterOutcomeGoalByDate();
});

var ctx = document.getElementById('myChartIncomeGoal').getContext('2d');
var myChartIncomeGoal = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Thực tế',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Dự thu',
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
var ctx = document.getElementById('myChartOutcomeGoal').getContext('2d');
var myChartOutcomeGoal = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Thực tế',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Dự chi',
        data: [],
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
        borderColor: 'rgba(255, 205, 86, 1)',
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
// Sự kiện thêm mục tiêu
$('#DA-FinanceGoal').submit(function(event) {
  event.preventDefault(); // Ngăn chặn gửi form mặc định
  var AddGoalAmount = $('#AddGoalAmount').val();
  var AddGoalType = $('#AddGoalType').val();
  var AddGoalStart = $('#AddGoalStart').val();
  var AddGoalEnd = $('#AddGoalEnd').val();
  var startDate = new Date(AddGoalStart);
  var endDate = new Date(AddGoalEnd);

  var validateAmount = validatorAmount(document.getElementById("AddGoalAmount"));
  if(startDate <= endDate && validateAmount){
    $('#DA-showError').removeClass('showErrorGoal');
    var data = {
      amount: parseInt(AddGoalAmount),
      type: AddGoalType,
      startDate: AddGoalStart + ' 00:00:00',
      endDate: AddGoalEnd + ' 23:59:59'
    };
    $.ajax({
      url: 'http://localhost:8080/goal/create',
      type: 'POST',
      headers: {
        "Authorization": TOKEN
      },
      data: JSON.stringify(data),
      processData: false,
      contentType: 'application/json',
      success: function(response) {
        location.reload();
        $('#AddGoalAmount').val('');
        $('#AddGoalType').val('income');
        $('#AddGoalStart').val('');
        $('#AddGoalEnd').val('');
        $('#DA-showError').addClass('showErrorGoal');
        $('#DA-showError').html('Thêm mục tiêu thành công');
      },
      error: function(error) {
        
      }
    });
  }
  else{
    $('#DA-showError').addClass('showErrorGoal');
    $('#DA-showError').html('Ngày bắt đầu, ngày kết thúc không phù hợp');
  }
})
// Sự kiện cập nhật mục tiêu
$('#DA-btnUpdate').click(function(event) {
  event.preventDefault(); // Ngăn chặn gửi form mặc định
  var AddGoalAmount = $('#AddGoalAmount').val();
  var AddGoalType = $('#AddGoalType').val();
  var AddGoalStart = $('#AddGoalStart').val();
  var AddGoalEnd = $('#AddGoalEnd').val();
  var startDate = new Date(AddGoalStart);
  var endDate = new Date(AddGoalEnd);
  var id = $('#DA-idGoal').val();
  
  var validateAmount = validatorAmount(document.getElementById("AddGoalAmount"));

  if(startDate <= endDate && validateAmount){
    $('#DA-showError').removeClass('showErrorGoal');
    var data = {
      amount: parseInt(AddGoalAmount),
      startDate: AddGoalStart + ' 00:00:00',
      endDate: AddGoalEnd + ' 23:59:59'
    };
    $.ajax({
      url: 'http://localhost:8080/goal/update/'+id,
      type: 'PUT',
      headers: {
        "Authorization": TOKEN
      },
      data: JSON.stringify(data),
      processData: false,
      contentType: 'application/json',
      success: function(response) {
        location.reload();
        $('#AddGoalAmount').val('');
        $('#AddGoalType').val('income');
        $('#AddGoalStart').val('');
        $('#AddGoalEnd').val('');
        $('#DA-showError').addClass('showErrorGoal');
        $('#DA-showError').html('Cập nhật thành công');
      },
      error: function(error) {
        
      }
    });
  }
  else{
    $('#DA-showError').addClass('showErrorGoal');
    $('#DA-showError').html('Ngày bắt đầu, ngày kết thúc không phù hợp');
  }
})

$('#DA-btnDelete').click(function(event) {
  event.preventDefault(); // Ngăn chặn gửi form mặc định
  
  var id = $('#DA-idGoal').val();
  $('#DA-showError').removeClass('showErrorGoal');
  let confirmDeleteTrans = confirm('Bạn có chắc muốn xóa khoản này chứ?');
  if (confirmDeleteTrans) {
    $.ajax({
      url: 'http://localhost:8080/goal/delete/'+id,
      type: 'PUT',
      headers: {
        "Authorization": TOKEN
      },
      success: function(response) {
        location.reload();
        
      },
      error: function(error) {
        
      }
    });
  }
})
// Hàm lấy tất cả các mục tiêu thu
function getIncomeGoal(){
  $.ajax({
    url: 'http://localhost:8080/goal/',
    type: 'GET',
    headers: {
        "Authorization": TOKEN
    },
    processData: false,
    contentType: 'application/json',
    success: function(response) {
        var dataIncomeGoal = response;

        if(dataIncomeGoal.length > 0){
          dataIncomeGoal.forEach(element => {
            var ngaystart = formatTimestampToDate(element.startDate);
            var ngayend = formatTimestampToDate(element.endDate);
            if(element.type == "income"){
              var htmlSnippet = `
                  <li class="mb-2 DA-itemgoal" type="button" data-bs-toggle="collapse" href="#collapse-${element.id}" role="button" aria-expanded="false" aria-controls="collapse-${element.id}">
                      <div style="font-size: 12px; font-style: italic; color: #8d959f;">
                          Thu nhập
                          <input type="text" style="display:none;" value="income" id="DA-txtType-${element.id}">
                      </div>
                      <div class="row">
                          <div class="col-sm-1 align-self-center">
                              <i class="fa-solid fa-bullseye"></i>
                          </div>
                          <div class="col-sm-5 align-self-center" style="color: rgb(9, 255, 0); font-size: 14px;">
                              <label>${element.amount.toLocaleString()}</label>
                              <u>đ</u>
                              <input type="number" style="display:none;" value=${element.amount} id="DA-numberAmount-${element.id}">
                          </div>
                          <div class="col-sm-4 align-self-center" style="font-size: 12px; padding-right: 0;">
                              <label style="color: rgb(234, 255, 0); font-weight: 700;">Từ: </label>
                              <label style="color: rgb(234, 255, 0); font-weight: 700;">${ngaystart}</label>
                              <input type="date" style="display:none;" value=${formatEndDate(element.startDate)} id="DA-dateStartDate-${element.id}">

                              <br>
                              <label>Đến: </label>
                              <label>${ngayend}</label>
                              <input type="date" style="display:none;" value=${formatEndDate(element.endDate)} id="DA-dateEndDate-${element.id}">

                          </div>
                          <div class="col-sm-2 align-self-center" >
                              <i id="DA-iconUpdate-${element.id}" class="fa-solid fa-pen-to-square" style="float: inline-end;" type="button" data-bs-toggle="modal" data-bs-target="#addFinanceGoal"></i>
                              <input type="number" style="display:none;" value=${element.id} id="DA-numberId-${element.id}">
                          </div>
                      </div>
                  </li>
                  <div class="collapse" id="collapse-${element.id}">
                      <div class="card card-body mb-2 DA-listIncomeTran">
                      </div>
                  </div>
                  `;
                $('#DA-listIncomeGoal').append(htmlSnippet);
                $(`#DA-iconUpdate-${element.id}`).click(function () {
                  var am = $(`#DA-numberAmount-${element.id}`).val();
                  var type = $(`#DA-txtType-${element.id}`).val();
                  var sd = $(`#DA-dateStartDate-${element.id}`).val();
                  var ed = $(`#DA-dateEndDate-${element.id}`).val();
                  $('#AddGoalAmount').val(am);
                  $('#AddGoalType').val(type);
                  $('#AddGoalType').prop('disabled', true);
                  $('#AddGoalStart').val(sd);
                  $('#AddGoalEnd').val(ed);
                  $('#DA-idGoal').val(element.id);
                  
                  $('#DA-showError').removeClass('showErrorGoal');
                  $('#DA-btnAdd').removeClass("showErrorGoal");
                  $('#DA-btnUpdate').addClass("showGoal");
                  $('#DA-btnDelete').addClass("showGoal");
                });
              var start_date = formatStartDate(element.startDate);
              var end_date = formatEndDate(element.endDate);
              $.ajax({
                url: "http://localhost:8080/transaction/statistic/income?start_date=" +start_date+ "&end_date=" +end_date+"&type=income",
                type: "GET",
                headers: {
                    "Authorization": TOKEN
                },
                processData: false,
                contentType: false,
                success: function(response) {
                    var dataIncomeByDate = response;
                    if(dataIncomeByDate.length > 0){
                      var totalIncome = 0;
                      dataIncomeByDate.forEach(element1 => {
                        totalIncome += element1.amount;
                      });
                      var per = (totalIncome / element.amount)*100;
                      if(per < 100){
                        var htmlSnippet = `
                          <div class="row">
                              <div class="col-md-2" style="color: #7f8285; font-size: 12px; padding-right: 0;">Đã thu</div>
                              <div class="col-md-10 align-self-center">
                                  <div class="progress" style="height: 10px;" role="progressbar" aria-label="Default striped example" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" >
                                      <div class="progress-bar progress-bar-striped bg-info" style="width: ${per}%"></div>
                                  </div>
                                  <label style="color: rgb(75, 102, 125); font-size: 12px; font-style: italic;">Đã thu ${per.toFixed(2)}% số tiền dự tính</label>
                              </div>
                          </div>
                        `;
                        $(`#collapse-${element.id} .DA-listIncomeTran`).append(htmlSnippet);
                      }
                      else{
                        var htmlSnippet = `
                          <div class="row">
                              <div class="col-md-2" style="color: #7f8285; font-size: 12px; padding-right: 0;">Đã thu</div>
                              <div class="col-md-10 align-self-center">
                                  <div class="progress" style="height: 10px;" role="progressbar" aria-label="Default striped example" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" >
                                      <div class="progress-bar progress-bar-striped bg-danger" style="width: 100%"></div>
                                  </div>
                                  <label style="color: rgb(75, 102, 125); font-size: 12px; font-style: italic;">Đã thu vượt qua số dự tính</label>
                              </div>
                          </div>
                        `;
                        $(`#collapse-${element.id} .DA-listIncomeTran`).append(htmlSnippet);
                      }
                      dataIncomeByDate.forEach(element1 => {
                        var datedefault = formatDefauleDate(element1.time);
                        var htmlSnippet = `
                            <div class="mt-2" style="border-top: 1px solid rgba(138, 125, 125, 0.414);"></div>
                            <div class="row">
                                <div class="col-md-5 align-self-center" style="padding-right: 0;">
                                    <i class="fa-solid fa-circle text-warning" style="font-size: 8px;"></i>
                                    <label style="font-size: 14px; font-weight: 600; color: #07d1c2; padding-left: 4px;">${element1.category}</label>
                                </div>
                                <div class="col-md-7">
                                    <div class="" style="font-size: 12px; font-style: italic; color: #079bd1;">${datedefault}</div>
                                    <div class="mt-2 ">
                                        <div class="progress" style="height: 7px;" role="progressbar" aria-label="Default striped example" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" >
                                            <div class="progress-bar progress-bar-striped bg-success" style="width: ${(element1.amount / element.amount)*100}%"></div>
                                        </div>
                                    </div>
                                    <div class="mt-2" style="font-size: 14px; font-weight: 600; color: rgb(0, 255, 0);">
                                        <label for="">${element1.amount.toLocaleString()}</label>
                                        <u>đ</u>
                                    </div>
                                </div>
                            </div>
                        `;
                        $(`#collapse-${element.id} .DA-listIncomeTran`).append(htmlSnippet);
                      });
                    }
                },
                error: function(xhr, status, error) {
                  
                }
              });
            }
            else{
              var htmlSnippet = `
                  <li class="mb-2 DA-itemgoal" type="button" data-bs-toggle="collapse" href="#collapse-${element.id}" role="button" aria-expanded="false" aria-controls="collapse-${element.id}">
                      <div style="font-size: 12px; font-style: italic; color: #8d959f;">
                          Chi tiêu
                          <input type="text" style="display:none;" value="outcome" id="DA-txtType-${element.id}">
                      </div>
                      <div class="row">
                          <div class="col-sm-1 align-self-center">
                              <i class="fa-solid fa-bullseye"></i>
                          </div>
                          <div class="col-sm-5 align-self-center" style="color: rgb(9, 255, 0); font-size: 14px;">
                              <label>${element.amount.toLocaleString()}</label>
                              <u>đ</u>
                              <input type="number" style="display:none;" value=${element.amount} id="DA-numberAmount-${element.id}">
                          </div>
                          <div class="col-sm-4 align-self-center" style="font-size: 12px; padding-right: 0;">
                              <label style="color: rgb(234, 255, 0); font-weight: 700;">Từ: </label>
                              <label style="color: rgb(234, 255, 0); font-weight: 700;">${ngaystart}</label>
                              <input type="date" style="display:none;" value=${formatEndDate(element.startDate)} id="DA-dateStartDate-${element.id}">

                              <br>
                              <label>Đến: </label>
                              <label>${ngayend}</label>
                              <input type="date" style="display:none;" value=${formatEndDate(element.endDate)} id="DA-dateEndDate-${element.id}">

                          </div>
                          <div class="col-sm-2 align-self-center" >
                              <i id="DA-iconUpdate-${element.id}" class="fa-solid fa-pen-to-square" style="float: inline-end;" type="button" data-bs-toggle="modal" data-bs-target="#addFinanceGoal"></i>
                              <input type="number" style="display:none;" value=${element.id} id="DA-numberId-${element.id}">
                          </div>
                      </div>
                  </li>
                  <div class="collapse" id="collapse-${element.id}">
                      <div class="card card-body mb-2 DA-listOutcomeTran">
                      </div>
                  </div>
                  `;
                $('#DA-listOutcomeGoal').append(htmlSnippet);
                $(`#DA-iconUpdate-${element.id}`).click(function () {
                  var am = $(`#DA-numberAmount-${element.id}`).val();
                  var type = $(`#DA-txtType-${element.id}`).val();
                  var sd = $(`#DA-dateStartDate-${element.id}`).val();
                  var ed = $(`#DA-dateEndDate-${element.id}`).val();
                  $('#AddGoalAmount').val(am);
                  $('#AddGoalType').val(type);
                  $('#AddGoalType').prop('disabled', true);
                  $('#AddGoalStart').val(sd);
                  $('#AddGoalEnd').val(ed);
                  $('#DA-idGoal').val(element.id);
                  
                  $('#DA-showError').removeClass('showErrorGoal');
                  $('#DA-btnAdd').removeClass("showErrorGoal");
                  $('#DA-btnUpdate').addClass("showGoal");
                  $('#DA-btnDelete').addClass("showGoal");
                });
              var start_date = formatStartDate(element.startDate);
              var end_date = formatEndDate(element.endDate);
              $.ajax({
                url: "http://localhost:8080/transaction/statistic/outcome?start_date=" +start_date+ "&end_date=" +end_date+"&type=outcome",
                type: "GET",
                headers: {
                    "Authorization": TOKEN
                },
                processData: false,
                contentType: false,
                success: function(response) {
                    var dataOutcomeByDate = response;
                    if(dataOutcomeByDate.length > 0){
                      var totalOutcome = 0;
                      dataOutcomeByDate.forEach(element1 => {
                        totalOutcome += element1.amount;
                      });
                      var per = (totalOutcome / element.amount)*100;
                      console.log(per);
                      if(per < 100){
                        var htmlSnippet = `
                          <div class="row">
                              <div class="col-md-2" style="color: #7f8285; font-size: 12px; padding-right: 0;">Đã thu</div>
                              <div class="col-md-10 align-self-center">
                                  <div class="progress" style="height: 10px;" role="progressbar" aria-label="Default striped example" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" >
                                      <div class="progress-bar progress-bar-striped bg-info" style="width: ${per}%"></div>
                                  </div>
                                  <label style="color: rgb(75, 102, 125); font-size: 12px; font-style: italic;">Đã chi ${per.toFixed(2)}% số tiền dự tính</label>
                              </div>
                          </div>
                        `;
                        $(`#collapse-${element.id} .DA-listOutcomeTran`).append(htmlSnippet);
                      }
                      else{
                        var htmlSnippet = `
                          <div class="row">
                              <div class="col-md-2" style="color: #7f8285; font-size: 12px; padding-right: 0;">Đã thu</div>
                              <div class="col-md-10 align-self-center">
                                  <div class="progress" style="height: 10px;" role="progressbar" aria-label="Default striped example" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" >
                                      <div class="progress-bar progress-bar-striped bg-danger" style="width: 100%"></div>
                                  </div>
                                  <label style="color: rgb(75, 102, 125); font-size: 12px; font-style: italic;">Đã chi vượt quá số dự tính</label>
                              </div>
                          </div>
                        `;
                        $(`#collapse-${element.id} .DA-listOutcomeTran`).append(htmlSnippet);
                      }
                      dataOutcomeByDate.forEach(element1 => {
                        var datedefault = formatDefauleDate(element1.time);
                        var htmlSnippet = `
                            <div class="mt-2" style="border-top: 1px solid rgba(138, 125, 125, 0.414);"></div>
                            <div class="row">
                                <div class="col-md-5 align-self-center" style="padding-right: 0;">
                                    <i class="fa-solid fa-circle text-warning" style="font-size: 8px;"></i>
                                    <label style="font-size: 14px; font-weight: 600; color: #07d1c2; padding-left: 4px;">${element1.category}</label>
                                </div>
                                <div class="col-md-7">
                                    <div class="" style="font-size: 12px; font-style: italic; color: #079bd1;">${datedefault}</div>
                                    <div class="mt-2 ">
                                        <div class="progress" style="height: 7px;" role="progressbar" aria-label="Default striped example" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100" >
                                            <div class="progress-bar progress-bar-striped bg-success" style="width: ${(element1.amount / element.amount)*100}%"></div>
                                        </div>
                                    </div>
                                    <div class="mt-2" style="font-size: 14px; font-weight: 600; color: rgb(0, 255, 0);">
                                        <label for="">${element1.amount.toLocaleString()}</label>
                                        <u>đ</u>
                                    </div>
                                </div>
                            </div>
                        `;
                        $(`#collapse-${element.id} .DA-listOutcomeTran`).append(htmlSnippet);
                      });
                    }
                },
                error: function(xhr, status, error) {
                  
                }
              });
            }
          });
          
        }
        else{
          var htmlSnippet = `
              <div style="text-align: center; color: black;">Chưa có khoản dự thu/dự chi nào</div>
                `;
              $('#DA-listIncomeGoal').append(htmlSnippet);

          var htmlSnippet = `
              <div style="text-align: center; color: black;">Chưa có khoản dự thu/dự chi nào</div>
                `;
              $('#DA-listOutcomeGoal').append(htmlSnippet);
        }
    },
        error: function(error, xhr) {
    }
});
}
// Hàm lấy tất cả các thu nhập



// Hàm lấy tên người dùng
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

$('#DA-filterIncomeGoal').click(function () {
  filterIncomeGoalByDate();
});
$('#DA-filterOutcomeGoal').click(function () {
  filterOutcomeGoalByDate();
});
// Hàm lọc theo ngày tháng thu nhập
function filterIncomeGoalByDate(){
  var filterStartDate = $('#DA-filterStartDate').val();
  var filterEndDate = $('#DA-filterEndDate').val();
  $.ajax({
    url: 'http://localhost:8080/goal/statistic?startDate='+filterStartDate+' 00:00:00&endDate='+filterEndDate+' 23:59:59',
    type: 'GET',
    headers: {
        "Authorization": TOKEN
    },
    processData: false,
    contentType: 'application/json',
    success: function(response) {
      var dataIncomeByDate = [];
      var mangGoalIncome = [];
      for(var i=0; i<response.length; i++) {
        if(response[i].type == "income"){
          objApi = {
              amount: response[i].amount,
              startDate: response[i].startDate,
              endDate: response[i].endDate
          };
          dataIncomeByDate.push(objApi);
          mangGoalIncome.push(response[i].amount);
        }
      }  
      var labelDate = [];
      var mangTong = [];
      for(var i=0; i<dataIncomeByDate.length; i++) {
        var ds = new Date(dataIncomeByDate[i].startDate);
        var de = new Date(dataIncomeByDate[i].endDate);
        var nameDate = ds.getDate() + '/' + (ds.getMonth()+1) + '-' + de.getDate() + '/' + (de.getMonth()+1);
        labelDate.push(nameDate); //Mảng labels ngày tháng bắt đầu, ngày tháng kết thúc
        $.ajax({
          url: "http://localhost:8080/transaction/statistic/income?start_date=" +dataIncomeByDate[i].startDate+ "&end_date=" +dataIncomeByDate[i].endDate+"&type=income",
          type: 'GET',
          headers: {
              "Authorization": TOKEN
          },
          processData: false,
          contentType: 'application/json',
          success: function(response) {
            var tong = 0;
            response.forEach(element1 => {
              tong += element1.amount;
            });
            mangTong.push(tong);
            myChartIncomeGoal.data.labels = labelDate;
            myChartIncomeGoal.data.datasets[0].data = mangTong;
            myChartIncomeGoal.data.datasets[1].data = mangGoalIncome;
            myChartIncomeGoal.update();
          },
              error: function(error, xhr) {
          }
      });
      } 
    },
        error: function(error, xhr) {
    }
  });
}

// Hàm lọc theo ngày tháng chi tiêu
function filterOutcomeGoalByDate(){
  var filterStartDate = $('#DA-filterStartDateOut').val();
  var filterEndDate = $('#DA-filterEndDateOut').val();
  $.ajax({
    url: 'http://localhost:8080/goal/statistic?startDate='+filterStartDate+' 00:00:00&endDate='+filterEndDate+' 23:59:59',
    type: 'GET',
    headers: {
        "Authorization": TOKEN
    },
    processData: false,
    contentType: 'application/json',
    success: function(response) {
      var dataIncomeByDate = [];
      var mangGoalIncome = [];
      for(var i=0; i<response.length; i++) {
        if(response[i].type == "outcome"){
          objApi = {
              amount: response[i].amount,
              startDate: response[i].startDate,
              endDate: response[i].endDate
          };
          dataIncomeByDate.push(objApi);
          mangGoalIncome.push(response[i].amount);
        }
      }  
      var labelDate = [];
      var mangTong = [];
      for(var i=0; i<dataIncomeByDate.length; i++) {
        var ds = new Date(dataIncomeByDate[i].startDate);
        var de = new Date(dataIncomeByDate[i].endDate);
        var nameDate = ds.getDate() + '/' + (ds.getMonth()+1) + '-' + de.getDate() + '/' + (de.getMonth()+1);
        labelDate.push(nameDate); //Mảng labels ngày tháng bắt đầu, ngày tháng kết thúc
        console.log(labelDate);
        $.ajax({
          url: "http://localhost:8080/transaction/statistic/outcome?start_date=" +dataIncomeByDate[i].startDate+ "&end_date=" +dataIncomeByDate[i].endDate+"&type=outcome",
          type: 'GET',
          headers: {
              "Authorization": TOKEN
          },
          processData: false,
          contentType: 'application/json',
          success: function(response) {
            var tong = 0;
            response.forEach(element1 => {
              tong += element1.amount;
            });
            mangTong.push(tong);
            console.log(mangTong);
            myChartOutcomeGoal.data.labels = labelDate;
            myChartOutcomeGoal.data.datasets[0].data = mangTong;
            myChartOutcomeGoal.data.datasets[1].data = mangGoalIncome;
            myChartOutcomeGoal.update();
          },
              error: function(error, xhr) {
          }
      });
      } 
    },
        error: function(error, xhr) {
    }
  });
}

// Xử lý khi mở modal thêm thì reset các ô input
$('#DA-resetGoal').click(function () {
      $('#AddGoalAmount').val('');
      $('#AddGoalType').val('income');
      $('#AddGoalType').prop('disabled', false);
      $('#AddGoalStart').val('');
      $('#AddGoalEnd').val('');
      $('#DA-showError').removeClass('showErrorGoal');
      $('#DA-btnAdd').addClass("showErrorGoal");
      $('#DA-btnUpdate').removeClass("showGoal");
      $('#DA-btnDelete').removeClass("showGoal");
});

//validate
function showMessageError(inputElement, errorMessage) {
  let errorElement = inputElement.parentElement.querySelector('.formMessage');
  errorElement.innerHTML = errorMessage;
  inputElement.parentElement.classList.add('invalid');
}


function showMessageSuccess(inputElement) {
  let successElement = inputElement.parentElement.querySelector('.formMessage');
  successElement.innerText = '';
  inputElement.parentElement.classList.remove('invalid');
}

function validatorEmptyError(input) {
  let isEmptyError = false;
  input.value = input.value.trim();
  if (!input.value) {
      isEmptyError = true;
      showMessageError(input, 'Vui lòng nhập trường này');

  } else {
      showMessageSuccess(input);

  }
  return isEmptyError
}

function validatorAmount(input) {
    let isAmount = false;
    let regex = /^[1-9][0-9]*$/;

    if (!validatorEmptyError(input)) {
        if (!regex.test(input.value)) {
            showMessageError(input, 'Bạn đã nhập sai định dạng số tiền');
        } else {
            isAmount = true;
            showMessageSuccess(input);
        }

    }
    return isAmount
}

// Đăng xuất
$('#DA-logout').click(function () {
    localStorage.removeItem('token');
    window.location.href = "./login.html";
});
function formatTimestampToDate(timestamp) {
  var date = new Date(timestamp*1);

  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  var hours = String(date.getHours()).padStart(2, "0");
  var minutes = String(date.getMinutes()).padStart(2, "0");
  var seconds = String(date.getSeconds()).padStart(2, "0");

  var formattedDateTime = day + "/" + month + "/" + year;
  return formattedDateTime; // Kết quả: "2021/11/24 00:00:00"
}

function formatStartDate(param) {
  var date = new Date(param*1);

  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");

  var formattedDateTime = year + "-" + month + "-" + day + " 00:00:00";
  return formattedDateTime; 
}
function formatEndDate(param) {
  var date = new Date(param*1);

  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");

  var formattedDateTime = year + "-" + month + "-" + day + " 23:59:59";
  return formattedDateTime; // Kết quả: "2021/11/24 00:00:00"
}
function formatDefauleDate(param) {
  var date = new Date(param);

  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");

  var formattedDateTime = day + "/" + month + "/" + year;
  return formattedDateTime; 
}

function setDefaultStartDate() {
  var now = new Date(); // Lấy thời gian hiện tại
  var currentYear = now.getFullYear(); // Lấy năm hiện tại

  var startOfYear = new Date(currentYear, 0, 1); // Đặt thời gian là đầu năm
  var formattedDate = formatDate(startOfYear); // Định dạng thời gian
  document.getElementById('DA-filterStartDate').value = formattedDate;
  document.getElementById('DA-filterStartDateOut').value = formattedDate;
}
function setDefaultEndDate() {
  var now = new Date(); // Lấy thời gian hiện tại
  var currentYear = now.getFullYear(); // Lấy năm hiện tại

  var startOfYear = new Date(currentYear, 11, 31); // Đặt thời gian là đầu năm
  var formattedDate = formatDate(startOfYear); // Định dạng thời gian
  document.getElementById('DA-filterEndDate').value = formattedDate;
  document.getElementById('DA-filterEndDateOut').value = formattedDate;
}
function formatDate(date) {
  var year = date.getFullYear();
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);
  return year + '-' + month + '-' + day;
}
