/*
 * @Author: ghost 
 * @Date: 2019-09-04 10:41:11 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2019-09-04 10:16:03
 */
var cron = require('node-cron');
var async = require('async');



function start() {
    cron.schedule('* * * * *', function () {
        // Sentences.assignBatch()
    });
}


module.exports.start = start;
