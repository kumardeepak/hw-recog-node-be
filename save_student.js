var axios = require('axios')
var async = require('async')
let arr = []

for (var i = 1; i <= 200; i++) {
    if (i < 10) {
        arr.push("000" + i)
    } else if (i < 100) {
        arr.push("00" + i)
    } else {
        arr.push("0"+i)
    }
}
async.each(arr, function (d, callback) {
    let req = {
        "student": {
            "student_code": "3201",
            "student_name": "STU",
            "school_code": "24050100201"
        }
    }
    req.student.student_name = "STU" + d
    req.student.student_code = "201" + d
    axios
        .post('http://52.11.90.50/app/v1/save-student', req)
        .then(res => {
            console.log(res)
            callback()
        }).catch((e)=>{
            console.log(e)
        })
    // console.log(req)
    
    // Sentence.updateSentenceData(d, function (err, doc) {
    //     callback()
    // })

}, function (err) {
    console.log('done')
});
