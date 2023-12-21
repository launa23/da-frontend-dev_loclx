var isLogin = !!localStorage.getItem("token");
const TOKEN = localStorage.getItem("token");
function checkLogin() {
    if (isLogin != 1) {
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
    getAllIncomeTransactionOfUser();
    getAllIncomeTransactionOfUserToday();
    getAllIncomeCategoryOfUser();
    resetDataForm();
    calculateTotalMoney();
    ChartTransactionToday();
   // searchIconCategory();
});
$('#incomeTable').DataTable();
function getAllIncomeTransactionOfUser() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/transaction/income",
        headers: {
            "Authorization": TOKEN
        },
        success: function (data) {
            let dataAllIncomeTran = JSON.parse(JSON.stringify(data));
            let tableIncomeTran = $('#incomeTable').DataTable();
            dataAllIncomeTran.forEach(function (incomeTran) {
                if (incomeTran.active == true) {
                    tableIncomeTran.row.add([
                        incomeTran.id, //ren ra id sua 28/11
                        incomeTran.desc,
                        incomeTran.time,
                        incomeTran.category,
                        incomeTran.amount.toLocaleString()
                    ]).draw();
                }
            });
            tableIncomeTran.column(0).visible(false);// an cot id
            // tableIncomeTran.column(1).visible(false);// an cot id category

            fillInfoIncomeTransactionToForm(tableIncomeTran);
            createIncomeTransaction();

        }
    })
};

function getAllIncomeTransactionOfUserToday() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let startDate = year + '-' + month + '-' + day + ' 00:00:00';
    let endDate = year + '-' + month + '-' + day + ' 23:59:59';

    $.ajax({
        url: "http://localhost:8080/transaction/statistic/income",
        type: "GET",
        headers: {
            "Authorization": TOKEN
        },
        data: {
            start_date: startDate,
            end_date: endDate,
            type: 'income'
        },
        success: function (data) {
            if (data.length > 0) {
                renderIncomeTransactionToday(data);
            }
            else {
                var htmlSnippet = `
                    <h6 class="mt-4" style="text-align: center; color: #606060;">Chưa có khoản thu nào trong hôm nay</h6>
                        `;
                $('#myIncomeTransToday').html(htmlSnippet);


            }
        }
    })
};
// Handle Income Category
function getAllIncomeCategoryOfUser() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/category/income",
        headers: {
            "Authorization": TOKEN
        },
        success: function (data) {
            searchIconCategory();
            searchCategoryInFormCreate(JSON.parse((JSON.stringify(data))));
            // searchCategoryInFormUpdate(JSON.parse((JSON.stringify(data))));
            renderIncomeCategory(JSON.parse((JSON.stringify(data))));
            createIncomeCategory();
        }
    });


}
function searchCategoryInFormCreate(incomecategory) {
    let selectIncomeCategory = document.querySelectorAll(".selectIncomeCategory > select");
    let htmlsIncomeCategory = incomecategory.map(function (category) {
        if (category.active == true) {
            return `
            <option value="${category.id}">${category.name}</option>
            `
        }
    });
    selectIncomeCategory.forEach(function (selectCate) {
        selectCate.innerHTML = htmlsIncomeCategory.join(" ");
    });
}

// tam van can phai sua
function searchIconCategory() {
    // an vao icon hien modal
    var openModalButton = document.querySelectorAll('.DA-open-modal');
    // an nut close dong modal
    var closeModalButton = document.querySelectorAll('.DA-close-modal');
    //lay ra modal
    var modal = document.querySelector('.DA-modal');
    //lop phu bong mo
    var overlay = document.querySelector('.DA-overlay');

    openModalButton.forEach(function (open) {
        open.addEventListener('click', function () {
            modal.style.display = 'block';
            overlay.style.display = 'block';
        });
    });

    closeModalButton.forEach(function (close) {
        close.addEventListener('click', function () {
            modal.style.display = 'none';
            overlay.style.display = 'none';
        });
    });

    overlay.addEventListener('click', function () {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });

}

function selectIconCategoryInFormUpdate() {
    let listIcon = document.querySelectorAll(".DA-OpIcon > img");
    let overlayModalIcon = document.getElementById("overlayModalIcon");
    let modalIcon = document.getElementById("modalIcon");

    listIcon.forEach(function (icon) {
        icon.addEventListener('click', function () {
            $("#updateIconIncomeCategory").attr("src", icon.src);
            $("#updateSourceIncomeCategory").val(icon.src);
            overlayModalIcon.style.display = 'none';
            modalIcon.style.display = 'none';
        });
    })
}


