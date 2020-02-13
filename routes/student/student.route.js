/*
 * @Author: ghost 
 * @Date: 2020-02-13 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var studentController = require('../../controllers/student');


module.exports = function (router) {
    router.route('/fetch-students')
        .get(studentController.fetchStudents);

    router.route('/update-student')
        .post(studentController.updateStudents);

    router.route('/save-student')
        .post(studentController.saveStudents);

}