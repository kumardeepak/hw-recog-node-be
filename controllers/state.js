var State = require('../models/states');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "state";
const SATUS_ACTIVE = 'ACTIVE'

exports.fetchStates = function (req, res) {
    State.findByCondition({status: SATUS_ACTIVE}, function (err, States) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, States).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateStates = function(req, res){
    if (!req.body || !req.body.State || !req.body.state.state_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let state = req.body.state
    State.updateState(state, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveStates = function (req, res) {
    if (!req.body || !req.body.state || !req.body.state.state_code || !req.body.state.state_name) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let state = req.body.state
    State.findByCondition({ state_code: state.state_code, status: SATUS_ACTIVE }, function (err, statedb) {
        if (statedb && statedb.length > 0) {
            let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        state.status = SATUS_ACTIVE
        state.created_on = new Date()
        State.saveStates([state], function (err, doc) {
            if (err) {
                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
            return res.status(response.http.status).json(response);
        })
    })
}