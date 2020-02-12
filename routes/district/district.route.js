/*
 * @Author: ghost 
 * @Date: 2020-02-12 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var districtController = require('../../controllers/district');


module.exports = function (router) {
    router.route('/fetch-districts')
        .get(districtController.fetchDistricts);

    router.route('/update-district')
        .post(districtController.updateDistricts);

    router.route('/save-district')
        .post(districtController.saveDistricts);

}