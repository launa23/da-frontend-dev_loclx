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
// khi ma load trang web no se goi den ham nay $document.ready()
$(document).ready(function () {
    getName();
    getTotalMoney();
    getAllSavingOfUser();
    getBankInfo(0);
    getAllBankInfo();
    resetDataForm();
    getStatisticSaving();
});
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

function getTotalMoney(){
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/saving/calculate',
        headers: {
            "Authorization": TOKEN
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


function getAllSavingOfUser() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/saving/",
        headers: {
            "Authorization": TOKEN
        },
        success: function (data) {
            let dataAllSaving = JSON.parse(JSON.stringify(data));
            let tableSaving = $('#savingTable').DataTable();
            dataAllSaving.forEach(function (saving) {
                if (saving.active == true) {
                    if (saving.bankInfo.term == -1) {
                        tableSaving.row.add([
                            saving.bankInfo.bankName, //ren ra id sua 28/11
                            saving.desc,
                            saving.startDate,
                            "Không kỳ hạn",
                            saving.amount.toLocaleString(),
                            saving.bankInfo.interestRate,
                            0,
                            0,
                            saving.id

                        ]).draw();
                    }
                    else {
                        tableSaving.row.add([
                            saving.bankInfo.bankName, //ren ra id sua 28/11
                            saving.desc,
                            saving.startDate,
                            saving.bankInfo.term,
                            saving.amount.toLocaleString(),
                            saving.bankInfo.interestRate,
                            (parseFloat((parseFloat(saving.amount) * parseFloat(saving.bankInfo.term) * ((parseFloat(saving.bankInfo.interestRate) / 100) / 12)).toFixed(0))).toLocaleString(),
                            (saving.amount + (parseFloat((parseFloat(saving.amount) * parseFloat(saving.bankInfo.term) * ((parseFloat(saving.bankInfo.interestRate) / 100) / 12)).toFixed(0)))).toLocaleString(),
                            saving.id
                        ]).draw();
                    }
                }
            });
            tableSaving.column(8).visible(false);// an cot id
            // tableIncomeTran.column(1).visible(false);// an cot id category

            fillInfoSavingToForm(tableSaving);
            createSaving();

        }
    });

}




//handle bankinfo
function getBankInfo(page) {
    if (page == null) {
        call = "http://localhost:8080/bankinfo?page=0&size=5"
    } else {
        call = "http://localhost:8080/bankinfo?page=" + page + "&size=5"
    }
    $.ajax({
        type: "GET",
        url: call,
        headers: {
            "Authorization": TOKEN
        },
        success: function (data) {
            // console.log(data);
            pagination(data);
            renderBankInfo(data.content);
        }
    });
}

//handle bankinfo
function getAllBankInfo() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/bankinfo",
        headers: {
            "Authorization": TOKEN
        },
        success: function (data) {
            // console.log(data);
            searchBankNameInFormCreate(data.content);
            createBankInfo();
        }
    });
}

function pagination(data){
    var prevButton = document.getElementById("bankAmount");
    prevButton.textContent = data.totalElements + " ngân hàng"
    var prevButton = document.getElementById("bankInfoPrev");
    var nextButton = document.getElementById("bankInfoNext");
    if(data.last){
        nextButton.disabled = true
    } else {
        nextButton.onclick = function(){
            getBankInfo(data.number + 1)
        }
    }
    if(data.first){
        prevButton.disabled = true
    } else {
        prevButton.onclick = function(){
            getBankInfo(data.number - 1)
        }
    }
}