function selectIconCategoryInFormCreate() {
    let listIcon = document.querySelectorAll(".DA-OpIcon > img");
    let overlayModalIcon = document.getElementById("overlayModalIcon");
    let modalIcon = document.getElementById("modalIcon");

    listIcon.forEach(function (icon) {
        icon.addEventListener('click', function () {
            $("#createIconIncomeCategory").attr("src", icon.src);
            $("#createSourceIncomeCategory").val(icon.src);
            overlayModalIcon.style.display = 'none';
            modalIcon.style.display = 'none';
        });
    })
}

function createIncomeCategory() {
    selectIconCategoryInFormCreate();
    let formCreateIncomeCategory = document.getElementById("myCategory");
    let jsonDataCreate = {};

    formCreateIncomeCategory.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
//validate
let input = formCreateIncomeCategory.querySelector("input[name='name']");
let validateMaxLength = validatorMaxLength(input, 35);

if (validateMaxLength) {
    let formDataCreate = new FormData(this); // Tạo đối tượng FormData từ form
    // vi income category k co category cha nen :
    jsonDataCreate["parent"] = "";
    // Lap qua tung cap key value va gan no vao 1 chuoi dinh dang json de submit khi goi api
    for (var item of formDataCreate.entries()) {
        // item[0] de lay khoa(name cua trong input) item[1] de lay value
        jsonDataCreate[item[0]] = item[1];
    }
    // xu li lay src cua icon
    // Sử dụng dữ liệu JSON theo ý muốn (ví dụ: gửi đi bằng Ajax)    
    $.ajax({
        url: "http://localhost:8080/category/create/income",
        type: "POST",
        headers: {
            "Authorization": TOKEN
        },
        contentType: "application/json",
        data: JSON.stringify(jsonDataCreate),

        success: function (response) {
            // Xử lý dữ liệu trả về thành công
            location.reload();

        },
        error: function (xhr, status, error) {
            // Xử lý lỗi
            console.error(error);
            showMessageError(input,"Tên danh mục đã tồn tại!");
        }
    });
    //reset form
    this.reset();
}
    });
}
function renderIncomeCategory(dataAllIncomeCate) {
    let listIncomeCategory = document.getElementById("myIncomeCategory");
    let htmlsIncomeCategory = dataAllIncomeCate.map(function (incomeCate) {
        if (incomeCate.active == true) {
            if (incomeCate.user != 0) {
                return `
                <li>
                    <div class="img-icon">
                        <img src="${incomeCate.icon}" alt="">
                    </div>
                    <a id='${incomeCate.id}' href="" class= "userCategory">${incomeCate.name}</a>
                </li>
                `
            } else {
                return `
                <li>
                    <div class="img-icon">
                        <img src="${incomeCate.icon}" alt="">
                    </div>
                    <a id='${incomeCate.id}' href="" class= "systemCategory">${incomeCate.name}</a>
                </li>
                `
            }
        }
    });

    listIncomeCategory.innerHTML = htmlsIncomeCategory.join(" ");
    fillInfoIncomeCategoryToForm();
}

// Do du lieu vao modal updateIncomeCategory khi click vao category tuong ung
function fillInfoIncomeCategoryToForm() {
    // Lay du lieu da co fill vao modal danh muc de sua
    let iconIncomeCategory;
    let listLinkIncomeCategoryOfUser = document.querySelectorAll("#myIncomeCategory > li > .userCategory");
    let listLinkIncomeCategoryOfSystem = document.querySelectorAll("#myIncomeCategory > li > .systemCategory");
    listLinkIncomeCategoryOfUser.forEach(function (incomeCategory) {
        incomeCategory.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chặn gửi link mặc định
            event.stopPropagation();
            iconIncomeCategory = ($(incomeCategory).parent('li').children('.img-icon').children())[0].attributes[0].value;
            $("#updateNameIncomeCategory").val(incomeCategory.innerHTML);
            $("#updateSourceIncomeCategory").val(iconIncomeCategory);
            $("#updateIconIncomeCategory").attr("src", iconIncomeCategory);
            $("#updateIncomeCategory").modal("show");
            $("#updateIdIncomeCategory").val($(incomeCategory).attr('id'));
        })
    });

    listLinkIncomeCategoryOfSystem.forEach(function (incomeCategory) {
        incomeCategory.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chặn gửi link mặc định
            event.stopPropagation();
        })
    });

    //sua hoac xoa category
    updateOrDeleteIncomeCategory();
}

