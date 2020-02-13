var Block = require('../models/block');
var District = require('../models/district');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "block";
const STATUS_ACTIVE = 'ACTIVE'

exports.fetchBlocks = function (req, res) {
    let district = req.query.district
    let condition = { status: STATUS_ACTIVE }
    if (district) {
        condition['district_code'] = district
    }
    Block.findByCondition(condition, function (err, blocks) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, blocks).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateBlocks = function (req, res) {
    if (!req.body || !req.body.block || !req.body.block.block_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let block = req.body.block
    block.updateBlock(block, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveBlocks = function (req, res) {
    if (!req.body || !req.body.block || !req.body.block.block_code || !req.body.block.block_name || !req.body.block.district_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let block = req.body.block
    District.findByCondition({ district_code: block.district_code }, function (err, districts) {
        if (err || !districts && districts.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_DISTRICT_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        Block.findByCondition({ block_code: block.block_code, status: STATUS_ACTIVE }, function (err, blockdb) {
            if (blockdb && blockdb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            block.status = STATUS_ACTIVE
            block.created_on = new Date()
            Block.saveBlocks([block], function (err, doc) {
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