function renderBankInfo(dataAllBankInfo) {
    let htmlFirst;
    let htmlMid;
    let htmlEnd;

    let listBankInfo = document.getElementById("myBankInfo");
    let htmlsBankInfo = dataAllBankInfo.map(function (bankInfo) {
        if (bankInfo.active == true) {
            if (bankInfo.user != 0) {
                htmlFirst = `
                <li class="row mb-2 DA-bank-style userBank" id="${bankInfo.id}">
                    <div class="col-sm-1 align-self-center" style="padding-left: 14px;">
                    <i class="fa-solid fa-circle" style="font-size: 8px !important; color: #f6465d;"></i>
                    </div>
                    <div class="col-sm-4 align-self-center">
                    <label class="bankName">${bankInfo.bankName}</label>
                    </div>
                    <div class="col-sm-3 align-self-center">
                    <label class="banklabel" style="float: inline-end;">
                        <label for="">${bankInfo.interestRate}</label>
                        <label for=""> %</label>
                    </label>
                    </div>
                    <div class="col-sm-4 align-self-center" style="float: inline-end;"> `

                htmlMid;
                if (bankInfo.term != -1) {
                    htmlMid = `<label class="bankAmount">
                        <label>${bankInfo.term}</label>
                        <label>tháng</label>
                    </label>`
                } else {
                    htmlMid = `<label class="bankAmount">
                        <label>Không kỳ hạn</label>
                    </label>`
                }

                htmlEnd = `
                    </div>
                </li>
                `
                return htmlFirst + htmlMid + htmlEnd
            } else {
                htmlFirst = `
                <li class="row mb-2 DA-bank-style systemBank" id="${bankInfo.id}">
                    <div class="col-sm-1 align-self-center" style="padding-left: 14px;">
                    <i class="fa-solid fa-circle" style="font-size: 8px !important; color: #f6465d;"></i>
                    </div>
                    <div class="col-sm-4 align-self-center">
                    <label class="bankName">${bankInfo.bankName}</label>
                    </div>
                    <div class="col-sm-3 align-self-center">
                    <label class="banklabel" style="float: inline-end;">
                        <label for="">${bankInfo.interestRate}</label>
                        <label for=""> %</label>
                    </label>
                    </div>
                    <div class="col-sm-4 align-self-center" style="float: inline-end;"> `

                htmlMid;
                if (bankInfo.term != -1) {
                    htmlMid = `<label class="bankAmount">
                        <label>${bankInfo.term}</label>
                        <label>tháng</label>
                    </label>`
                } else {
                    htmlMid = `<label class="bankAmount">
                        <label>Không kỳ hạn</label>
                    </label>`
                }

                htmlEnd = `
                    </div>
                </li>
                `
                return htmlFirst + htmlMid + htmlEnd
            }
        }
    });
    listBankInfo.innerHTML = htmlsBankInfo.join(" ");
    fillBankInfoToForm();
}

function fillBankInfoToForm() {
    // Lay du lieu da co fill vao modal danh muc de sua
    let listLinkBankInfoOfUser = document.querySelectorAll("#myBankInfo > .userBank");
    let listLinkBankInfoOfSystem = document.querySelectorAll("#myIncomeCategory > .systemBank");
    listLinkBankInfoOfUser.forEach(function (bankInfo) {
        bankInfo.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chặn gửi link mặc định
            event.stopPropagation();
            $("#updateInfoBankName").val(bankInfo.children[1].innerText);
            $("#updateInfoBankTerm").val((bankInfo.children[3].children[0].childNodes[1].innerText));
            $("#updateInfoBankInterestRate").val((bankInfo.children[2].children[0].childNodes[1].innerText));
            $("#updateBankInfo").modal("show");
            //id cua ngan hang can sua
            $("#updateInfoBankId").val($(bankInfo).attr('id'));
        })
    });

    listLinkBankInfoOfSystem.forEach(function (bankInfo) {
        bankInfo.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chặn gửi link mặc định
            event.stopPropagation();
        })
    });

    //sua hoac xoa bankinfo
    updateOrDeleteBankInfo();
}

