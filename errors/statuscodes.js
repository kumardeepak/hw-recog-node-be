/**
 * possible error codes used by the application
 * @author: KD
 */
'use strict'

/**
 *  200 - OK
    404 - Not Found
    500 - Internal Server Error

    201 - Created
    304 - Not Modified

    400 - Bad Request
    401 - Unauthorized
    403 - Forbidden
 */


exports.StatusCode = {
    SUCCESS: { ok: true, http: { status: 200 }, why: "request successful" },
    ERR_GLOBAL_SYSTEM: { ok: false, http: { status: 500 }, why: "Internal Server Error" },
    ERR_GLOBAL_MISSING_PARAMETERS: { ok: false, http: { status: 400 }, why: "required data missing" },
    ERR_WRONG_STUDENT_CODE: { ok: false, http: { status: 501 }, why: "WRONG_STUDENT_ID" },
    ERR_GLOBAL_MAX_LIMIT_EXCEEDED: { ok: false, http: { status: 400 }, why: "max limit exceeded" },
    ERR_GLOBAL_INVALID_PARAMETERS: { ok: false, http: { status: 400 }, why: "invalid params passed" },
    ERR_DATA_EXIST: { ok: false, http: { status: 400 }, why: "requested data already exist" },
    ERR_GLOBAL_DATA_NOTFOUND: { ok: false, http: { status: 400 }, why: "requested data not found" },
    ERR_GLOBAL_UNAUTHORIZED: { ok: false, http: { status: 401 }, why: "unauthorized request" },
    ERR_GLOBAL_NOTFOUND: { ok: false, http: { status: 404 }, why: "requested information doesn't exist" },
    ERR_GLOBAL_LANG_NOTFOUND: { ok: false, http: { status: 404 }, why: "requested language doesn't exist" },
    ERR_GLOBAL_STATE_NOTFOUND: { ok: false, http: { status: 400 }, why: "requested state doesn't exist" },
    ERR_GLOBAL_DISTRICT_NOTFOUND: { ok: false, http: { status: 400 }, why: "requested district doesn't exist" },
    ERR_GLOBAL_SCHOOL_NOTFOUND: { ok: false, http: { status: 400 }, why: "requested school doesn't exist" },
    ERR_GLOBAL_BLOCK_NOTFOUND: { ok: false, http: { status: 400 }, why: "requested block doesn't exist" },
    ERR_GLOBAL_EXAM_NOTFOUND: { ok: false, http: { status: 400 }, why: "requested exam doesn't exist" },
    ERR_GLOBAL_CLUSTER_NOTFOUND: { ok: false, http: { status: 400 }, why: "requested cluster doesn't exist" },
    ERR_ALREADY_PROCESSED: { ok: false, http: { status: 501 }, why: "requested data already processed" },
}