// sua + xoa dong income category
function updateOrDeleteIncomeCategory() {
    selectIconCategoryInFormUpdate();
    //Bat su kien submit khi gui du lieu danh muc moi (khi nhan nut luu)    
    let formUpdateIncomeCategory = document.getElementById("updateInfoCategory");
    let idIncomeCategory;
    let jsonDataUpdate = {};
    //Khai bao 1 bien kieu chuoi json de luu thong tin thay doi
    formUpdateIncomeCategory.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
        let formDataUpdate = new FormData(this); // Tạo đối tượng FormData từ form
        if (event.submitter.name === "updateIncomeCategory") {
            // Xử lý sự kiện khi nhấn nút updateIncomeCategory 
            //validate
            let input = formUpdateIncomeCategory.querySelector("input[name='name']");
            let validateMaxLength = validatorMaxLength(input, 35);
           
            if (validateMaxLength) {
                jsonDataUpdate = {};
                // vi income category k co category cha nen :
                jsonDataUpdate["parent"] = "";
                // Lap qua tung cap key value va gan no vao 1 chuoi dinh dang json de submit khi goi api
                for (var item of formDataUpdate.entries()) {
                    // item[0] de lay khoa(name cua trong input) item[1] de lay value
                    if (item[0] == "id") {
                        idIncomeCategory = item[1];
                    } else {
                        jsonDataUpdate[item[0]] = item[1];
                    }
                }
    
                $.ajax({
                    url: "http://localhost:8080/category/update/" + idIncomeCategory,
                    type: "PUT",
                    headers: {
                        "Authorization": TOKEN
                    },
                    contentType: "application/json",
                    data: JSON.stringify(jsonDataUpdate),
    
                    success: function (response) {
                        // Xử lý dữ liệu trả về thành công
                        //console.log(response);
                        location.reload();
                    },
                    error: function (xhr, status, error) {
                        // Xử lý lỗi
                        console.log(error);
                    }
                });
            }
        } else if (event.submitter.name === "daleteIncomeCategory") {
            // Xử lý sự kiện khi nhấn nút Submit daleteIncomeCategory
            for (var item of formDataUpdate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "id") {
                    idIncomeCategory = item[1];
                }
            }
            let confirmDeleteCate = confirm('Bạn có chắc muốn xoá danh mục thu nhập này ?');
            if (confirmDeleteCate) {
                $.ajax({
                    url: "http://localhost:8080/category/delete/" + idIncomeCategory,
                    type: "PUT",
                    headers: {
                        "Authorization": TOKEN
                    },
                    success: function (response) {
                        // Xử lý dữ liệu trả về thành công
                        //console.log(response);
                        location.reload();
                    },
                    error: function (xhr, status, error) {
                        // Xử lý lỗi
                        console.log(error);
                    }
                });
            }
        }
    })
};


//Handle Income Transaction
function renderIncomeTransactionToday(dataIncomeTransToday) {
    let listIncomeTransToday = document.getElementById("myIncomeTransToday");
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
};


function createIncomeTransaction() {
    let formCreateIncomeTransaction = document.getElementById("myIncome");
    let jsonDataCreate = {};

    formCreateIncomeTransaction.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
        //validate 
        let inputNames = ['desc', 'time', 'amount']; // Các tên input bạn muốn lấy
        let inputs = formCreateIncomeTransaction.querySelectorAll(`input[name="${inputNames.join('"], input[name="')}"]`);
        let validateMaxLength = validatorMaxLength(inputs[0], 35);
        let validateAmount = validatorAmount(inputs[1]);
        let validateDate = validatorDate(inputs[2]);
       
        if (validateMaxLength && validateAmount && validateDate) {
            let formDataCreate = new FormData(this); // Tạo đối tượng FormData từ form
            for (var item of formDataCreate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "time") {
                    jsonDataCreate[item[0]] = formatDate(item[1]);
    
                } else if (item[0] == "amount") {
                    jsonDataCreate[item[0]] = parseFloat(item[1]);
                }
                else {
                    jsonDataCreate[item[0]] = item[1];
                }
            }
            // jsonDataCreate["active"] = true;
    
            // Sử dụng dữ liệu JSON theo ý muốn (ví dụ: gửi đi bằng Ajax)
            $.ajax({
                url: "http://localhost:8080/transaction/create/income",
                type: "POST",
                headers: {
                    "Authorization": TOKEN
                },
                contentType: "application/json",
                data: JSON.stringify(jsonDataCreate),
    
                success: function (response) {
                    // Xử lý dữ liệu trả về thành công
                    location.reload();
                },
                error: function (xhr, status, error) {
                    // Xử lý lỗi
                    console.error(error);
                }
            });
    
            // Reset form (nếu cần)
            this.reset();
        }
        
        
        

    });
}

