/*
 * @Author: ghost 
 * @Date: 2020-02-13 10:59:10 
 * @Last Modified by: aroop.ghosh@tarento.com
 * @Last Modified time: 2020-02-12 10:18:27
 */
var ocrController = require('../../controllers/ocr');


module.exports = function (router) {
    router.route('/fetch-ocrs')
        .get(ocrController.fetchOcrs);

    router.route('/download-report')
        .get(ocrController.downloadReport);

    router.route('/update-ocr')
        .post(ocrController.updateOcrs);

    router.route('/save-ocr-masterdata')
        .post(ocrController.saveOcrs);

    router.route('/save-ocr-data')
        .post(ocrController.saveOcrData);

    router.route('/check-ocr')
        .post(ocrController.checkOcr);

}