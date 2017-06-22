$(function () {
    invest.getData();
    //切换状态栏
    $(".tabs li").click(function () {
        var index = $(this).index();
        $(this).addClass("active").siblings().removeClass("active");
        $(".loans").hide();
        if (index == 0) {
            invest.getData();
        } else if (index == 1) {
            dskInvest.getData();
        } else if (index == 2) {
            yjqInvest.getData();
        }
        return false;
    });
    $.extend(yjqInvest, invest);
    $.extend(dskInvest, invest);
    yjqInvest.type = 3;
    dskInvest.getData = function () {
        $("#loadingToast").fadeIn();
        var $this = this;
        $.post("/loan/dskdetail", {page: this.page, size: 6}, function (json) {
            if (!json.list.content) {
                return;
            }
            $this.lastPage = json.list.totalPages - 1;
            var list = json.list.content, lis = "";
            for (var i in list) {
                var bean = list[i];
                lis += "<li><a  href='/loan/detail?id=" + bean["loanId"] +  "&status=" + bean["status"] + "'><h3><i class='st" + bean["loanKind"] + "'></i>" + bean["loanName"] + "</h3>" +
                    "<div class='weui-flex'>" +
                    "<div class='weui-flex__item'>应收本金：<b>" + bean["principal"] + " 元</b></div>" +
                    "<div class='weui-flex__item'>应收利息：<b>" + bean["interest"]+ " 元</b></div></div>" +
                    "<div class='weui-flex'>" +
                    "<div class='weui-flex__item'>第几期/总期数：<b>" + bean["sequence"] + "/" + bean["period"] + "</b></div>" +
                    "<div class='weui-flex__item'>应收日期：<b>" + bean["planReceiveDate"].substring(0, 10) + "</b></div></div></a></li>";
            }
            var $ul = $("#table2  ul");
            $ul.empty().append(lis).parent().show();
            if (list.length == 0) {
                $ul.append("<li><h3>暂无记录</h3></li>");
                $("#table2 .footer-ajax").hide();
            }
            $("#loadingToast").fadeOut();
        }, "json");
    };
});
//回收中债权
var invest = {page: 0, type: 1};
//代收款债权
var dskInvest = {page: 0};
//已结清债权
var yjqInvest = {page: 0, type: 3};
invest.getData = function () {
    $("#loadingToast").fadeIn();
    var $this = this;
    $.post("/loan/list", {page: this.page, size: 4, type: this.type}, function (json) {
        if (!json.list.content) {
            return;
        }
        $this.lastPage = json.list.totalPages - 1;
        var list = json.list.content, lis = "";
        for (var i in list) {
            var bean = list[i];
            lis += "<li><a  href='/loan/detail?id=" + bean["loanId"] +  "&status=" + bean["loanStatus"] + "'><h3><i class='st" + bean["loanKind"] + "'></i>" + bean["name"] + "</h3>" +
                "<div class='weui-flex'>" +
                "<div class='weui-flex__item'>借款金额：<b>" + bean["amount"].format() + " 元</b></div>" +
                "<div class='weui-flex__item'>我的投资金额：<b>" + bean["investAmount"] + " 元</b></div></div>" +
                "<div class='weui-flex'>" +
                "<div class='weui-flex__item'>应收本息：<b>" + bean["shouldReceivePI"] + " 元</b></div>" +
                "<div class='weui-flex__item'>投标时间：<b>" + bean["datetime"].substring(0, 10) + "</b></div></div>" +
                "<div class='weui-flex'>" +
                "<div class='weui-flex__item'>年化率：<b>" + bean["rate"] + "</b></div>" +
                "<div class='weui-flex__item'>期限：<b>" + bean["period"] + "个月</b></div></div></a></li>";
        }
        var $ul = $("#table" + $this.type + " ul");
        $ul.empty().append(lis).parent().show();
        if (list.length == 0) {
            $ul.append("<li><h3>暂无记录</h3></li>");
            $("#table"+$this.type).find(".footer-ajax").hide();
        }
        $("#loadingToast").fadeOut();
    }, "json");
};
invest.goFirst = function () {
    if (this.page == 0) {
        yUtils.showErrorToast("已到首页");
        return;
    }
    this.page = 0;
    this.getData();
};
invest.goLast = function () {
    if (this.page == this.lastPage) {
        yUtils.showErrorToast("已到尾页");
        return;
    }
    this.page = this.lastPage;
    this.getData();
};
invest.goPre = function () {
    if (this.page == 0) {
        yUtils.showErrorToast("已到首页");
        return;
    }
    --this.page;
    this.getData();
};
invest.goNext = function () {
    if (this.page == this.lastPage) {
        yUtils.showErrorToast("已到尾页");
        return;
    }
    ++this.page;
    this.getData();
};





