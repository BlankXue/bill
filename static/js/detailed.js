$(function () {
    loan.init();
});
var loan = {
    second: 15, status: {5: "满标待审核", 9: "还款中", 10: "还款完成", 11: "还款完成",8:"已流标",1:"已取消",7:"已取消",20:"已取消",21:"已取消"},
    color: {5: "weui-btn-ora", 9: "weui-btn-ora", 10: "weui-btn-green", 11: "weui-btn-green",8:"weui-btn-gray",7:"weui-btn-gray",20:"weui-btn-gray",21:"weui-btn-gray"}
};
loan.init = function () {
    $.post("/loan/detail/" + yUtils.getParam("id"), function (json) {
        var bean = json["loan"], status = bean["status"];
        if (!bean) {
            return;
        }
        if (status == 3) {
            window.location.href = "/loan/detail?id=" + yUtils.getParam("id") + "&status=" + status;
        }
        $(".loanName").text(bean["name"]);
        $("#repay").text(bean["repay"].name);
        $(".amount").text("￥" + parseFloat(bean["amount"]).format());
        $("#progress").attr("data", json["progress"] + "%");
        $("#progressNum").text(json["progress"] + "%");
        $("#leftAmount").text((bean["amount"] - bean["proceeds"]).format());
        $("#rate").text(bean["rateFormat"].replace("%", ""));
        $("#period").text(bean["period"]);
        $("#userId").val(json["userId"]);
        $("#investBidMultiple").val(bean["lowestAccount"]);
        $(".js_progress").animate({width: $(".js_progress").attr("data")}, 1000);
        $("#status").addClass("st" + json["type"]);
        $("#confirmBid").text(loan.status[status]).addClass(loan.color[status]).parent().show();


        var $body = $('body');
        document.title = bean["name"] + "-金陵e贷";
        // hack在微信等webview中无法修改document.title的情况
        var $iframe = $('<iframe src="/favicon.ico"></iframe>');
        $iframe.on('load',function() {
            setTimeout(function() {
                $iframe.off('load').remove();
            }, 0);
        }).appendTo($body);
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


