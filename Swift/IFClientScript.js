/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/runtime'],
/**
 * @param {runtime} runtime
 */
function(runtime) {
	const cutoffYear = 2016;
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
    	const logHead = function(type) { return 'CS:PI:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);

    	if (currentRecord.getValue('customform') != 40)
        	currentRecord.setValue('customform', 40);
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
    	var shouldProceed = false;
    	['trandate', 'returnshipaddr1', 'returnshipaddr2',
    	 'returnshipzipcode', 'packageweightfedex'].map(function(fId) {
    		if (fId == scriptContext.fieldId)
    			shouldProceed = true;
    	});
    	if (!shouldProceed)
    		return;

    	const logHead = function(type) { return 'CS:FC:'+type; };
    	const fId = scriptContext.fieldId;
    	var currentRecord = scriptContext.currentRecord;
    	var tranYear = parseInt(/\d+\/\d+\/(\d+)/.exec(currentRecord.getText('trandate'))[1]);
    	log.debug(logHead('Entry('+tranYear+')'), scriptContext);

    	if (tranYear < cutoffYear)
    		switch (fId) {
    			case 'trandate':
    				var sublist = 'item';
    	    		var total = currentRecord.getLineCount({sublistId: sublist});

    	    		for (var i = 0; i < total; i++) {
    					try {
    						currentRecord.selectLine({
    							sublistId: sublist,
    							line: i
    						});
    						currentRecord.setCurrentSublistValue({
    							sublistId: sublist,
    							fieldId: 'location',
    							value: 1
    						});
//    						currentRecord.commitLine({
//    							sublistId: sublist
//    						});
    					}
    					catch (e) {
    						// do nothing since PIKSI might contain 'location' field too
    					}
    	    		}

    	    		break;
    			case 'returnshipaddr1':
    				if (currentRecord.getText(fId) != '2148 3rd Street')
    					currentRecord.setText(fId, '2148 3rd Street');
    				break;
    			case 'returnshipaddr2':
    				if (currentRecord.getText(fId) != '')
    					currentRecord.setText(fId, '');
    				break;
    			case 'returnshipzipcode':
    				if (currentRecord.getText(fId) != '94107') {
    					currentRecord.setText(fId, '94107');
    					currentRecord.setValue('generateintegratedshipperlabel', false); // piggyback
    				}
    				break;
    			case 'packageweightfedex':
    				var sublist = scriptContext.sublistId; // 'packagefedex'
    				currentRecord.setCurrentSublistText({
    					sublistId: sublist,
    					fieldId: 'admpackagetypefedex',
    					text: 'Bag'
    				});
    				currentRecord.commitLine({
    					sublistId: sublist
    				});

    				var hasBoxPackage = [];
    				var total = currentRecord.getLineCount({sublistId: sublist});

    	    		for (var i = 0; i < total; i++) {
    					var pWeight = currentRecord.getSublistValue({
    						sublistId: sublist,
    						fieldId: 'packageweightfedex',
    						line: i
    					});
    					var pType = currentRecord.getSublistText({
    		    			sublistId: sublist,
    		    			fieldId: 'admpackagetypefedex',
    		    			line: i
    		    		});
    					log.debug(logHead('Line('+i+')'), pWeight+'/'+pType);

    					if (pType == 'Box')
    						hasBoxPackage.unshift(i);
    				}

    	    		hasBoxPackage.map(function(lIndex) {
    	    	    	log.debug(logHead('Purge('+lIndex+')'), 'purging required');
    	    			currentRecord.removeLine({
    	    				sublistId: sublist,
    	    				line: lIndex
    	    			});
    	    		});
    				break;
    			default:
    				break;
    		}
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {
    	const logHead = function(type) { return 'CS:PS:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);
    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {
    	const logHead = function(type) { return 'CS:SC:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);
    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {
    	const logHead = function(type) { return 'CS:LI:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);
    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {
    	const logHead = function(type) { return 'CS:VF:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);

    	return true;
    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {
    	const logHead = function(type) { return 'CS:VL:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);

    	return true;
    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {
    	const logHead = function(type) { return 'CS:VI:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);

    	return true;
    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {
    	const logHead = function(type) { return 'CS:VD:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);

    	return true;
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	const logHead = function(type) { return 'CS:SR:'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);

    	return true;
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged /*,
        validateInsert: validateInsert,
        sublistChanged: sublistChanged,
        validateDelete: validateDelete,
        postSourcing: postSourcing,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        saveRecord: saveRecord */
    };
    
});
