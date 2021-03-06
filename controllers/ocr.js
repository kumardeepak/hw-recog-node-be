var Ocr = require('../models/ocr');
var User = require('../models/user');
var OcrData = require('../models/ocr_data');
var Student = require('../models/student');
var BaseModel = require('../models/basemodel');
var Exam = require('../models/exam');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
var LOG = require('../logger/logger').logger
var Teacher = require('../models/teacher');
var async = require('async');

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
    let exam = req.query.exam
    if (!teacher || !exam) {
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
        let ocr_condition = { teacher_code: user_obj.teacher_code, exam_code: exam }
        if (date) {
            ocr_condition['exam_date'] = date
        }
        let timestamp = new Date().getTime()
        let path = 'upload/' + timestamp + '.csv'
        BaseModel.findByCondition(OcrData, ocr_condition, function (err, ocrs) {
            if (err || !ocrs || ocrs.length == 0) {
                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_NOTFOUND, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }

            let header = {
                header: ['Sr.No.', 'Code', 'MaxMarks'],
                path: path
            }
            let records = []

            ocrs.map((ocr, index) => {
                let record_ocr_index = 0
                let ocr_data = ocr._doc.ocr_data.response
                if (ocr_data[1].data.length > ocr_data[0].data.length) {
                    record_ocr_index = 1
                }

                let ocr_data_map = {}
                let max_row = 0
                ocr_data[record_ocr_index].data.map((data) => {
                    if (data.row > 0) {
                        if (max_row < data.row) {
                            max_row = data.row
                        }
                        ocr_data_map[data.row + '' + data.col] = data.text
                    }
                })
                for (var i = 1; i <= max_row; i++) {
                    if (index == 0) {
                        let record = []
                        record.push(ocr_data_map[i + '' + 0])
                        record.push(ocr_data_map[i + '' + 1])
                        record.push(ocr_data_map[i + '' + 2])
                        record.push(ocr_data_map[i + '' + 3])
                        records.push(record)
                    } else {
                        if (records[i - 1]) {
                            let record = records[i - 1]
                            record.push(ocr_data_map[i + '' + 3])
                            records[i - 1] = record
                        }
                    }
                }
                header.header.push('Marks Obtained By ' + ocr._doc.student_code)
                ocr._doc.ocr_data_map = ocr_data_map
                return ocr
            })




            const csvWriter = createCsvWriter(header);
            csvWriter.writeRecords(records)       // returns a promise
                .then(() => {
                    res.download(path);
                });
            // let response = new Response(StatusCode.SUCCESS, records).getRsp()
            // return res.status(response.http.status).json(response);
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
    if (!req.body || !req.body.ocr || !Array.isArray(req.body.ocr) || req.body.ocr.length <= 0) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }

    let ocrArr = []
    async.each(req.body.ocr, function (ocrReq, callback) {
        if (ocrReq && ocrReq.exam_code && ocrReq.examid_uuid && ocrReq.ocr_data) {
            BaseModel.findByCondition(Exam, { exam_code: ocrReq.exam_code, status: STATUS_ACTIVE }, function (err, examdb) {
                if (!examdb || examdb.length == 0) {
                    LOG.debug(ocrReq.student_code, " exam code is missing")
                    callback()
                }

                let ocr = ocrReq
                ocr.created_on = new Date()
                ocrArr.push(ocr)
                callback()
            })
        } else {
            callback()
        }
    },
        function (err) {
            if (err) {
                LOG.error(err)
                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            } else {
                let createOcr = []
                let updateOcr = []

                async.each(ocrArr, function (ocrs, callback) {
                    let condition = {}

                    if (ocrs.examid_uuid) {
                        condition['examid_uuid'] = ocrs.examid_uuid
                    }
                    if (ocrs.exam_code) {
                        condition['exam_code'] = ocrs.exam_code
                    }

                    BaseModel.findByCondition(OcrData, condition, function (err, existingOcrs) {
                        if (err) {
                            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                            return res.status(apistatus.http.status).json(apistatus);
                        } else if (existingOcrs && Array.isArray(existingOcrs) && existingOcrs.length > 0) {
                            ocrs._id = existingOcrs[0]._doc._id
                            updateOcr.push(ocrs)
                            let ocr_obj_update = { exam_date: ocrs.exam_date, teacher_code: ocrs.teacher_code, ocr_data: ocrs.ocr_data, class_code: ocrs.class_code }

                            BaseModel.updateData(OcrData, ocr_obj_update, existingOcrs[0]._id, function (updateErr, doc) {
                                if (updateErr) {
                                    let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                                    return res.status(apistatus.http.status).json(apistatus);
                                }
                                callback()

                            })

                        } else {
                            createOcr.push(ocrs)
                            callback()

                        }

                    })

                }, function (error) {
                    if (error) {
                        LOG.error(error)
                        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                        return res.status(apistatus.http.status).json(apistatus);
                    }
                    BaseModel.saveData(OcrData, createOcr, function (err1, doc) {
                        if (err1) {
                            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                            return res.status(apistatus.http.status).json(apistatus);
                        }
                        processedRec = updateOcr.length + createOcr.length
                        let response = new Response(StatusCode.SUCCESS, processedRec + " ocr's are processed").getRsp()
                        return res.status(response.http.status).json(response);
                    })

                })
            }

        })

}
