var District = require('../models/district');
var State = require('../models/states');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "district";
const STAUS_ACTIVE = 'ACTIVE'

exports.fetchDistricts = function (req, res) {
    let state = req.query.state
    let condition = { status: STAUS_ACTIVE }
    if (state) {
        condition['state_code'] = state
    }
    District.findByCondition(condition, function (err, Districts) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, Districts).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateDistricts = function (req, res) {
    if (!req.body || !req.body.district || !req.body.district.district_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let district = req.body.district
    District.updateDistrict(district, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveDistricts = function (req, res) {
    if (!req.body || !req.body.district || !req.body.district.district_code || !req.body.district.district_name || !req.body.district.state_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let district = req.body.district
    State.findByCondition({ state_code: district.state_code }, function (err, states) {
        if (err || !states && states.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_STATE_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        District.findByCondition({ district_code: district.district_code, status: STAUS_ACTIVE }, function (err, districtdb) {
            if (districtdb && districtdb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            district.status = STAUS_ACTIVE
            district.created_on = new Date()
            District.saveDistricts([district], function (err, doc) {
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