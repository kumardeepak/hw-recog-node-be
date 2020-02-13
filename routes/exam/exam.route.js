/*
 * @Author: ghost 
 * @Date: 2020-02-13 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var examController = require('../../controllers/exam');


module.exports = function (router) {
    router.route('/fetch-exams')
        .get(examController.fetchExams);

    router.route('/update-exam')
        .post(examController.updateExams);

    router.route('/save-exam')
        .post(examController.saveExams);

}