// lam tiep tu day 16/12/2023
function updateOrDeleteBankInfo() {
    //Bat su kien submit khi gui du lieu khoan thu moi (khi nhan nut luu)    
    let formUpdateBankInfo = document.getElementById("updateInfoBank");
    //Khai bao 1 bien kieu chuoi json de luu thong tin thay doi
    let idBankInfo;
    let jsonDataUpdate = {};
    formUpdateBankInfo.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
        let formDataUpdate = new FormData(this); // Tạo đối tượng FormData từ form
        if (event.submitter.name === "updateBankInfo") {
            // Xử lý sự kiện khi nhấn nút updateBankInfo 
            //validate

            let inputNames = ['bankName', 'term', 'interestRate']; // Các tên input bạn muốn lấy
            let inputs = formUpdateBankInfo.querySelectorAll(`input[name="${inputNames.join('"], input[name="')}"]`);
            let validateMaxLength = validatorMaxLength(inputs[0], 35);
            let validateTerm = validatorTerm(inputs[1]);
            let validateInterestRate = validatorInterestRate(inputs[2]);


            if (validateMaxLength && validateTerm && validateInterestRate) {

                jsonDataUpdate = {};

                // Lap qua tung cap key value va gan no vao 1 chuoi dinh dang json de submit khi goi api
                for (var item of formDataUpdate.entries()) {
                    // item[0] de lay khoa(name cua trong input) item[1] de lay value
                    if (item[0] == "term") {
                        if ([item[1]][0] === "Không kỳ hạn") {
                            jsonDataUpdate[item[0]] = "-1";
                        }
                        else {
                            jsonDataUpdate[item[0]] = parseInt(item[1]);
                        }
    
                    } else if (item[0] == "interestRate") {
                        jsonDataUpdate[item[0]] = parseFloat(item[1]);
                    }
                    else if (item[0] == "id") {
                        idBankInfo = item[1];
                    }
                    else {
                        jsonDataUpdate[item[0]] = item[1];
                    }
                }
                $.ajax({
                    url: "http://localhost:8080/bankinfo/update/" + idBankInfo,
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

        } else if (event.submitter.name === "deleteBankInfo") {
            // Xử lý sự kiện khi nhấn nút Submit daleteIncomeCategory
            for (var item of formDataUpdate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "id") {
                    idBankInfo = item[1];
                }
            }
            let confirmDeleteBank = confirm('Bạn có chắc muốn xoá thông tin ngân hàng này ?');
            if (confirmDeleteBank) {
                // call api neu co
                $.ajax({
                    url: "http://localhost:8080/bankinfo/delete/" + idBankInfo,
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

function searchBankNameInFormCreate(dataAllBankInfo) {
    let arrBankName = [];
    let uniqueArrBankName = [];
    let selectBankName = document.querySelector(".selectBankName > select");
    let htmlsBankName;
    dataAllBankInfo.forEach(function (bankInfo) {
        // mang arrBankName chua ten cac bank trung nhau
        arrBankName.push(bankInfo.bankName);

    })
    //loc mang co ten bank trung nhau thi chi lay 1 lan
    uniqueArrBankName = [...new Set(arrBankName)];
    htmlsBankName = uniqueArrBankName.map(function (bankName) {
        return `
        <option value="${bankName}">${bankName}</option>
        `
    });
    // dat gia tri mac dinh bang viec them phan tu option vao dau mang htmlsBankName = phuong thuc unshit
    htmlsBankName.unshift("<option selected value='...'>--Chọn tên ngân hàng--</option>");
    selectBankName.innerHTML = htmlsBankName.join(" ");

    selectBankName.addEventListener('change', function (event) {
        // lay ra gia tri cua option dc chon de tim kiem thong tin cac ky han cx nhu lai suat tuong ung
        let selectedOption = event.target.value; // lay ra ten ngan hang
        searchBankInfo(selectedOption);
        //khi thay doi lua chon ngan hang thi reset lai cac o input : lai suat, tien lai, tong tien goc lai
        resetSomeInputInFormCreateSaving();
    });
}

// xem lai
function searchBankInfo(bankName) {
    $.ajax({
        url: "http://localhost:8080/bankinfo/search",
        type: "GET",
        headers: {
            "Authorization": TOKEN
        },
        data: {
            query: bankName
        },
        success: function (data) {
            let selectBankTerm = document.querySelector(".selectBankTerm > select");
            let htmlsBankTerm;
            let startDate = document.querySelector(".selectStartDate > input");
            let endDate = document.querySelector(".selectEndDate");
            htmlsBankTerm = data.map(function (bankInfo) {
                if (bankInfo.term == -1) {
                    return `
                    <option id="${bankInfo.id}" value="${bankInfo.interestRate}">Không kỳ hạn</option>
                    `
                } else {
                    return `
                    <option id="${bankInfo.id}" value="${bankInfo.interestRate}">${bankInfo.term}</option>
                    `
                }
            });
            // dat gia tri mac dinh
            htmlsBankTerm.unshift("<option selected value='...'>--Chọn kỳ hạn gửi--</option>");
            selectBankTerm.innerHTML = htmlsBankTerm.join(" ");

            selectBankTerm.addEventListener('change', function (event) {
                let inputInterestRate = document.querySelector(".inputInterestRate > input");
                let bankIdInfor = document.querySelector(".selectBankId > input");
                let selectedBankTerm = (event.target.options[event.target.selectedIndex]).innerHTML;

                //khi co su thay doi cua viec chon ky han thi gia tri trong o lai suat se hien ra tuong ung
                inputInterestRate.value = event.target.value;
                // chen gia tri id cua ngan hang sau khi chon ten ngan hang, ky han, lai suat
                bankIdInfor.value = selectBankTerm.selectedOptions[0].id;
                //tinh toan lai ngay rut du kien
                calculateEndDateSavingInFormCreate();
            });



        }
    })
}


function resetSomeInputInFormCreateSaving() {
    document.querySelector(".inputInterestRate > input").value = "";
    document.querySelector(".inputInterestMoney > input").value = "";
    document.querySelector(".inputTotalMoney > input").value = "";
    document.querySelector(".selectEndDate > input").value = "";
    document.querySelector(".selectBankTerm > select").innerHTML = "";

}




function createBankInfo() {
    let formCreateBankInfo = document.getElementById("myBankInfoForm");
    let jsonDataCreate = {};

    formCreateBankInfo.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();

        let inputNames = ['bankName', 'term', 'interestRate']; // Các tên input bạn muốn lấy
        let inputs = formCreateBankInfo.querySelectorAll(`input[name="${inputNames.join('"], input[name="')}"]`);
        let validateMaxLength = validatorMaxLength(inputs[0], 35);
        let validateTerm = validatorTerm(inputs[1]);
        let validateInterestRate = validatorInterestRate(inputs[2]);


        if (validateMaxLength && validateTerm && validateInterestRate) {
            let formDataCreate = new FormData(this); // Tạo đối tượng FormData từ form
            for (var item of formDataCreate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "term") {
                    if ([item[1]][0] === "Không kỳ hạn") {
                        jsonDataCreate[item[0]] = "-1";
                    }
                    else {
                        jsonDataCreate[item[0]] = parseInt(item[1]);
                    }

                } else if (item[0] == "interestRate") {
                    jsonDataCreate[item[0]] = parseFloat(item[1]);
                }
                else {
                    jsonDataCreate[item[0]] = item[1];
                }
            }
            // Sử dụng dữ liệu JSON theo ý muốn (ví dụ: gửi đi bằng Ajax)
            $.ajax({
                url: "http://localhost:8080/bankinfo/create",
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

//neu nguoi dung nhap thong tin them moi nhung k them ma an nut x thi xoa du lieu trong form do
function resetDataForm() {
    let closeModalButton = document.querySelector(".btn-close-form-create");
    closeModalButton.addEventListener('click', function () {
        document.getElementById("myBankInfoForm").reset();
        document.getElementById("mySavingForm").reset();
        resetSomeInputInFormCreateSaving();
        let formMessagesInSaving = document.querySelectorAll("#mySavingForm .formMessage");
        formMessagesInSaving.forEach(function (formMessage) {
            formMessage.innerText = '';
            formMessage.parentElement.classList.remove('invalid');
        })
        let formMessagesInBank = document.querySelectorAll("#myBankInfoForm .formMessage");
        formMessagesInBank.forEach(function (formMessage) {
            formMessage.innerText = '';
            formMessage.parentElement.classList.remove('invalid');
        })

    });

    let closeModalButtonuFormUpdateSaving = document.querySelector(".btn-close-form-update-saving");
    closeModalButtonuFormUpdateSaving.addEventListener('click', function () {
        // document.getElementById("updateInfoSaving").reset();
        let formMessages = document.querySelectorAll("#updateInfoSaving .formMessage");
        formMessages.forEach(function (formMessage) {
            formMessage.innerText = '';
            formMessage.parentElement.classList.remove('invalid');
        })
    });

    let closeModalButtonuFormUpdateBankInfo = document.querySelector(".btn-close-form-update-bankinfo");
    closeModalButtonuFormUpdateBankInfo.addEventListener('click', function () {
        let formMessages = document.querySelectorAll("#updateInfoBank .formMessage");
        formMessages.forEach(function (formMessage) {
            formMessage.innerText = '';
            formMessage.parentElement.classList.remove('invalid');
        })
    });
}




// hom hom
function calculateEndDateSavingInFormCreate() {
    // lay ra thoi gian ngay bat dau hien tai
    let startDate = document.querySelector(".selectStartDate > input");
    // lay ra the div chu toan bo khoi enddate
    let endDate = document.querySelector(".selectEndDate");
    //lay ra the option dc lua chon cua the select bank term
    let selectedOption = document.querySelector(".selectBankTerm > select").options[document.querySelector(".selectBankTerm > select").selectedIndex];
    // lay ra the selectbankterm
    let selectedBankTerm = document.querySelector(".selectBankTerm > select");
    // bien sau khi tinh toan de gan gia tri enddate
    let inputEndDate;
    // kiem tra neu gia tri trong o input startdate va gia tri trong the selectbankterm khong trong
    if (startDate.value != "" && selectedBankTerm.value != "") {
        // lay ra ky han gui
        let term = parseInt(selectedOption.innerHTML);
        if (selectedOption.innerHTML == "Không kỳ hạn") {
            endDate.style.display = "none";
            // document.querySelector(".selectEndDate > input").value = ""; check end date neu bankterm la khong ky han thi endadte la chuoi rong ""
        }
        else {
            endDate.style.display = "block";
            inputEndDate = new Date(formatDate(startDate.value)); // Sao chép ngày bắt đầu
            inputEndDate.setMonth(inputEndDate.getMonth() + term);
            document.querySelector(".selectEndDate > input").value = formatDate(inputEndDate);
        }
    } else {

        document.querySelector(".selectEndDate > input").value = "";
    }

};

function calculateEndDateSavingInFormUpdate() {
    // lay ra thoi gian ngay bat dau hien tai
    let startDate = document.querySelector(".selectStartDateUpdate > input");
    // lay ra the div chu toan bo khoi enddate
    let endDate = document.querySelector(".selectEndDateUpdate");
    //lay ra ky han gui cua khoan tiet kiem
    let term = document.getElementById("updateBankTermSaving");
    // bien sau khi tinh toan de gan gia tri enddate
    let inputEndDate;
    // kiem tra neu gia tri trong o input startdate va gia tri trong the selectbankterm khong trong
    if (startDate.value != "" && term.value != "") {
        if (term.value == "Không kỳ hạn") {
            endDate.style.display = "none";
            // document.querySelector(".selectEndDate > input").value = ""; check end date neu bankterm la khong ky han thi endadte la chuoi rong ""
        }
        else {
            endDate.style.display = "block";
            inputEndDate = new Date(formatDate(startDate.value)); // Sao chép ngày bắt đầu
            inputEndDate.setMonth(inputEndDate.getMonth() + parseFloat(term.value));
            document.querySelector(".selectEndDateUpdate > input").value = formatDate(inputEndDate);
        }
    }

};

function canculateMoneyInFormUpdate() {
    //lay ra so tien gui
    let savingAmount = (document.querySelector(".inputSavingAmountUpdate > input"));
    // lay ra lai suat theo ky han gui
    let interestRate = (document.querySelector(".inputInterestRateUpdate > input").value);
    // lay ra ky han gui
    let term = (document.querySelector(".selectBankTermUpdate > input").value);
    let isAmount = validatorAmount(savingAmount);

    if (term != "" && isAmount && interestRate != "") {
        let interestAmount;
        if (term != "Không kỳ hạn") {
            // tien lai co ky han
            interestAmount = parseFloat((parseFloat(savingAmount.value) * parseFloat(term) * ((parseFloat(interestRate) / 100) / 12)).toFixed(0));
        } else {
            //tien lai khong ky han thi minh se tinh lai voi lai suat cua 1 nam 
            //interestAmount = parseFloat((parseFloat(savingAmount) * (parseFloat(interestRate) / 100)).toFixed(0));
            return
        }
        //tong tien lai + tien goc
        let totalMoney = parseFloat(savingAmount.value) + parseFloat(interestAmount);
        let inputInterestMoneyUpdate = document.querySelector(".inputInterestMoneyUpdate > input");
        inputInterestMoneyUpdate.value = interestAmount.toLocaleString();
        let inputTotalMoneyUpdate = document.querySelector(".inputTotalMoneyUpdate > input");
        inputTotalMoneyUpdate.value = totalMoney.toLocaleString();
    } else {
        return;
    }
}


function canculateMoney() {
    //lay ra so tien gui
    let savingAmount = (document.querySelector(".inputSavingAmount > input"));
    // lay ra lai suat theo ky han gui
    let interestRate = (document.querySelector(".inputInterestRate > input").value);
    //lay ra element dc chon cua the select ky han gui
    let selectedOption = document.querySelector(".selectBankTerm > select").options[document.querySelector(".selectBankTerm > select").selectedIndex];
    // lay ra ky han gui
    let term;
    // nếu ng dùng chọn thẻ option --chon ky han gui-- -> thi se ra undefined va se gan term =""
    if (selectedOption != undefined) {
        term = (selectedOption.text);
    } else {
        term = "";
    }

    //validate them khi chua chon gi o bank va bankterm
    let isAmount = validatorAmount(savingAmount);
    let isBank = validatorBank(document.querySelector(".selectBankName > select"));
    let isBankTerm = validatorBankTerm(document.querySelector(".selectBankTerm > select"));

    if (term != "" && interestRate != "" && isAmount && isBank && isBankTerm) {
        let interestAmount;
        if (term != "Không kỳ hạn") {
            // tien lai co ky han
            interestAmount = parseFloat((parseFloat(savingAmount.value) * parseFloat(term) * ((parseFloat(interestRate) / 100) / 12)).toFixed(0));
        } else {
            //tien lai khong ky han thi minh se tinh lai voi lai suat cua 1 nam 
            //interestAmount = parseFloat((parseFloat(savingAmount) * (parseFloat(interestRate) / 100)).toFixed(0));
            return
        }
        //tong tien lai + tien goc
        let totalMoney = parseFloat(savingAmount.value) + parseFloat(interestAmount);
        let inputInterestMoney = document.querySelector(".inputInterestMoney > input");
        inputInterestMoney.value = interestAmount.toLocaleString();
        let inputTotalMoney = document.querySelector(".inputTotalMoney > input");
        inputTotalMoney.value = totalMoney.toLocaleString();
    } else {
        return;
    }
}


// handle saving
function createSaving() {
    let formCreateSaving = document.getElementById("mySavingForm");
    let jsonDataCreate = {};

    let inputStartDate = document.querySelector(".selectStartDate > input");

    inputStartDate.addEventListener("change", function () {
        console.log(inputStartDate.value);
        calculateEndDateSavingInFormCreate();
    }
    );

    formCreateSaving.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        // event.stopPropagation();
        // validate
        let inputNames = ['amount', 'desc', 'startDate']; // Các tên input bạn muốn lấy
        let inputs = formCreateSaving.querySelectorAll(`input[name="${inputNames.join('"], input[name="')}"]`);
        let validateMaxLength = validatorMaxLength(inputs[0], 35);
        let validateDate = validatorDate(inputs[1]);
        let validateAmount = validatorAmount(inputs[2]);
        let validateBank = validatorBank(formCreateSaving.querySelector('.selectBankName > select'));
        let validateBankTerm = validatorBankTerm(formCreateSaving.querySelector('.selectBankTerm > select'));

        if (validateMaxLength && validateDate && validateAmount && validateBank && validateBankTerm) {
            let formDataCreate = new FormData(this); // Tạo đối tượng FormData từ form
            for (var item of formDataCreate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "amount") {
                    jsonDataCreate[item[0]] = parseFloat(item[1]);

                } else if (item[0] == "startDate" || item[0] == "endDate") {
                    jsonDataCreate[item[0]] = formatDate(item[1]);
                    if (jsonDataCreate[item[0]] == "NaN-NaN-NaN NaN:NaN:NaN") {
                        jsonDataCreate[item[0]] = "";
                    }
                }
                else {
                    jsonDataCreate[item[0]] = item[1];
                }
            }


            // Sử dụng dữ liệu JSON theo ý muốn (ví dụ: gửi đi bằng Ajax)
            $.ajax({
                url: "http://localhost:8080/saving/create",
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
        else {
            // co the se in ra message loi
        }
    });
}

function fillInfoSavingToForm(tableSaving) {
    // Lay du lieu da co fill vao modal danh muc de sua
    // let selectIncomeCategoryOld = document.querySelector(".selectUpdateIncomeCategory > select");
    $('#savingTable tbody').on('click', 'tr', function () {
        // Lấy dữ liệu của dòng được chọn
        rowDataSelect = tableSaving.row(this).data();

        // do du lieu cua dong can sua vao form
        $("#updateBankNameSaving").val(rowDataSelect[0]);
        $("#updateDescSaving").val(rowDataSelect[1]);
        $("#updateStartDateSaving").val(rowDataSelect[2]);
        $("#updateBankTermSaving").val(rowDataSelect[3]);
        $("#updateAmountSaving").val(rowDataSelect[4].replace(/,/g, "").replace(/\./g, ""));
        $("#updateBankInterestRateSaving").val(rowDataSelect[5]);
        $("#updateIdSaving").val(rowDataSelect[8]);

        calculateEndDateSavingInFormUpdate();
        $("#updateSaving").modal("show");
    });
    // sua hoac xoa saving
    updateOrDeleteSaving();
}

function updateOrDeleteSaving() {
    let formUpdateSaving = document.getElementById("updateInfoSaving");
    let idSaving;
    //Khai bao 1 bien kieu chuoi json de luu thong tin thay doi
    let jsonDataUpdate = {};

    let inputStartDateUpdate = document.querySelector(".selectStartDateUpdate > input");

    inputStartDateUpdate.addEventListener("change", function () {
        calculateEndDateSavingInFormUpdate();
    }
    );

    formUpdateSaving.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
        let formDataUpdate = new FormData(this); // Tạo đối tượng FormData từ form
        if (event.submitter.name === "updateSaving") {
            // Xử lý sự kiện khi nhấn nút updateSaving 
            //validate
            let inputNames = ['amount', 'desc', 'startDate']; // Các tên input bạn muốn lấy
            let inputs = formUpdateSaving.querySelectorAll(`input[name="${inputNames.join('"], input[name="')}"]`);
            let validateMaxLength = validatorMaxLength(inputs[0], 35);
            let validateDate = validatorDate(inputs[1]);
            let validateAmount = validatorAmount(inputs[2]);

            if (validateMaxLength && validateDate && validateAmount) {

                jsonDataUpdate = {};

                // Lap qua tung cap key value va gan no vao 1 chuoi dinh dang json de submit khi goi api
                for (var item of formDataUpdate.entries()) {
                    // item[0] de lay khoa(name cua trong input) item[1] de lay value
                    if (item[0] == "amount") {
                        jsonDataUpdate[item[0]] = parseFloat(item[1]);

                    } else if (item[0] == "startDate" || item[0] == "endDate") {
                        jsonDataUpdate[item[0]] = formatDate(item[1]);
                        if (jsonDataUpdate[item[0]] == "NaN-NaN-NaN NaN:NaN:NaN") {
                            jsonDataUpdate[item[0]] = "";
                        }
                    }
                    else if (item[0] == "id") {
                        idSaving = item[1];
                    }
                    else {
                        jsonDataUpdate[item[0]] = item[1];
                    }
                }

                $.ajax({
                    url: "http://localhost:8080/saving/update/" + idSaving,
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
        } else if (event.submitter.name === "daleteSaving") {
            // Xử lý sự kiện khi nhấn nút Submit daleteSaving
            for (var item of formDataUpdate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "id") {
                    idSaving = item[1];
                }
            }
            let confirmDeleteSaving = confirm('Bạn có chắc muốn xoá khoản tiết kiệm này ?');
            if (confirmDeleteSaving) {
                // api delete
                $.ajax({
                    url: "http://localhost:8080/saving/delete/" + idSaving,
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
        } else if (event.submitter.name === "takeSaving") {
            // Xử lý sự kiện khi nhấn nút Submit daleteSaving
            for (var item of formDataUpdate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "id") {
                    idSaving = item[1];
                }
            }
            let confirmDeleteSaving = confirm('Bạn có chắc muốn rút khoản tiết kiệm này ?');
            if (confirmDeleteSaving) {
                // api delete
                $.ajax({
                    url: "http://localhost:8080/saving/takemoney/" + idSaving,
                    type: "POST",
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

//cac ham dung chung
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

function validatorBank(input) {
    let isBank = false;

    if (input.value == '...') {
        showMessageError(input, 'Vui lòng chọn tên ngân hàng');
    }
    else {
        isBank = true;
        showMessageSuccess(input);
    }
    return isBank
}

function validatorBankTerm(input) {
    let isBankTerm = false;

    if (input.value == '...' || input.value == '') {
        showMessageError(input, 'Vui lòng chọn kỳ hạn gửi');
    }
    else {
        isBankTerm = true;
        showMessageSuccess(input);
    }
    return isBankTerm
}

function validatorTerm(input) {
    let isTerm = false;
    let regex = /^(Không kỳ hạn|([1-9]|[1-2][0-9]|3[0-6]))$/;

    if (!validatorEmptyError(input)) {
        if (!regex.test(input.value)) {
            showMessageError(input, 'Bạn đã nhập sai định dạng kỳ hạn');
        } else {
            isTerm = true;
            showMessageSuccess(input);
        }

    }
    return isTerm
}


function validatorInterestRate(input) {
    let isInterestRate = false;
    let regex = /^(0\.\d+|[1-9](\.\d+)?)$/;

    if (!validatorEmptyError(input)) {
        if (!regex.test(input.value)) {
            showMessageError(input, 'Bạn đã nhập sai định dạng lãi suất');
        } else {
            isInterestRate = true;
            showMessageSuccess(input);
        }

    }
    return isInterestRate
}

function getStatisticSaving() {
    $.ajax({
        url: "http://localhost:8080/saving/",
        type: "GET",
        headers: {
            "Authorization": TOKEN
        },
        processData: false,
        contentType: false,
        success: function(response) {
            // renderListBankInfo(response);

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
$('#DA-logout').click(function () {
    localStorage.removeItem('token');
    window.location.href = "./login.html";
});