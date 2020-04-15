var classController = require('../../controllers/class');


module.exports = function (router) {
    router.route('/fetch-class')
        .get(classController.fetchClasses);

    router.route('/update-class')
        .post(classController.updateClasses);

    router.route('/save-class')
        .post(classController.saveClasses);

}