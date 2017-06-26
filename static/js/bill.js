'use strict';
function notNull(val) {
    if (!val) {
        return 0;
    } else {
        return val;
    }
}

/****
 * 钱格式化
 * @p aram n
 * @param x
 * @returns {string}
 */
Number.prototype.format = function (n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};


/***
 *  定义动画
 * @type {{}}
 */
var animation = {};
animation.initAnimationItems = function () {
    $('.animated').each(function () {
        var aniDuration, aniDelay;

        $(this).attr('data-origin-class', $(this).attr('class'));

        aniDuration = $(this).data('ani-duration');
        aniDelay = $(this).data('ani-delay');

        $(this).css({
            'visibility': 'hidden',
            'animation-duration': aniDuration,
            '-webkit-animation-duration': aniDuration,
            'animation-delay': aniDelay,
            '-webkit-animation-delay': aniDelay
        });
    });
};

animation.playAnimation = function (dom) {
    this.clearAnimation();

    var aniItems = $(dom).find('.animated');

    $(aniItems).each(function () {
        var aniName;
        $(this).css({'visibility': 'visible'});
        aniName = $(this).data('ani-name');
        $(this).addClass(aniName);
    });
};

animation.clearAnimation = function () {
    $('.animated').each(function () {
        $(this).css({'visibility': 'hidden'});
        $(this).attr('class', $(this).data('origin-class'));
    });
};

