const moment = require('moment');

module.exports = {
    formatDate: function (data, format){
        return moment(data).format(format);
    },
    truncate: function (str, len){
        if(str.length > len && str.length > 0){
            let new_str = str + ' ';
            new_str = str.substr(0, len);
            //new_str = str.substr(0, new_str.lastIndexOf(' '));
            new_str = new_str.length > 0 ? new_str: str.substr(0, len);
            return new_str + '...'; 
        }
        return str;
    },
    stripTags: function (input) {
        return input.replace(/<(?:.|\n)*?>/gm, '');
    },
    editIcon: function (informationUser, loggedUser, informationId, floating = true) {
        if (informationUser._id.toString() == loggedUser._id.toString()) {
            if (floating) {
                return `<a href="/informations/edit/${informationId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`
            } else {
                return `<a href="/informations/edit/${informationId}"><i class="fas fa-edit"></i></a>`
            }
        } else {
            return ''
        }
    },
    select: function (selected, options) {
        return options
          .fn(this)
          .replace(
            new RegExp(' value="' + selected + '"'),
            '$& selected="selected"'
          )
          .replace(
            new RegExp('>' + selected + '</option>'),
            ' selected="selected"$&'
          )
    },
    titleLimit: function (title, len) {        
        // もしstringの文字数がMAX_LENGTH（今回は10）より大きかったら末尾に...を付け足して返す。
        if (title.length > len) {
        
            // substr(何文字目からスタートするか, 最大値);
            return title.substr(0, len) + '...';
        }
        //　文字数がオーバーしていなければそのまま返す
        return title;
    },
    TimeRanges: function (time) {
        const date = new Date (time) ;
        var year = date.getFullYear() ;
        var month = date.getMonth() + 1 ;
        var day = date.getDate() ;

        var remaining = "";
        remaining += year + '/';
        remaining += ("0" + month).slice(-2) + '/';
        remaining += ("0" + day).slice(-2);
        return remaining;
    }
}