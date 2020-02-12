/*
 * @Author: ghost 
 * @Date: 2020-02-12 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var blockController = require('../../controllers/block');


module.exports = function (router) {
    router.route('/fetch-blocks')
        .get(blockController.fetchBlocks);

    router.route('/update-block')
        .post(blockController.updateBlocks);

    router.route('/save-block')
        .post(blockController.saveBlocks);

}