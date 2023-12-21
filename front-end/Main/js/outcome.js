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
    getAllOutcomeTransactionOfUser();
    getAllOutcomeTransactionOfUserToday();
    getAllOutcomeCategoryOfUser();
    resetDataForm();
    calculateTotalMoney();
    ChartTransactionToday();
});
$('#outcomeTable').DataTable();

function getAllOutcomeTransactionOfUser() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/transaction/outcome",
        headers: {
            "Authorization": TOKEN
        },
        success: function (data) {
            let dataAllOutcomeTran = JSON.parse(JSON.stringify(data));
            let tableOutcomeTran = $('#outcomeTable').DataTable();
            dataAllOutcomeTran.forEach(function (outcomeTran) {
                if (outcomeTran.active == true) {
                    tableOutcomeTran.row.add([
                        outcomeTran.id, //ren ra id sua 28/11
                        outcomeTran.desc,
                        outcomeTran.time,
                        outcomeTran.category,
                        outcomeTran.amount.toLocaleString()
                    ]).draw();
                }
            });
            tableOutcomeTran.column(0).visible(false);// an cot id
            // tableIncomeTran.column(1).visible(false);// an cot id category

            fillInfoOutcomeTransactionToForm(tableOutcomeTran);
            createOutcomeTransaction();

        }
    })
};


function getAllOutcomeTransactionOfUserToday() {
    let currentDate = new Date();

    let year = currentDate.getFullYear();
    let month = String(currentDate.getMonth() + 1).padStart(2, '0');
    let day = String(currentDate.getDate()).padStart(2, '0');
    let startDate = year + '-' + month + '-' + day + ' 00:00:00';
    let endDate = year + '-' + month + '-' + day + ' 23:59:59';

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
        success: function (data) {
            if (data.length > 0) {
                renderOutcomeTransactionToday(data);
            }
            else {
                var htmlSnippet = `
                    <h6 class="mt-4" style="text-align: center; color: #606060;">Chưa có khoản thu nào trong hôm nay</h6>
                        `;
                $('#myOutcomeTransToday').html(htmlSnippet);


            }
        }
    })
};

// Handle Income Category
function getAllOutcomeCategoryOfUser() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/category/outcome",
        headers: {
            "Authorization": TOKEN
        },
        success: function (data) {
            searchIconCategory();
            searchCategoryInFormCreate(JSON.parse((JSON.stringify(data))));
            searchParentCategory(JSON.parse((JSON.stringify(data))));
            renderOutcomeCategory(JSON.parse((JSON.stringify(data))));
            createOutcomeCategory();
        }
    });
}

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

function searchCategoryInFormCreate(outcomecategory) {
    let selectOutcomeCategory = document.querySelectorAll(".selectOutcomeCategory > select");
    let htmlsOutcomeCategoryChild = [];
    let htmlsOutcomeCategory = outcomecategory.map(function (category) {
        if (category.active == true) {
            if (category.child.length > 0) {
                htmlsOutcomeCategoryChild.push(`<option value="${category.id}">${category.name}</option>`);
                category.child.map(function (categoryChild) {
                    if(categoryChild.active == true){
                        htmlsOutcomeCategoryChild.push(`<option value="${categoryChild.id}">${categoryChild.name}</option>`);
                    }
                })
            } else {
                return `
                <option value="${category.id}">${category.name}</option>
                `
            }
        }
    });
    selectOutcomeCategory.forEach(function (selectCate) {
        selectCate.innerHTML = (htmlsOutcomeCategory.concat(htmlsOutcomeCategoryChild)).join(" ");
    });
}



