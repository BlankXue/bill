var loan = {
    status: {3: "立即投标", 5: "满标待审核", 9: "还款中", 10: "还款完成", 11: "还款完成"},
    creditrating: {10: "学", 20: "hr", 30: "c", 40: "b", 50: "a", 60: "aa"},
    color:{3: "weui-btn-red", 5: "weui-btn-ora", 9: "weui-btn-ora", 10: "weui-btn-green", 11: "weui-btn-green"}
};
$(function () {
    //轮播效果
    $('#slide2').swipeSlide({
        autoSwipe: true,//自动切换默认是
        speed: 5000,//速度默认4000
        continuousScroll: true,//默认否
        transitionType: 'cubic-bezier(0.22, 0.69, 0.72, 0.88)',//过渡动画linear/ease/ease-in/ease-out/ease-in-out/cubic-bezier
        lazyLoad: true,//懒加载默认否
        firstCallback: function (i, sum, me) {
            me.find('.dot').children().first().addClass('cur');
        },
        callback: function (i, sum, me) {
            me.find('.dot').children().eq(i).addClass('cur').siblings().removeClass('cur');
        }
    });


    $.post("/loans/list", function (json) {
        if (!json.data) {
            return;
        }
        var list = json.data, lis = "";
        for (var i in list.content) {
            var bean = list.content[i], id = bean["id"], status = parseInt(bean["status"]),
                creditrating = bean["creditrating"], rate = bean["rate"];
            lis += "<li><a  href='/loan/detail?id=" + id +  "&status=" + status + "'><h3><i class='st" + bean["type"] + "'></i>" + bean["name"] + "</h3>" +
                "<dl><dd><p class='ratio'>" + rate.substring(0, rate.length - 1) + "<span>%</span></p>年利率</dd>" +
                "<dd><p class='month'>" + bean["period"] + "<span>个月</span></p>期限</dd>" +
                "<dd><a class='weui-btn weui-btn_primary " + loan.color[status] +
                "' href='/loan/detail?id=" + id + "&status=" + status + "'>" + loan.status[status] + "</a></dd>" +
                "</dl><div class='clearfix'></div></a></li>";
        }
        $(".loans ul").empty().append(lis)
    }, "json");
});

