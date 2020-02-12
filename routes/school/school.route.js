/*
 * @Author: ghost 
 * @Date: 2020-02-12 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var schoolController = require('../../controllers/school');


module.exports = function (router) {
    router.route('/fetch-schools')
        .get(schoolController.fetchSchools);

    router.route('/update-school')
        .post(schoolController.updateSchools);

    router.route('/save-school')
        .post(schoolController.saveSchools);

}