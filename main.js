$(function() {
    /*------------------GEt halls----------------------*/
    var server = "http://localhost:63286/";
    $.ajax({
        url: server + "hall/all",
        method: "get",
        success: function(data) {
            var res = "";
            for(var i=0; i<data.length; i++) {
                res += '<li><input type="checkbox" value="' + data[i].id + '" onchange="CheckHall(this);">' + data[i].name + "<span class='error'></span></li>";
            }
            $("#hall_list").html(res);
        }
    });
    
    /*--------------------Get quests-----------------------*/
    $.ajax({
        url: server + "quests/all",
        method: "get",
        success: function(data) {
            var res = "";
            for(var i=0; i<data.length; i++) {
                res += '<li><input type="checkbox" value="' + data[i].id + '" onchange="CheckQuest(this);">' + data[i].name + '<input type="time" class="inp"><span class="error"></span></li>';
            }
            $("#quest_list").html(res);
        }
    });
    
    /*--------------------Initialize inputs-----------------*/
    $("#order_btn").click(function() {
        $("#modal").show();
        var date = new Date();
        var time = ToTimeString(date);
        $("input[type='time']").map(function(i, el) {
            $(this).val(time);
        });
        $("#date_val").val(ToDateString(date));
    });
    
/*-------------------------For only number-------------------------*/    
  $("#phone").keypress(function (e){
      var charCode = (e.which) ? e.which : e.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
  }
});
    
/*--------------------------Get Price---------------------------*/    
    $("#ref").click(function() {
        var obj = ForPrice();
        $.ajax({
            url: server + "orders/getprice",
            method: "post",
            data: obj,
            beforeSend: function() {
                $("#ref .fa-refresh").addClass("fa-spin");
            },
            success: function(data) {
                $("#ref .fa-refresh").removeClass("fa-spin");
                $('#price_val').val(data);
            }
        })
    });
    /*-------------Send Order--------------------*/
    $("#sub").click(function() {
        var obj = ForPrice();
        obj.customerName = $('#name').val();
        obj.customerPhone = $('#phone').val();
        obj.food = $('#food_value').val();
        obj.cinema = $('#cinema_val').val();
                
        $.ajax({
            url: server + "orders/create",
            method: "post",
            data: obj,
            beforeSend: function(xhr, opt) {
                if($('#name').val().length < 10) {
                    xhr.abort();
                    alert("Ім'я повинно складати не менше 10 символів");
                    return false;
                }
                if($('#phone').val().length < 10) {
                    xhr.abort();
                    alert("Номер повинен містити не менше 10 символів");
                    return false;
                }
                if($("input[type='checkbox']:checked").length <= 0) {
                    alert("Ви не обрали жодного квесту і залу");
                    xhr.abort();
                    return false;
                }
                var current = new Date().getTime();
                var date = $('#date_val').val();
                if(new Date(date).getTime() < current) {
                    alert("Не коректна дата");
                     xhr.abort();
                    return false;
                }
            },
            success: function(data) {
                $('#cancel').click();
            }
        });
        
    });
    
    /*------------------Cancel Order--------------------*/
    $('#cancel').click(function() {
        $('#modal').hide();
    });
    
    /*-------------On change time order---------------------*/
    $('#time').change(function() {
        var time = $(this).val();
        $("#quest_list input[type='time']").map(function(i, element) {
            $(element).val(time);
        });
    });
    
     /*$("#quest_list input[type='time']").change(function() {
         var start = $('#time').val();
         
     })*/

});

/*----------------------------Check order----------------------*/
$('#date_val, #time').focusout(function() {
    $("#hall_list input[type='checkbox']:checked").map(function(i, el) {
        CheckQuest(el);
    });
    $("#quest_list input[type='checkbox']:checked").map(function(i, el) {
        CheckQuest(el);
    });
});

$("#houre, #minutes").change(function() {
    $("#hall_list input[type='checkbox']:checked").map(function(i, el) {
        CheckQuest(el);
    });
    $("#quest_list input[type='checkbox']:checked").map(function(i, el) {
        CheckQuest(el);
    });
});

function CheckHall(el) {
    var that = $(el);
        if(el.checked == true) {
            var id = el.value;
            var minutes = $("#houre").val() * 60 + ($("#minutes").val() *1);
            var date = $("#date_val").val() + "T" + $("#time").val();
            
            var obj = {
                date: date,
                orderedMInutes: minutes
            };
            $.ajax({
                url: server + "check/hall/" + id,
                method: "post",
                data: obj,
                success: function(data) {
                    if(data == false) {
                        that.parent().find('.error').html(" *  на цю дату зал зайнятий");
                        $("#sub").attr("disabled", "disabled");
                    }
                    else {
                        $("#sub").removeAttr('disabled');
                        that.parent().find('.error').html(""); 
                    }   
                }
            });
        }
    if(el.checked == false) {
         that.parent().find('.error').html("");
        $("#sub").removeAttr('disabled');
    }
        
}

function CheckQuest(el) {
    var that = $(el);
        if(el.checked == true) {
            var id = el.value;
            var minutes = $("#houre").val() * 60 + ($("#minutes").val() *1);
            var date = $("#date_val").val() + "T" + $("#time").val();
            
            var obj = {
                date: date,
                orderedMInutes: minutes
            };
            $.ajax({
                url: server + "check/quest/" + id,
                method: "post",
                data: obj,
                success: function(data) {
                    if(data == false) {
                        that.parent().find('.error').html(" *  на цю дату квест зайнятий");
                        $("#sub").attr("disabled", "disabled"); 
                    }
                    else {
                        that.parent().find('.error').html("");
                         $("#sub").removeAttr('disabled');
                    }      
                }
            });
        }
    if(el.checked == false) {
         that.parent().find('.error').html("");
         $("#sub").removeAttr('disabled');
    }
        
    }

function ForPrice() {
    var date = $("#date_val").val();
    var obj = {
        date: date + "T" + $("#time").val(),
        countOfPeople: $("#countOfPeople").val(),
        orderedMInutes: $("#houre").val() * 60 + ($("#minutes").val() *1),
        hallsId: [],
        questOrders:[]
    };
    $("#hall_list input[type='checkbox']:checked").map(function(i, el) {
        obj.hallsId.push($(this).val());
    });
    $("#quest_list input[type='checkbox']:checked").map(function(i, el) {
        var item = {
            id: $(el).val(),
            date: date + "T" + $(el).parent().find('.inp').val()
        }
        obj.questOrders.push(item);
    });
    
    return obj;
}


 function ToDateString(date) {
        var dateString = date.getFullYear() + "-";
        if (date.getMonth() < 10) {
            dateString += "0" + date.getMonth() + "-";
        }
        else
            dateString += date.getMonth() + "-";
        if (date.getDate() < 10)
            dateString += "0" + date.getDate();
        else
            dateString += date.getDate();
        return dateString;
    }

function ToTimeString(date) {
    var res= "";
    if(date.getHours() < 10)
        res += "0" + date.getHours();
    else
        res += date.getHours()
    if(date.getMinutes() < 10)
        res += ":0" + date.getMinutes();
    else
        res += ":" + date.getMinutes();
    return res;
}