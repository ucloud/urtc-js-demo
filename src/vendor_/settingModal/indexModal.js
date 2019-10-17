import '../jquery-3.3.1';
let ROOM_TYPE = {
    0: [{
        'value': '0',
        'lable': '推流'
    }, {
        'value': '1',
        'lable': '拉流'
    }, {
        'value': '2',
        'lable': '全部'
    }],
    1: [{
        'value': '0',
        'lable': '推流'
    }, {
        'value': '1',
        'lable': '拉流'
    }],
}

function tarHtml() {
    let h = ` 
    <div class="modal-wrapper">
        <div class="modal-header">设置</div>   
        <div class = "modal-body" >
            <p class = "modal-body_title">房间类型:</p>
            <select class = "modal_select" 
            id = "room_type" >
                <option class="modal_option" value = "0" > rtc小班课 </option>
                <option class = "modal_option" value = "1" > rtc大班课 </option>
            </select>
        </div>
         <div class = "modal-body"
         id = "role_type_wrapper">
            <p class = "modal-body_title" > 
                用户权限: </p>  
                <select class = "modal_select" id = "role_type" >
               </select> 
        </div>
        <div class = "modal-footer clearfix" >
            <div>
                <button class = "modal_cancel"> 取消 </button>
                <button class = "modal_submit">确定</button > 
            </div>
        </div>
    </div>
`;
    return h;
    // < option value = "0" > 推流 < /option> <
    //     option value = "1" > 拉流 < /option> <
    //     option value = "2" > 全部 < /option>

}

function opt(arr) {
    let dom = ``;
    arr.map((e) => {
        dom += `<option class="modal_option" value = ${e.value} > ${e.lable} </option>`;
    });
    $('#role_type').html(dom);
    return dom;
}

let configModal = {

    config: {
        role_type: 2, //用户权限0 推流 1 拉流 2 全部
        room_type: 0, //房间类型 0 rtc小班课 1 rtc 大班课
    },
    init: function () {
        var _that = this;
        var setWrapper = document.createElement('div');
        setWrapper.className = 'set-wrapper';
        setWrapper.setAttribute('id', 'setModal');
        document.body.appendChild(setWrapper);
        $('#setModal').html(tarHtml().trim());
        opt(ROOM_TYPE[this.config.room_type]);
        $('#role_type').val(this.config.role_type);
        $('#room_type').val(this.config.room_type);
        $('.modal_cancel').click(function () {
            _that.close();
        });
        $('#setModal').click(function (e) {
            if (e.target.id === 'setModal') {
                _that.close();
            }
        });
        $('.modal_submit').click(function () {
            _that.submit();
            _that.close();
        });
        $('#role_type').change(function (e, value) {
            var role_type = $(this).children('option:selected').val();
            _that.config.role_type = role_type ;
        });
        $('#room_type').change(function (e, value) {
            var room_type = $(this).children('option:selected').val();
            _that.config.room_type = room_type ;

            // 重制用户权限列表
            opt(ROOM_TYPE[room_type]);
            _that.config.role_type = 0;
        });


        this.close();
    },
    open: function () {
        $('#setModal').fadeIn(200);
        $('#role_type').val(this.config.role_type);
        $('#room_type').val(this.config.room_type);
    },
    close: function () {
        $('#setModal').fadeOut(200);
    },
    submit: function () {
        return this.config;
    },
    getConfig: function () {
        return this.config;
    }
}

export default configModal;