/*
 * @Author: ghost 
 * @Date: 2020-02-13 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var userController = require('../../controllers/user');


module.exports = function (router) {
    router.route('/fetch-users')
        .get(userController.fetchUsers);

    router.route('/update-user')
        .post(userController.updateUsers);

    router.route('/save-user')
        .post(userController.saveUsers);

    router.route('/login')
        .post(userController.login);

}