function renderOutcomeCategory(dataAllOutcomeCate) {
    let htmlsOutcomeCategoryChild = [];
    let listOutcomeCategory = document.getElementById("myOutcomeCategory");
    let htmlsOutcomeCategory = dataAllOutcomeCate.map(function (outcomeCate) {
        if (outcomeCate.active == true) {
            // cha
            if (outcomeCate.user != 0) {
                // xu li cha co con
                if (outcomeCate.child.length > 0) {
                    // ren ra cate cha
                    htmlsOutcomeCategoryChild.push(` 
                    <li>
                    <div class="img-icon">
                        <img src="${outcomeCate.icon}" alt="">
                    </div>
                    <a id='${outcomeCate.id}' href="" class= "userCategory">${outcomeCate.name}</a>
                    <i class="icon-menu fas fa-chevron-down"></i>
                    <ul class="DA-sub-menu">
                    `);
                    // ren ra cac cate con
                    outcomeCate.child.map(function (categoryChild) {
                        if(categoryChild.active == true) {
                            htmlsOutcomeCategoryChild.push(` 
                            <li>
                                <div class="img-icon">
                                    <img src="${categoryChild.icon}" alt="">
                                </div>
                                <a id='${categoryChild.id}' href="" class= "userCategory">${categoryChild.name}</a>
                            </li>`);
                        }
                    })

                    htmlsOutcomeCategoryChild.push(` 
                    </ul>
                    </li>`);
                }
                // xu li cha khong co con cua cate cha la user
                else {
                    htmlsOutcomeCategoryChild.push(` 
                <li>
                <div class="img-icon">
                    <img src="${outcomeCate.icon}" alt="">
                </div>
                <a id='${outcomeCate.id}' href="" class= "userCategory">${outcomeCate.name}</a>
                </li>
                `);
                }
            }

            // xu li outcome cate cha cua he thong -> con
            else {
                 // xu li cha co con
                 if (outcomeCate.child.length > 0) {
                         // ren ra cate cha
                    htmlsOutcomeCategoryChild.push(` 
                    <li>
                    <div class="img-icon">
                        <img src="${outcomeCate.icon}" alt="">
                    </div>
                    <a id='${outcomeCate.id}' href="" class= "systemCategory">${outcomeCate.name}</a>
                    <i class="icon-menu fas fa-chevron-down"></i>
                    <ul class="DA-sub-menu">
                    `);
                    // ren ra cac cate con la user tao
                    outcomeCate.child.map(function (categoryChild) {
                        if(categoryChild.active == true){
                            // xu li cha co con la cua user tao
                            if(categoryChild.user != 0 ){
                            htmlsOutcomeCategoryChild.push(` 
                            <li>
                                <div class="img-icon">
                                    <img src="${categoryChild.icon}" alt="">
                                </div>
                                <a id='${categoryChild.id}' href="" class= "userCategory">${categoryChild.name}</a>
                            </li>`);
                            }
                            // xu li cha co con la cua system tao
                            else{
                                // ren ra cac cate con la system tao
                            htmlsOutcomeCategoryChild.push(` 
                            <li>
                                <div class="img-icon">
                                    <img src="${categoryChild.icon}" alt="">
                                </div>
                                <a id='${categoryChild.id}' href="" class= "systemCategory">${categoryChild.name}</a>
                            </li>`);
                            }
                        }
                    })
                    htmlsOutcomeCategoryChild.push(` 
                    </ul>
                    </li>`);
                 }

                 // xu li cha khong con cua cate cha la system
                 else{
                    htmlsOutcomeCategoryChild.push(` 
                    <li>
                    <div class="img-icon">
                        <img src="${outcomeCate.icon}" alt="">
                    </div>
                    <a id='${outcomeCate.id}' href="" class= "systemCategory">${outcomeCate.name}</a>
                    </li>
                    `);
                 }
            }
        }
    });

    listOutcomeCategory.innerHTML = (htmlsOutcomeCategory.concat(htmlsOutcomeCategoryChild)).join(" ");
    // khong thay doi vi tri goi ham neu khong se loi
    seeChildCategory();
    fillInfoOutcomeCategoryToForm();
}

// hanh dong truot len xuong category cha -> con
function seeChildCategory() {
    // lay ra the i la cac icon mui ten tro xuong o phan danh muc va khi click 
    //  + thi lay ra the cha cua the i roi quay ra lay the con cua the cha do la the ul va them hieu ung truot len xuong bang ham slideToggle()
    //  + thi them class mui ten tro sang trai fa-chevron-left
    $('.DA-dropdown-menu .icon-menu').click(function () {
        $(this).parent('li').children('.DA-sub-menu').slideToggle();
        $(this).toggleClass('fa-chevron-left');
    })
}

function searchParentCategory(dataAllOutcomeCate){
    let selectParentCates= document.querySelectorAll(".selectParentCategory > select");
    let htmlsParentCate;
    selectParentCates.forEach(function (selectParentCate){
            htmlsParentCate = dataAllOutcomeCate.map(function (parentCate) {
                return `
                <option value="${parentCate.id}">${parentCate.name}</option>
                `
            });

             // dat gia tri mac dinh bang viec them phan tu option vao dau mang htmlsParentCate = phuong thuc unshit
             htmlsParentCate.unshift("<option selected value=''>--Chọn tên danh mục cha--</option>");
             selectParentCate.innerHTML = htmlsParentCate.join(" ");
    })
};

