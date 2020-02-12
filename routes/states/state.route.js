/*
 * @Author: ghost 
 * @Date: 2020-02-12 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var stateController = require('../../controllers/state');


module.exports = function (router) {
    router.route('/fetch-states')
        .get(stateController.fetchStates);

    router.route('/update-state')
        .post(stateController.updateStates);

    router.route('/save-state')
        .post(stateController.saveStates);

}