function fillInfoIncomeTransactionToForm(tableIncomeTran) {
    // Lay du lieu da co fill vao modal danh muc de sua
    // let selectIncomeCategoryOld = document.querySelector(".selectUpdateIncomeCategory > select");
    $('#incomeTable tbody').on('click', 'tr', function () {
        // Lấy dữ liệu của dòng được chọn
        rowDataSelect = tableIncomeTran.row(this).data();

        // do du lieu cua dong can sua vao form
        $("#updateDescIncomeTransaction").val(rowDataSelect[1]);
        $("#updateAmountIncomeTransaction").val(rowDataSelect[4].replace(/,/g, "").replace(/\./g, ""));
        $("#updateTimeIncomeTransaction").val(rowDataSelect[2]);
        $("#updateCategoryIncomeTransaction").val(rowDataSelect[3]);
        $("#updateIdIncomeTransaction").val(rowDataSelect[0]);
        $("#updateIncomeTransaction").modal("show");
    });
    // sua hoac xoa income
    updateOrDeleteIncomeTransaction();
}

//sua income transaction  // ham can truyen vao tableIncomeTran id select
function updateOrDeleteIncomeTransaction() {
    //Bat su kien submit khi gui du lieu khoan thu moi (khi nhan nut luu)    
    let formUpdateTransactionIncome = document.getElementById("updateInfoTransaction");
    //Khai bao 1 bien kieu chuoi json de luu thong tin thay doi
    let idIncomeTransaction;
    let jsonDataUpdate = {};
    formUpdateTransactionIncome.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
        let formDataUpdate = new FormData(this); // Tạo đối tượng FormData từ form
        if (event.submitter.name === "updateIncomeTransaction") {
            // Xử lý sự kiện khi nhấn nút updateIncomeCategory 

             //validate
             let inputNames = ['desc', 'time', 'amount']; // Các tên input bạn muốn lấy
        let inputs = formUpdateTransactionIncome.querySelectorAll(`input[name="${inputNames.join('"], input[name="')}"]`);
        let validateMaxLength = validatorMaxLength(inputs[0], 35);
        let validateAmount = validatorAmount(inputs[1]);
        let validateDate = validatorDate(inputs[2]);
        if (validateMaxLength && validateAmount && validateDate) {
            jsonDataUpdate = {};
            // Lap qua tung cap key value va gan no vao 1 chuoi dinh dang json de submit khi goi api
            for (var item of formDataUpdate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "time") {
                    jsonDataUpdate[item[0]] = formatDate(item[1]);
                    //formatDate(item[1]);

                }
                else if (item[0] == "amount") {
                    jsonDataUpdate[item[0]] = parseFloat(item[1]);
                }
                else if (item[0] == "id") {
                    idIncomeTransaction = item[1];
                }
                else {
                    jsonDataUpdate[item[0]] = item[1];
                }
            }

            $.ajax({
                url: "http://localhost:8080/transaction/update/" + idIncomeTransaction,
                type: "PUT",
                headers: {
                    "Authorization": TOKEN
                },
                contentType: "application/json",
                data: JSON.stringify(jsonDataUpdate),

                success: function (response) {
                    // Xử lý dữ liệu trả về thành công
                    //console.log(response);
                    location.reload();
                },
                error: function (xhr, status, error) {
                    // Xử lý lỗi
                    console.log(error);
                }
            });
        
        
        }
        } else if (event.submitter.name === "daleteIncomeTransaction") {
            // Xử lý sự kiện khi nhấn nút Submit daleteIncomeCategory
            for (var item of formDataUpdate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "id") {
                    idIncomeTransaction = item[1];
                }
            }
            let confirmDeleteTrans = confirm('Bạn có chắc muốn xoá khoản thu nhập này ?');
            if (confirmDeleteTrans) {
                $.ajax({
                    url: "http://localhost:8080/transaction/delete/" + idIncomeTransaction,
                    type: "PUT",
                    headers: {
                        "Authorization": TOKEN
                    },
                    success: function (response) {
                        // Xử lý dữ liệu trả về thành công
                        //console.log(response);
                        location.reload();
                    },
                    error: function (xhr, status, error) {
                        // Xử lý lỗi
                        console.log(error);
                    }
                });
            }
        }


    })

}