function selectIconCategoryInFormCreate() {
    let listIcon = document.querySelectorAll(".DA-OpIcon > img");
    let overlayModalIcon = document.getElementById("overlayModalIcon");
    let modalIcon = document.getElementById("modalIcon");

    listIcon.forEach(function (icon) {
        icon.addEventListener('click', function () {
            $("#createIconOutcomeCategory").attr("src", icon.src);
            $("#createSourceOutcomeCategory").val(icon.src);
            overlayModalIcon.style.display = 'none';
            modalIcon.style.display = 'none';
        });
    })
}

function selectIconCategoryInFormUpdate() {
    let listIcon = document.querySelectorAll(".DA-OpIcon > img");
    let overlayModalIcon = document.getElementById("overlayModalIcon");
    let modalIcon = document.getElementById("modalIcon");

    listIcon.forEach(function (icon) {
        icon.addEventListener('click', function () {
            $("#updateIconOutcomeCategory").attr("src", icon.src);
            $("#updateSourceOutcomeCategory").val(icon.src);
            overlayModalIcon.style.display = 'none';
            modalIcon.style.display = 'none';
        });
    })
}


// Do du lieu vao modal updateIncomeCategory khi click vao category tuong ung
function fillInfoOutcomeCategoryToForm() {
     // Lay du lieu da co fill vao modal danh muc de sua
    let iconOutcomeCategory;
    let listLinkOutcomeCategoryOfUser = document.querySelectorAll("#myOutcomeCategory > li > .userCategory, #myOutcomeCategory > li > ul > li > .userCategory");
    let listLinkOutcomeCategoryOfSystem = document.querySelectorAll("#myOutcomeCategory > li > .systemCategory, #myOutcomeCategory > li > ul > li > .systemCategory");
   
   
    listLinkOutcomeCategoryOfUser.forEach(function (outcomeCategory) {
        outcomeCategory.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chặn gửi link mặc định
            event.stopPropagation();
            iconOutcomeCategory = ($(outcomeCategory).parent('li').children('.img-icon').children())[0].attributes[0].value;
             $("#updateNameOutcomeCategory").val(outcomeCategory.innerHTML);
             $("#updateSourceOutcomeCategory").val(iconOutcomeCategory);
             $("#updateIconOutcomeCategory").attr("src", iconOutcomeCategory);
             $("#updateIdOutcomeCategory").val($(outcomeCategory).attr('id'));
             $("#updateOutcomeCategory").modal("show");
        })
    });

    listLinkOutcomeCategoryOfSystem.forEach(function (outcomeCategory) {
        outcomeCategory.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn chặn gửi link mặc định
            event.stopPropagation();
        })
    });

    //sua hoac xoa category
    updateOrDeleteOutcomeCategory();
}











