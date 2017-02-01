/**
 * Created by pashed on 10.01.17.
 */
$(function () {
    $("#newJobDate").datepicker({
        dateFormat: 'yy-mm-dd',
        defaultDate: new Date(),
        minDate: new Date()
    });
    $("newJobDate").datepicker("setDate", new Date());
    $("#tabs").tabs();
    $('.menu').selectmenu({
        change: function (event, ui) {
            var itemid=$(this).parent().prop('id');
            switch(ui.item.value)
            {
                case 'delete':
                    deleteItem(itemid,function (err) {
                        if(err) alert("can't delete task"+err);
                    });
                    $(this).parent().replaceWith("<div>Видалено</div>");
                    break;
                case 'done':
                    checkDone(itemid,true);
                    break;
                case 'postpone':
                    //$(this).parent().unwrap();
                    console.log("postpone");
                    $(this).parent().append('<div id="tempDate"><div>');
                    $('#tempDate').datepicker({
                        dateFormat: 'yy-mm-dd',
                        defaultDate: new Date(),
                        minDate: new Date()
                    }).on('change', function () {
                        var selectedDate = $(this).val();
                        $(this).remove();
                        console.log(selectedDate);
                        saveTaskDate(itemid, selectedDate);

                    });

                    break;
            }
            $(this).val('default');
            $(this).selectmenu('refresh');
        }

    });

    $(".task").on('click', '.tasktext', function () {
        var idstring={taskid: $(this).parent().prop("id")};
        $.getJSON("/taskfind",idstring)
            .done(function (data) {
                //console.log("data: "+data.task);
                //console.log('selector:'+"#"+data._id+" > span.tasktext");
                $("#"+data._id+" > span.tasktext").replaceWith('<input class="tasktext" name="editing" type="text" value="'+data.task+'">');
                $("[name='editing']")
                    .focus()
                    .on('focusout ',function () {
                        if($(this).val() !== data.task) {
                            if(confirm("Зберегти зміни?")) {
                                saveTaskText(data._id,$(this).val());
                                $(this).replaceWith('<span class="tasktext">"'+$(this).val()+'"<span>');
                                return;
                            }
                        }
                        $(this).replaceWith('<span class="tasktext">"'+data.task+'"<span>');
                    })
                    .on('keypress', function (key) {
                        if(key.which == 13){
                            if ($(this).val() !== data.task) {
                                if (confirm("Зберегти зміни?")) {
                                    saveTaskText(data._id, $(this).val());
                                    $(this).replaceWith('<span class="tasktext">"' + $(this).val() + '"<span>');
                                    return;
                                }
                            }
                            $(this).replaceWith('<span class="tasktext">"' + data.task + '"<span>');
                        }
                    })
            })
            .fail(function () {
                console.log("fail");
            });
    });
    $(".newtask").submit (function () {
        var today=new Date().toLocaleDateString('uk-UA', {day: 'numeric', month: 'long',year: 'numeric'})
        if($('#newJobText').val() == '' || new Date($('#newJobDate').val()) < new Date(today)) {
            alert ("заповність поля \n Текст задачі має містити хочаб один символ \n Дата не може бути меньшою поточної");

            window.location='\daytasks';
            return;
        }
        var params=$('form.newtask').serialize();


        $.post('/new', params)
            .done(function (data) {
                console.log('New: '+data);
                window.location='\daytasks';
            })
            .fail(function () {
                console.log('Fail New');
            })

    });
    $('.ui-selectmenu-button').css('backgroundColor', 'inherit');
});
function saveTaskDate(id, date) {
    $.post('/save', {id: id, taskdate: date})
        .done(function (d) {
            console.log(d);
            window.location.reload();
        })
        .fail(function () {
            console.log("date save error");
        })
}
function saveTaskText(id,text) {
    $.post('/save',{id:id, tasktext:text})
        .done(function () {
            console.log("task saved");
        })
        .fail(function () {
            console.log("text save error");
        })
}
function checkDone(id,check){
    $.post('/donetask',{id:id,check:check})
        .done(function () {
            console.log("checked");
            window.location.reload();

        })
        .fail(function (err) {
            console.log("error:"+err);
        })
}

function deleteItem(id,cb) {
    $.post('/delete',{id:id})
        .done(function () {
            console.log("good delete");
            cb(null);

        })
        .fail(function (err) {
            console.log("fail delete");
            cb(err);
        })
}