var Ocr = require('../models/ocr');
var BaseModel = require('../models/basemodel');
var Exam = require('../models/exam');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "ocr";
const SATUS_ACTIVE = 'ACTIVE'

exports.fetchOcrs = function (req, res) {
    let exam = req.query.exam
    let condition = { status: SATUS_ACTIVE }
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
    if (!req.body || !req.body.ocr_data || !req.body.exam_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let data = req.body
    BaseModel.findByCondition(Ocr, { exam_code: data.exam_code, status: SATUS_ACTIVE }, function (err, ocrdb) {
        if (err || !ocrdb || ocrdb.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_DATA_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        } else {
            let res_data = ocrdb[0]._doc
            let table = data.ocr_data.response[data.ocr_data.response.length > 1 ? 1 : 0]
            table.data.map((t) => {
                if (t.col == 1) {
                    t.col = 3
                    res_data.data.push(t)
                }
            })
            table.data = res_data.data
            data.ocr_data.response[data.ocr_data.response.length > 1 ? 1 : 0] = table
            let response = new Response(StatusCode.SUCCESS, data).getRsp()
            return res.status(response.http.status).json(response);
        }
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
        BaseModel.findByCondition(Ocr, { exam_code: ocr.exam_code, status: SATUS_ACTIVE }, function (err, ocrdb) {
            if (ocrdb && ocrdb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            ocr.status = SATUS_ACTIVE
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