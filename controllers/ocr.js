var Ocr = require('../models/ocr');
var User = require('../models/user');
var OcrData = require('../models/ocr_data');
var Student = require('../models/student');
var BaseModel = require('../models/basemodel');
var Exam = require('../models/exam');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

var LOG = require('../logger/logger').logger

var COMPONENT = "ocr";
const STATUS_ACTIVE = 'ACTIVE'
const MARKS_RECEIVED_KEY = 'Marks received'

exports.fetchOcrs = function (req, res) {
    let exam = req.query.exam
    let condition = { status: STATUS_ACTIVE }
    if (exam) {
        condition['exam_code'] = exam
    }
    BaseModel.findByCondition(Ocr, condition, function (err, ocrs) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, ocrs).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.downloadReport = function (req, res) {
    let date = req.query.date
    let teacher = req.query.teacher
    if (!teacher) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let condition = { username: teacher }
    BaseModel.findByCondition(User, condition, function (err, users) {
        if (err || !users) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let user_obj = users[0]._doc
        let ocr_condition = { teacher_code: user_obj.teacher_code }
        if (date) {
            ocr_condition['exam_date'] = date
        }
        BaseModel.findByCondition(OcrData, ocr_condition, function (err, ocrs) {
            if (err) {
                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_NOTFOUND, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            let timestamp = new Date().getTime()
            const csvWriter = createCsvWriter({
                header: ['NAME', 'LANGUAGE'],
                path: 'upload/' + timestamp + '.csv'
            });
            let response = new Response(StatusCode.SUCCESS, ocrs).getRsp()
            return res.status(response.http.status).json(response);
        })
    })

}

exports.updateOcrs = function (req, res) {
    if (!req.body || !req.body.ocr || !req.body.ocr.data) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let ocr = req.body.ocr
    let ocr_obj_update = { data: ocr.data, statue: ocr.status }
    BaseModel.updateData(Ocr, ocr_obj_update, ocr._id, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.checkOcr = function (req, res) {
    if (!req.body || !req.body.ocr_data || !req.body.exam_code || !req.body.student_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let data = req.body
    BaseModel.findByCondition(Student, { student_code: data.student_code, status: STATUS_ACTIVE }, function (err, students) {
        if (err || !students || students.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_WRONG_STUDENT_CODE, COMPONENT).getRspStatus()
            return res.status(200).json(apistatus);
        }
        let student = students[0]._doc
        BaseModel.findByCondition(Ocr, { exam_code: data.exam_code, status: STATUS_ACTIVE }, function (err, ocrdb) {
            if (err || !ocrdb || ocrdb.length == 0) {
                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_DATA_NOTFOUND, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            } else {
                let res_data = ocrdb[0]._doc
                let table_index = 0
                data.ocr_data.response.map((res, index) => {
                    if (res.header.title === MARKS_RECEIVED_KEY) {
                        table_index = index
                    }
                })
                let table = data.ocr_data.response[table_index]
                table.data.map((t) => {
                    if (t.col == 1) {
                        t.col = 3
                        res_data.data.push(t)
                    }
                })
                table.data = res_data.data
                data.student_name = student.student_name
                data.ocr_data.response[table_index] = table
                let response = new Response(StatusCode.SUCCESS, data).getRsp()
                return res.status(response.http.status).json(response);
            }
        })
    })
}

exports.saveOcrs = function (req, res) {
    if (!req.body || !req.body.ocr || !req.body.ocr.data || !req.body.ocr.exam_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let ocr = req.body.ocr
    BaseModel.findByCondition(Exam, { exam_code: ocr.exam_code }, function (err, exams) {
        if (err || !exams && exams.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_EXAM_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        BaseModel.findByCondition(Ocr, { exam_code: ocr.exam_code, status: STATUS_ACTIVE }, function (err, ocrdb) {
            if (ocrdb && ocrdb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            ocr.status = STATUS_ACTIVE
            ocr.created_on = new Date()
            BaseModel.saveData(Ocr, [ocr], function (err, doc) {
                if (err) {
                    let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                    return res.status(apistatus.http.status).json(apistatus);
                }
                let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
                return res.status(response.http.status).json(response);
            })
        })
    })
}

exports.saveOcrData = function (req, res) {
    if (!req.body || !req.body.exam_date || !req.body.exam_code || !req.body.student_code || !req.body.teacher_code || !req.body.ocr_data) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let ocr = req.body
    ocr.created_on = new Date()
    BaseModel.saveData(OcrData, [ocr], function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}