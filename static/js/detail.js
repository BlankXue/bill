$(function () {
    loan.init();
    $(".icon-close").click(function () {
       loan.closeBidPage();
    });
});
var loan = {second: 15};
loan.init = function () {
    $.post("/loan/detail/" + yUtils.getParam("id"), function (json) {
        var bean = json["loan"],status=bean["status"];
        if (!bean) {
            return;
        }
        if (status != 3) {
            window.location.href = "/loan/detail?id=" + yUtils.getParam("id")+"&status="+status;
        }
         var $leftAmount=bean["amount"] - bean["proceeds"];
        $(".loanName").text(bean["name"]);
        $("#repay").text(bean["repay"].name);
        $(".amount").text("￥" + parseFloat(bean["amount"]).format());
        $("#progress").attr("data", json["progress"] + "%");
        $("#progressNum").text(json["progress"] + "%");
        $("#leftAmount").text($leftAmount.format());
        $("#rate").text(bean["rateFormat"].replace("%",""));
        $("#period").text(bean["period"]);
        $("#userId").val(json["userId"]);
        $("#investBidMultiple").val(bean["lowestAccount"]);
        $("#status").addClass("st"+json["type"]);
        $(".js_progress").animate({width: $(".js_progress").attr("data")}, 1000);
        //修改title
        var $body = $('body');
        document.title = bean["name"] + "-金陵e贷";
        // hack在微信等webview中无法修改document.title的情况
        var $iframe = $('<iframe src="/favicon.ico"></iframe>');
        $iframe.on('load',function() {
            setTimeout(function() {
                $iframe.off('load').remove();
            }, 0);
        }).appendTo($body);
        if($leftAmount == 0){
            $("#confirmBid").prop("disabled", true).text("标的已满").css("background-color", "#AAAAAA");
            $("#investAmount,.number>div").hide();
        }
    }, "json");
};
//借款人信息
loan.goUser = function () {
    window.location.href = "/loan/user?userId=" + $("#userId").val();
};
//标的详情页
loan.goInfo = function () {
    window.location.href = "/loan/info?loanId=" + yUtils.getParam("id");
};
//投资记录
loan.goInvest = function () {
    window.location.href = "/loan/invest?loanId=" + yUtils.getParam("id");
};

/*****
 * 准备投标
 */
loan.bidInfoBefore = function () {
    var reg = /^[1-9]\d*$/,
        investAmount = $.trim($("#investAmount").val()),
        investBidMultiple = parseInt($("#investBidMultiple").val()),
        leftAmount = parseInt($("#leftAmount").text().replace(",", "")),
        loanId = yUtils.getParam("id"),
        $error = $(".error");
    if (!reg.test(investAmount) || parseInt(investAmount) < investBidMultiple) {
        $error.text("请输入大于起投金额" + investBidMultiple + "的数字").show();
        return;
    }
    investAmount = parseInt(investAmount);
    if (investAmount > leftAmount) {
        investAmount = leftAmount;
        $("#investAmount").val(leftAmount);
    }
    if (investAmount % investBidMultiple != 0) {
        $error.text("输入金额必须为" + investBidMultiple + "整数倍").show();
        return;
    }

    $.ajax({
        url: "/invest/bidInfoBefore",
        data: {"investAmount": investAmount, "loanId": loanId},
        type: "POST",
        dataType: 'json',
        beforeSend: function () {
            $("#confirmBid").prop("disabled", true).text("请稍后...").css("background-color", "#AAAAAA");
            setTimeout(function () {
                $("#confirmBid").prop("disabled", false).text("立即投标").css("background-color", "#fb4945");
            }, 1500);
        },
        success: function (data) {
            if (data.type == "SUCCESS") {
                $error.hide();
                loan.openBidPage(loanId);
            } else if (data.type == "WARNING") {
                window.location.href = "/";
            } else if (data.type == "FAILURE") {
                $error.text(data.data).show();
            }
        }
    });
};

loan.openBidPage = function (loanId) {
    $(".invest-amount").text(parseInt($("#investAmount").val()).format() + "元");
    $("#investDialog").show();
    loan.interval = window.setInterval(function () {
        $("#second b").text(--loan.second + "秒");
        if (loan.second == 0) {
            window.clearInterval(loan.interval);
            loan.closeBidPage();
        }
    }, 1000);
};

loan.closeBidPage = function () {
    $.ajax({
        url: "/invest/closeBidPage",
        data: {"loanId": yUtils.getParam("id")},
        type: "POST",
        dataType: 'json',
        success: function (data) {
            if (data.type == "SUCCESS") {
                window.location.reload();
            } else if (data.type == "WARNING") {
                window.location.href = "/";
            }
        }
    });
};

/***
 * 确认投标
 */
loan.saveLoanApply = function () {
    var tradingPwd = $("#tradingPwd").val();
    var $error = $("#pwd-error").hide();
    if (tradingPwd == "") {
        $error.text("请输入交易密码").show();
        return;
    }
    $.ajax({
        url: "/invest/confirmBid",
        data: {loanId: yUtils.getParam("id"), tradingPwd: tradingPwd},
        type: "POST",
        dataType: 'json',
        success: function (data) {
            if (data.type == "SUCCESS") {
                yUtils.showSuccessToast("恭喜您，投标成功");
                setTimeout(function(){ window.location.reload();},1000);
            } else if (data.type == "WARNING") {
                window.location.href = "/";
            } else if (data.type == "FAILURE") {
                yUtils.showErrorToast(data.messages);
            } else {
                yUtils.showErrorToast(data.messages);
            }
        }
    });
};