var myChart = null, bills = {}, options = {
    title: {
        text: '投标占比',
        x: 'center',
        y: 'center',
        textStyle: {
            color: "#fff",
            fontSize: "20"
        }
    },
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    series: [
        {
            name: '访问来源',
            type: 'pie',
            radius: ['40%', "60%"],
            center: ['50%', '50%'],
            data: [
                {
                    value: 0, name: '1-6个月',
                    itemStyle: {
                        normal: {
                            color: "#f75c4a"
                        }
                    }
                },
                {
                    value: 0, name: '6个月以上',
                    itemStyle: {
                        normal: {
                            color: "#ff7d01"
                        }
                    }
                }
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 12,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};

bills.initOther = function () {
    $('.loading-overlay').hide();
    //初始化，动画效果
    animation.initAnimationItems();
    //初始化画布
    $(".item").show();
    //初始化滚动效果
    fullscreen.init({
        'type': 2, 'useArrow': true,
        'useMusic':{src:"static/images/bill.mp3"},
        'pageShow': function (dom) {//页面出现时候
            animation.playAnimation(dom);
            if ($(dom).index() == 6 && myChart == null && parseFloat($("#typeAmount").attr("data")) > 0) {
                //绘制饼图
                myChart = echarts.init(document.getElementById('pie'));
                myChart.setOption(options);
                myChart.on("click", function (e) {
                    var type = (e.name == "1-6个月"), val = e.value;
                    if (type) {
                        $("#typeName").text("1-6个月内标的投资金额达");
                    } else {
                        $("#typeName").text("6个月以上标的投资金额达");
                    }
                    $("#typeAmount").html(e.value.format() + "<span>元</span>");
                });
            }
        }, 'pageHide': function (dom) {//页面被隐藏
            if ($(dom).index() == 7) {
                $(".dialog").hide();
            }
        }
    });
    //强制执行动画
    animation.playAnimation($(".item1"));
};
$(document).ready(function () {
    //初始化数据
    $.get("static/bill.json", function (json) {
        var bill = json["bill"];
        $("#registerTime").text(bill["registerTimeStr"]);
        if (!!bill["firstRecharge"]) {
            $("#firstRecharge").text(bill["firstRechargeStr"]);
        } else {
            $(".recharge").hide();
        }
        $("#year").text(notNull(bill["year"]) + "年间");
        $("#earnings").text(notNull(bill["earnings"]).format());
        if (!!json.yearBill) {
            var yearBill = json.yearBill;
            $("#yearEarnings").html(notNull(yearBill["earnings"]) + "<span>元</span>");
            $("#yearInvests").text(notNull(yearBill["invests"]).format());
        }
        var compare = json["compare"], yearCompare = compare["earnings"];
        $("#comEarnings").html("收益<br>" + yearCompare);
        $("#comInvests").html("投资笔数<br>" + compare["invests"]);
        if (yearCompare == "增加了") {
            $("#lastYearSay").html("<b>“</b>您比去年更有投资眼光了</div><b>”</b>");
        } else {
            $("#lastYearSay").html("<b>“</b>今年的损失，明年一定努力赚回来，再接再厉! <b>”</b>");
        }
        if (!!json.monthBill) {
            var monthBill = json["monthBill"];
            $("#month").text(monthBill["month"]);
            $("#monthAmount").text(notNull(monthBill["amount"]).format());
            $("#monthEarnings").text(notNull(monthBill["interest"]).format());
            $("#monthInvests").text(notNull(monthBill["invests"]));
        }
        $("#leadings").text(notNull(bill["leadings"]) + "%");

        if (!!json.typeBills) {
            var ary = [], typeAmount = 0, type = 0;

            for (var i in json.typeBills) {
                var typeBill = json["typeBills"][i], amount = typeBill["amount"];
                if (typeBill["type"] == 0) {
                    ary.push({
                        value: amount, name: '1-6个月',
                        itemStyle: {
                            normal: {
                                color: "#f75c4a"
                            }
                        }
                    });
                    if (amount > typeAmount) {
                        typeAmount = amount > typeAmount ? amount : typeAmount;
                        type = 0;
                    }
                } else {
                    ary.push({
                        value: amount, name: '6个月以上',
                        itemStyle: {
                            normal: {
                                color: "#f4992d"
                            }
                        }
                    });
                    if (amount > typeAmount) {
                        typeAmount = amount > typeAmount ? amount : typeAmount;
                        type = 1;
                    }
                }
            }
            options.series[0].data = ary;
            $("#typeName").html(type == 0 ? "1-6个月标的投资金额达" : "6个月以上标的投资金额达");
            $("#typeAmount").attr("data", typeAmount).html(typeAmount.format() + "<span>元</span>")
        }


        bills.initOther();
    }, "json");

    bills.initOther();
    //开启下一页
    $(".btn").click(function () {
        var item = $('.item2');
        item.attr('state', 'prev');
        item.siblings('.item').removeAttr('state');

        var currentItem = item.next();
        currentItem.attr('state', 'next');

        item.css('-webkit-transform', 'scale(.8)');
        item.next().css('-webkit-transform', 'translate3d(0,0,0)');
        return false;
    });
    //测算
    $(".celling").click(function () {
        var index = parseInt(Math.random() * 10) % 3;
        if (!bills.index) {
            bills.index = index;
        }
        setTimeout(function () {
            $(".dialog").eq(bills.index).fadeIn()
        }, 100);
        return false;
    });
    //dialog
    $(".dialog").click(function () {
        $(this).fadeOut();
        return false;
    });
});


!(function(win, doc){
    function setFontSize() {
        // 获取window 宽度
        // zepto实现 $(window).width()就是这么干的
        var winWidth =  window.innerWidth;
        // doc.documentElement.style.fontSize = (winWidth / 640) * 100 + 'px' ;

        // 2016-01-13 订正
        // 640宽度以上进行限制 需要css进行配合
        var size = (winWidth / 640) * 100;
        doc.documentElement.style.fontSize = (size < 100 ? size : 100) + 'px' ;
    }

    var evt = 'onorientationchange' in win ? 'orientationchange' : 'resize';

    var timer = null;

    win.addEventListener(evt, function () {
        clearTimeout(timer);

        timer = setTimeout(setFontSize, 300);
    }, false);

    win.addEventListener("pageshow", function(e) {
        if (e.persisted) {
            clearTimeout(timer);

            timer = setTimeout(setFontSize, 300);
        }
    }, false);

    // 初始化
    setFontSize();

}(window, document));