// sua + xoa dong income category
function updateOrDeleteOutcomeCategory() {
    selectIconCategoryInFormUpdate();
    //Bat su kien submit khi gui du lieu danh muc moi (khi nhan nut luu)    
    let formUpdateOutcomeCategory = document.getElementById("updateInfoCategory");
    let idOutcomeCategory;
    let jsonDataUpdate = {};
    //Khai bao 1 bien kieu chuoi json de luu thong tin thay doi
    formUpdateOutcomeCategory.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
        let formDataUpdate = new FormData(this); // Tạo đối tượng FormData từ form
        if (event.submitter.name === "updateOutcomeCategory") {
            // Xử lý sự kiện khi nhấn nút updateOutcomeCategory 
            //validate
            let input = formUpdateOutcomeCategory.querySelector("input[name='name']");
            let validateMaxLength = validatorMaxLength(input, 35);
           
            if (validateMaxLength) {
                jsonDataUpdate = {};
                jsonDataUpdate["parent"] = "";
                // Lap qua tung cap key value va gan no vao 1 chuoi dinh dang json de submit khi goi api
                for (var item of formDataUpdate.entries()) {
                    // item[0] de lay khoa(name cua trong input) item[1] de lay value
                    if (item[0] == "id") {
                        idOutcomeCategory = item[1];
                    } else {
                        jsonDataUpdate[item[0]] = item[1];
                    }
                }
    
                $.ajax({
                    url: "http://localhost:8080/category/update/" + idOutcomeCategory,
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
        } else if (event.submitter.name === "daleteOutcomeCategory") {
            // Xử lý sự kiện khi nhấn nút Submit daleteOutcomeCategory
            for (var item of formDataUpdate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "id") {
                    idOutcomeCategory = item[1];
                }
            }
            let confirmDeleteCate = confirm('Bạn có chắc muốn xoá danh mục chi tiêu này ?');
            if (confirmDeleteCate) {
                $.ajax({
                    url: "http://localhost:8080/category/delete/" + idOutcomeCategory,
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


function createOutcomeCategory() {
    selectIconCategoryInFormCreate();
    
    let formCreateOutcomeCategory = document.getElementById("myCategory");
    let jsonDataCreate = {};

    formCreateOutcomeCategory.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
//validate
let input = formCreateOutcomeCategory.querySelector("input[name='name']");
let validateMaxLength = validatorMaxLength(input, 35);

if (validateMaxLength) {
    let formDataCreate = new FormData(this); // Tạo đối tượng FormData từ form
    
    // Lap qua tung cap key value va gan no vao 1 chuoi dinh dang json de submit khi goi api
    for (var item of formDataCreate.entries()) {
        // item[0] de lay khoa(name cua trong input) item[1] de lay value
        jsonDataCreate[item[0]] = item[1];
    }
    // Sử dụng dữ liệu JSON theo ý muốn (ví dụ: gửi đi bằng Ajax)    
    $.ajax({
        url: "http://localhost:8080/category/create/outcome",
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










//Handle outcome Transaction
function renderOutcomeTransactionToday(dataOutcomeTransToday) {
    let listOutcomeTransToday = document.getElementById("myOutcomeTransToday");
    let htmlsOutcomeTransToday = dataOutcomeTransToday.map(function (outcomeTrans) {
        if (outcomeTrans.active == true) {
            return `
            <div class="card DA-border-radius mb-2 bg-dark">
                <div class="row card-body padding-12px">
                    <div class="col-sm-7" style="line-height: 62px;">
                        <div class="row">
                            <div class="img-icon DA-today col-md-3">
                                <img src="${outcomeTrans.icon}" alt="">
                            </div>
                            <div class="DA-name-cate col-md-9" style="display: flex; align-items: center; padding: 0px;">
                                <h6 style="margin: 0px; font-size: 14px; color: #fff;">${outcomeTrans.desc}</h6>
                            </div>
                        </div>
                        
                    </div>
                    <div class="col-sm-5 pr-0">
                        <label class="DA-title ">${outcomeTrans.category}</label>
                        <div style="float: inline-end;">
                            <h5 style="display: inline-block; color: rgb(15, 216, 0);">${outcomeTrans.amount.toLocaleString()}</h5>
                            <u style="color: yellow;">đ</u>
                        </div>
                    </div>
                </div>
            </div>
            `
        }
    });

    listOutcomeTransToday.innerHTML = htmlsOutcomeTransToday.join(" ");
};


function fillInfoOutcomeTransactionToForm(tableOutcomeTran) {
    // Lay du lieu da co fill vao modal danh muc de sua
    // let selectIncomeCategoryOld = document.querySelector(".selectUpdateIncomeCategory > select");
    $('#outcomeTable tbody').on('click', 'tr', function () {
        // Lấy dữ liệu của dòng được chọn
        rowDataSelect = tableOutcomeTran.row(this).data();

        // do du lieu cua dong can sua vao form
        $("#updateDescOutcomeTransaction").val(rowDataSelect[1]);
        $("#updateAmountOutcomeTransaction").val(rowDataSelect[4].replace(/,/g, "").replace(/\./g, ""));
        $("#updateTimeOutcomeTransaction").val(rowDataSelect[2]);
        $("#updateCategoryOutcomeTransaction").val(rowDataSelect[3]);
        $("#updateIdOutcomeTransaction").val(rowDataSelect[0]);
        $("#updateOutcomeTransaction").modal("show");
    });
    // sua hoac xoa outcome
    updateOrDeleteOutcomeTransaction();
}


function createOutcomeTransaction() {
    let formCreateOutcomeTransaction = document.getElementById("myOutcome");
    let jsonDataCreate = {};

    formCreateOutcomeTransaction.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
        //validate 
        let inputNames = ['desc', 'time', 'amount']; // Các tên input bạn muốn lấy
        let inputs = formCreateOutcomeTransaction.querySelectorAll(`input[name="${inputNames.join('"], input[name="')}"]`);
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

            // Sử dụng dữ liệu JSON theo ý muốn (ví dụ: gửi đi bằng Ajax)
            $.ajax({
                url: "http://localhost:8080/transaction/create/outcome",
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

//sua outcome transaction  // ham can truyen vao tableIncomeTran id select
function updateOrDeleteOutcomeTransaction() {
    //Bat su kien submit khi gui du lieu khoan chi moi (khi nhan nut luu)    
    let formUpdateTransactionOutcome = document.getElementById("updateInfoTransaction");
    //Khai bao 1 bien kieu chuoi json de luu thong tin thay doi
    let idOutcomeTransaction;
    let jsonDataUpdate = {};
    formUpdateTransactionOutcome.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn gửi form mặc định
        event.stopPropagation();
        let formDataUpdate = new FormData(this); // Tạo đối tượng FormData từ form
        if (event.submitter.name === "updateOutcomeTransaction") {
            // Xử lý sự kiện khi nhấn nút updateIncomeCategory 

            //validate
            let inputNames = ['desc', 'time', 'amount']; // Các tên input bạn muốn lấy
            let inputs = formUpdateTransactionOutcome.querySelectorAll(`input[name="${inputNames.join('"], input[name="')}"]`);
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
                        idOutcomeTransaction = item[1];
                    }
                    else {
                        jsonDataUpdate[item[0]] = item[1];
                    }
                }

                $.ajax({
                    url: "http://localhost:8080/transaction/update/" + idOutcomeTransaction,
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
        } else if (event.submitter.name === "daleteOutcomeTransaction") {
            // Xử lý sự kiện khi nhấn nút Submit daleteIncomeCategory
            for (var item of formDataUpdate.entries()) {
                // item[0] de lay khoa(name cua trong input) item[1] de lay value
                if (item[0] == "id") {
                    idOutcomeTransaction = item[1];
                }
            }
            let confirmDeleteTrans = confirm('Bạn có chắc muốn xoá khoản chi tiêu này ?');
            if (confirmDeleteTrans) {
                $.ajax({
                    url: "http://localhost:8080/transaction/delete/" + idOutcomeTransaction,
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
        document.getElementById("myOutcome").reset();
        document.getElementById("myCategory").reset();
        let formMessagesInOcome = document.querySelectorAll("#myOutcome .formMessage");
        formMessagesInOcome.forEach(function (formMessage) {
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



// chart tình hình thu chi
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


// Đăng xuất
$('#DA-logout').click(function () {
    localStorage.removeItem('token');
    window.location.href = "./login.html";
});


// dung xoas nhe tam huyet lam day @@@@
// // Do du lieu vao modal updateOutcomeCategory khi click vao category tuong ung ver nang cap hon dung de doi cha - con
// function fillInfoOutcomeCategoryToForm() {
//     // Lay du lieu da co fill vao modal danh muc de sua
//     let iconOutcomeCategory;
//     let listLinkOutcomeCategoryOfUser = document.querySelectorAll("#myOutcomeCategory > li > .userCategory, #myOutcomeCategory > li > ul > li > .userCategory");
//     let listLinkOutcomeCategoryOfSystem = document.querySelectorAll("#myOutcomeCategory > li > .systemCategory, #myOutcomeCategory > li > ul > li > .systemCategory");
   
   
//     listLinkOutcomeCategoryOfUser.forEach(function (outcomeCategory) {
//         outcomeCategory.addEventListener("click", function (event) {
//             event.preventDefault(); // Ngăn chặn gửi link mặc định
//             event.stopPropagation();
//             iconOutcomeCategory = ($(outcomeCategory).parent('li').children('.img-icon').children())[0].attributes[0].value;
//            // dung o vi tri cate con
//             isParent =  ($(outcomeCategory).parent('li')).parent('ul').parent('li');
//             // dung o vi tri cate cha
//             isChild = ($(outcomeCategory).parent('li').children('ul').children('li'));
//             if(isParent.length == 0 && isChild.length != 0){
//                 $("#updateParentCategory").val("");
//                 $("#selectParentCate").css("display", "none");
//             }
//             else if(isChild.length == 0){
//                 $("#updateParentCategory").val((isParent.children('a')).attr('id'));
//                 $("#selectParentCate").css("display", "block");
//             }
//              $("#updateNameOutcomeCategory").val(outcomeCategory.innerHTML);
//              $("#updateSourceOutcomeCategory").val(iconOutcomeCategory);
//              $("#updateIconOutcomeCategory").attr("src", iconOutcomeCategory);
//              $("#updateIdOutcomeCategory").val($(outcomeCategory).attr('id'));
//              $("#updateOutcomeCategory").modal("show");
//         })
//     });

//     listLinkOutcomeCategoryOfSystem.forEach(function (outcomeCategory) {
//         outcomeCategory.addEventListener("click", function (event) {
//             event.preventDefault(); // Ngăn chặn gửi link mặc định
//             event.stopPropagation();
//         })
//     });

//     //sua hoac xoa category
//     updateOrDeleteOutcomeCategory();
// }