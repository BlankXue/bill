var user = {score:0};
user.registerFormValidate = function(){
    $("#registerForm").validate({
        showErrors: function (errorMap, errorList) {
            if (errorList.length > 0)
                yUtils.showErrorToast(errorList[0].message);
        },
        rules: {
            imgValidCode:{
                required: true,
                remote : {
                    url : '/account/checkImgVerifiedCode',
                    data : {
                        imgValidCode : function(){return $("#imgValidCode").val();}
                    }
                }
            },
            phoneValidCode: {
                required: true,
                remote : {
                    url : '/account/checkPhoneVerifiedCode',
                    data : {
                        phoneVerifiedCode : function(){return $("#phoneValidCode").val();}
                    }
                }
            },
            account: {
                required: true,
                remote : {
                    url : '/account/checkAccount',
                    data : {
                        account : function(){return $("#account").val();}
                    }
                }
            },
            realName: {
                required: true
            },
            email: {
                required: true,
                email:true,
                remote : {
                    url : '/account/checkEmail',
                    data : {
                        email : function(){return $("#email").val();}
                    }
                }
            },
            signPassword: {
                required: true,
                minlength:6
            },
            payPassword: {
                required: true,
                minlength:6
            },
            origin:{
                required: true
            }
        }, messages: {
            imgValidCode: {
                required: "图形验证码必填",
                remote:"图形验证码不正确"
            },
            phoneValidCode: {
                required: "手机验证码必填",
                remote:"手机验证码不正确"
            },
            account:{
                required: "昵称必填",
                remote:"昵称已被注册"
            },
            realName:{
                required: "姓名必填"
            },
            email: {
                required: "邮箱必填",
                email:"邮箱格式不正确",
                remote:"邮箱已被注册"
            },
            signPassword: {
                required: "登录密码必填",
                minlength:"登录密码最少6位"
            },
            payPassword: {
                required: "交易密码必填",
                minlength:"交易密码最少6位"
            },
            origin:{
                required: "来源必选"
            }
        }
    });
};
user.register = function(){
    if($("#registerForm").valid()){
        if($("#origin").val()=='0' && $("#presenter").val().trim()==''){
            yUtils.showErrorToast("推荐者必填");
        }else{
            $.post("/account/register",{"phoneVerifiedCode":$("#phoneValidCode").val(),"email":$("#email").val(),"phone":yUtils.getParam("username"),"presenter":$("#presenter").val(),"origin":$("#origin").val(),
                "signPassword":$("#signPassword").val(),"payPassword":$("#payPassword").val(),"account":$("#account").val(),"realName":$("#realName").val()},function(data){
                if(data.code == '200'){
                    window.location.href="/account/registerSuccess";
                }else{
                    yUtils.showErrorToast(data.msg);
                }
            },"json");
        }
    }
};
user.changeImgCode = function(){
    user.score++;
    $("#imgVerificationCode").attr("src", "/account/generatorImgCode?t="+user.score);
};
user.countDown = function(seconds){
    if(seconds>0){
        $('#phoneValidateCodeBtn').prop("value",seconds+'s');
        seconds=seconds-1;
        setTimeout("user.countDown("+seconds+")",1000);
    }else{
        $('#phoneValidateCodeBtn').prop("value",'获取验证码');
        $("#phoneValidateCodeBtn").removeAttr('disabled');
        $("#phoneValidateCodeBtn").css("background","white");
    }
};
user.changeOrigin = function(m){
    if($(m).val()=='0'){
        $("#presenterDiv").css("display","block");
    }else{
        $("#presenterDiv").css("display","none");
        $("#presenter").val('');
    }
};
$(function () {
    if(yUtils.getParam("presentName") !=null){
        $("#origin").val(0);
        $("#presenterDiv").css("display","block");
        $("#presenter").val(decodeURI(yUtils.getParam("presentName")));
    }
    user.registerFormValidate();
    user.changeImgCode();
    //发送手机验证码
    $("#phoneValidateCodeBtn").on("click",function(){
        if($("#registerForm").validate().element($("#imgValidCode"))){
            $.post('/account/sendPhoneCode',{"tempId":"JSM40243-0032","username":yUtils.getParam("username"),"imgVerificationCode":$("#imgValidCode").val()},function(data) {
                if(data.code=="500"){
                    yUtils.showErrorToast(data.msg);
                }
                else{
                    document.getElementById("phoneValidateCodeBtn").disabled = true;
                    $("#phoneValidateCodeBtn").css("background","#F5F5F5");
                    var seconds = 60;
                    user.countDown(seconds);
                }},"json");
        }
    });
});