var User = require('../models/user');
var BaseModel = require('../models/basemodel');
var Teacher = require('../models/teacher');
var School = require('../models/school');
var Cluster = require('../models/cluster');
var District = require('../models/district');
var Block = require('../models/block');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger
const bcrypt = require('bcrypt');
const saltRounds = 10;

var COMPONENT = "user";
const STATUS_ACTIVE = 'ACTIVE'

exports.fetchUsers = function (req, res) {
    let teacher = req.query.teacher
    let condition = { status: STATUS_ACTIVE }
    if (teacher) {
        condition['teacher_code'] = teacher
    }
    BaseModel.findByCondition(User, condition, function (err, users) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, users).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateUsers = function (req, res) {
    if (!req.body || !req.body.user || !req.body.user.username) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let user = req.body.user
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(user.password, salt, function (err, hash) {
            let user_obj_update = { password: hash, statue: user.status }
            BaseModel.updateData(User, user_obj_update, user._id, function (err, doc) {
                if (err) {
                    let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                    return res.status(apistatus.http.status).json(apistatus);
                }
                let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
                return res.status(response.http.status).json(response);
            })
        });
    });
}

exports.saveUsers = function (req, res) {
    if (!req.body || !req.body.user || !req.body.user.username || !req.body.user.password || !req.body.user.teacher_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let user = req.body.user
    BaseModel.findByCondition(Teacher, { teacher_code: user.teacher_code }, function (err, teachers) {
        if (err || !teachers && teachers.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        BaseModel.findByCondition(User, { username: user.username, status: STATUS_ACTIVE }, function (err, userdb) {
            if (userdb && userdb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            user.status = STATUS_ACTIVE
            user.created_on = new Date()
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(user.password, salt, function (err, hash) {
                    user.password = hash
                    BaseModel.saveData(User, [user], function (err, doc) {
                        if (err) {
                            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                            return res.status(apistatus.http.status).json(apistatus);
                        }
                        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
                        return res.status(response.http.status).json(response);
                    })
                })
            })
        })
    })
}

exports.login = function (req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let user = req.body
    BaseModel.findByCondition(User, { username: user.username, status: STATUS_ACTIVE }, function (err, userdb) {
        if (err || !userdb || userdb.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_INVALID_CREDENTIALS, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let user_obj = userdb[0]._doc
        bcrypt.compare(user.password, user_obj.password).then(function (match) {
            if (match) {
                BaseModel.findByCondition(Teacher, { teacher_code: user_obj.teacher_code, status: STATUS_ACTIVE }, function (err, teacherdb) {
                    if (err || !teacherdb || teacherdb.length == 0) {
                        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_INVALID_CREDENTIALS, COMPONENT).getRspStatus()
                        return res.status(apistatus.http.status).json(apistatus);
                    }
                    let teacher = teacherdb[0]._doc
                    BaseModel.findByCondition(School, { school_code: teacher.school_code, status: STATUS_ACTIVE }, function (err, schooldb) {
                        if (err || !schooldb || schooldb.length == 0) {
                            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_INVALID_CREDENTIALS, COMPONENT).getRspStatus()
                            return res.status(apistatus.http.status).json(apistatus);
                        }
                        let school = schooldb[0]._doc
                        BaseModel.findByCondition(Cluster, { cluster_code: school.cluster_code, status: STATUS_ACTIVE }, function (err, clusterdb) {
                            if (err || !clusterdb || clusterdb.length == 0) {
                                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_INVALID_CREDENTIALS, COMPONENT).getRspStatus()
                                return res.status(apistatus.http.status).json(apistatus);
                            }
                            let cluster = clusterdb[0]._doc
                            BaseModel.findByCondition(Block, { block_code: cluster.block_code, status: STATUS_ACTIVE }, function (err, blockdb) {
                                if (err || !blockdb || blockdb.length == 0) {
                                    let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_INVALID_CREDENTIALS, COMPONENT).getRspStatus()
                                    return res.status(apistatus.http.status).json(apistatus);
                                }
                                let block = blockdb[0]._doc
                                BaseModel.findByCondition(District, { district_code: block.district_code, status: STATUS_ACTIVE }, function (err, districtdb) {
                                    if (err || !districtdb || districtdb.length == 0) {
                                        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_INVALID_CREDENTIALS, COMPONENT).getRspStatus()
                                        return res.status(apistatus.http.status).json(apistatus);
                                    }
                                    let district = districtdb[0]._doc
                                    let response = new Response(StatusCode.SUCCESS, { district, block, cluster, school, teacher }).getRsp()
                                    return res.status(response.http.status).json(response);
                                })
                            })
                        })
                    })
                })
            } else {
                LOG.error(match)
                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_INVALID_CREDENTIALS, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
        });
    })
}