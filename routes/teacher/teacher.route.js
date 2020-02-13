/*
 * @Author: ghost 
 * @Date: 2020-02-13 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var teacherController = require('../../controllers/teacher');


module.exports = function (router) {
    router.route('/fetch-teachers')
        .get(teacherController.fetchTeachers);

    router.route('/update-teacher')
        .post(teacherController.updateTeachers);

    router.route('/save-teacher')
        .post(teacherController.saveTeachers);

}