//neu nguoi dung nhap thong tin them moi nhung k them ma an nut x thi xoa du lieu trong form do
function resetDataForm() {
    let closeModalButton = document.querySelector(".btn-close-form-create");
    closeModalButton.addEventListener('click', function () {
        document.getElementById("myIncome").reset();
        document.getElementById("myCategory").reset();
        //resetSomeInputInFormCreateSaving();
        let formMessagesInIcome = document.querySelectorAll("#myIncome .formMessage");
        formMessagesInIcome.forEach(function (formMessage) {
            formMessage.innerText = '';
            formMessage.parentElement.classList.remove('invalid');
        })
        let formMessagesInCategory = document.querySelectorAll("#myCategory .formMessage");
        formMessagesInCategory.forEach(function (formMessage) {
            formMessage.innerText = '';
            formMessage.parentElement.classList.remove('invalid');
        })

    });

    let closeModalButtonuFormUpdateCategory = document.querySelector(".btn-close-form-update-category");
    closeModalButtonuFormUpdateCategory.addEventListener('click', function () {
        let formMessages = document.querySelectorAll("#updateInfoCategory .formMessage");
        formMessages.forEach(function (formMessage) {
            formMessage.innerText = '';
            formMessage.parentElement.classList.remove('invalid');
        })
    });

    let closeModalButtonuFormUpdateTransaction = document.querySelector(".btn-close-form-update-transaction");
    closeModalButtonuFormUpdateTransaction.addEventListener('click', function () {
        let formMessages = document.querySelectorAll("#updateInfoTransaction .formMessage");
        formMessages.forEach(function (formMessage) {
            formMessage.innerText = '';
            formMessage.parentElement.classList.remove('invalid');
        })
    });
}




// chart phia tren goc trai
var ctx = document.getElementById('myChart');

var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Thu', 'Chi'],
        datasets: [{
            label: 'Số tiền',
            data: [],
            backgroundColor: [
                'rgba(42, 255, 100)',
                'rgba(200, 100, 74)'
            ],
            borderWidth: 1
        },
        ]
    },
    options: {
        plugins: {
            legend: {
                display: false,
                labels: {
                    fontColor: 'red' // Mảng các màu cho các label tương ứng
                }
            }
        },
        indexAxis: 'y',
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Hàm xử lý tổng số tiền
function calculateTotalMoney() {

    $.ajax({
        url: "http://localhost:8080/user/current",
        type: "GET",
        headers: {
            "Authorization": TOKEN
        },
        success: function (response) {
            $('#tongsodu').text(response.money.toLocaleString());
        },
        error: function (xhr, status, error) {
            // Xử lý lỗi
            console.log(error);
        }
    });

}


// Hàm thay đổi biểu đồ khi chọn "Hôm nay" hoặc "Tháng này"
function myFunction() {
    var selectedValue = document.getElementById("mySelect").value;
    if (selectedValue == "homnay") {
        ChartTransactionToday();
    }
    else {
        ChartTransactionThisMonth();
    }
}
//   Hàm xử lý khi chọn "Hôm nay"
function ChartTransactionToday() {
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let startDate = year + '-' + month + '-' + day + ' 00:00:00';
    let endDate = year + '-' + month + '-' + day + ' 23:59:59';
    $.ajax({
        url: "http://localhost:8080/transaction/statistic/income",
        type: "GET",
        headers: {
            "Authorization": TOKEN
        },
        data: {
            start_date: startDate,
            end_date: endDate,
            type: 'income'
        },
        success: function (response) {
            var toltalIncomeToday = 0;
            for (var i = 0; i < response.length; i++) {
                toltalIncomeToday += response[i].amount
            }

            $.ajax({
                url: "http://localhost:8080/transaction/statistic/outcome",
                type: "GET",
                headers: {
                    "Authorization": TOKEN
                },
                data: {
                    start_date: startDate,
                    end_date: endDate,
                    type: 'outcome'
                },
                success: function (response) {
                    var toltalOutcomeToday = 0;
                    for (var i = 0; i < response.length; i++) {
                        toltalOutcomeToday += response[i].amount
                    }
                    myChart.data.datasets[0].data = [toltalIncomeToday, toltalOutcomeToday];
                    myChart.update();
                }
            })
        }
    })
}
//   Hàm xử lý khi chọn "Tháng này"
function ChartTransactionThisMonth() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = 1; // Ngày đầu tháng
    var lastDay = new Date(year, month, 0).getDate(); // Ngày cuối tháng
    let startDate = year + '-' + month + '-' + day + ' 00:00:00';
    let endDate = year + '-' + month + '-' + lastDay + ' 23:59:59';
    $.ajax({
        url: "http://localhost:8080/transaction/statistic/income",
        type: "GET",
        headers: {
            "Authorization": TOKEN
        },
        data: {
            start_date: startDate,
            end_date: endDate,
            type: 'income'
        },
        success: function (response) {
            console.log(response);
            var toltalIncomeToday = 0;
            for (var i = 0; i < response.length; i++) {
                toltalIncomeToday += response[i].amount
            }


            $.ajax({
                url: "http://localhost:8080/transaction/statistic/outcome",
                type: "GET",
                headers: {
                    "Authorization": TOKEN
                },
                data: {
                    start_date: startDate,
                    end_date: endDate,
                    type: 'outcome'
                },
                success: function (response) {

                    var toltalOutcomeToday = 0;
                    for (var i = 0; i < response.length; i++) {
                        toltalOutcomeToday += response[i].amount
                    }

                    myChart.data.datasets[0].data = [toltalIncomeToday, toltalOutcomeToday];
                    myChart.update();
                }
            })
        }
    })
}

