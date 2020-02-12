/*
 * @Author: ghost 
 * @Date: 2020-02-12 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var clusterController = require('../../controllers/cluster');


module.exports = function (router) {
    router.route('/fetch-clusters')
        .get(clusterController.fetchClusters);

    router.route('/update-cluster')
        .post(clusterController.updateClusters);

    router.route('/save-cluster')
        .post(clusterController.saveClusters);

}