function getName() {
    $.ajax({
        url: 'http://localhost:8080/user/current',
        type: 'GET',
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: 'application/json',
        success: function (response) {
            $('#DA-HoVaTen').text(response.name);
            if (response.money == null) {
                $('#DA-overlayNullorMoney').addClass('DA-show');
                $('#modalMoneyStart').addClass('DA-show');
            }
        },
        error: function (error, xhr) {
        }
    });
}
$('#DA-setMoney').click(function () {
    //validate 
    let validateSurMoney = validatorSurMoney(document.getElementById("DA-inpMoney"));
        if(validateSurMoney){
            var data = {
                money: parseFloat($('#DA-inpMoney').val())
            };
            console.log($('#DA-inpMoney').val());
            $.ajax({
                url: 'http://localhost:8080/user/setmoney',
                type: 'POST',
                headers: {
                    "Authorization": TOKEN
                },
                data: JSON.stringify(data),
                processData: false,
                contentType: 'application/json',
                success: function (response) {
                    location.reload();
                },
                error: function (error, xhr) {

                }
            });
        }
});



//Handle datetime-local cua the input sang dinh dang nam-thang-ngay gio:phut:giay
function formatDate(dateTime) {
    var date = new Date(dateTime);
    var year = date.getFullYear();
    var month = padZero(date.getMonth() + 1);
    var day = padZero(date.getDate());
    var hours = padZero(date.getHours());
    var minutes = padZero(date.getMinutes());
    var seconds = padZero(date.getSeconds());

    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

function padZero(value) {
    return value.toString().padStart(2, "0");
}

// thuc hien tao ra cac ham va thong bao de validate
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


function validatorMaxLength(input, max) {
    let isMaxLength = false;

    if (!validatorEmptyError(input)) {
        if (input.value.length > max) {
            showMessageError(input, 'Bạn đã nhập quá 35 ký tự');
        } else {
            isMaxLength = true;
            showMessageSuccess(input);
        }

    }
    return isMaxLength
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

function validatorDate(input) {
    let isDate = false;
    let regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

    if (!validatorEmptyError(input)) {
        if (!regex.test(input.value)) {
            showMessageError(input, 'Bạn đã nhập sai định dạng thời gian');
        } else {
            isDate = true;
            showMessageSuccess(input);
        }

    }
    return isDate
}

function validatorSurMoney(input) {
    let isSurMoney = false;
    let regex = /^(?:[1-9][0-9]{6,7}|100000000)$/;
    if (!validatorEmptyError(input)) {
        if (!regex.test(input.value)) {
            showMessageError(input, 'Số tiền cần lớn hơn 1 triệu và nhỏ hơn 100 triệu');
        } else {
            isSurMoney = true;
            showMessageSuccess(input);
        }

    }
    return isSurMoney

}

// Đăng xuất
$('#DA-logout').click(function () {
    localStorage.removeItem('token');
    window.location.href = "./login.html";
});