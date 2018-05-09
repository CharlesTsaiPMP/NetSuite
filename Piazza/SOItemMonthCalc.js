/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/search'],
/**
 * @param {search} search
 */
function(search) {
    
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
    	log.debug(logHead('Entry'), scriptContext);
    	return true;
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
    	const logHead = function(type) { return 'CS:FC:'+type; };
    	log.debug(logHead('Entry'), scriptContext);
    	return true;
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
    	log.debug(logHead('Entry'), scriptContext);
    	return true;
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
    	log.debug(logHead('Entry'), scriptContext);
    	return true;
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
    	log.debug(logHead('Entry'), scriptContext);
    	return true;
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
    	const SUBLIST = 'item';
    	const curRec = scriptContext.currentRecord;
    	const sublistName = scriptContext.sublistId;
    	//---
    	const startDateFld = 'custcol1';
    	const endDateFld   = 'custcol4';
    	const numMonthFld  = 'custcol3'; // aka 'terms'
//    	const startDateFld = 'custcol_sub_start_date';
//    	const endDateFld   = 'custcol_sub_end_date';
//    	const numMonthFld  = 'custcol_terms_months'; // aka 'terms'

    	if (sublistName == SUBLIST) {
        	log.debug(logHead('sublist'), sublistName);

    		try {
    			var bDate = curRec.getCurrentSublistValue({
    				sublistId: sublistName,
    				fieldId: startDateFld
    			});
    			var eDate = curRec.getCurrentSublistValue({
    				sublistId: sublistName,
    				fieldId: endDateFld
    			});

    			log.debug(logHead('begin'), bDate);
    			log.debug(logHead('end'), eDate);
    			if (bDate && eDate) {
    				var x1 = bDate.getYear(), y1 = bDate.getMonth(), z1 = bDate.getDate();
    				var x2 = eDate.getYear(), y2 = eDate.getMonth(), z2 = eDate.getDate();

    				switch (y1) {
    					case 1: // Feb
    						z1 += (x1 % 4 == 0 && !(x1 %100 == 0 && !(x1 % 400 == 0) ))? 2 : 3;
    						break;
    					case 3: // Apr
    					case 5: // Jun
    					case 8: // Sep
    					case 10:// Nov
    						z1 += 1;
    				}

    				curRec.setCurrentSublistValue({
    					sublistId: sublistName,
    					fieldId: numMonthFld,
    					value: (x2 - x1) * 12 + (y2 - y1) + (z2 > z1? 1 : 0)
    				});
    			}
    		} catch (e) {
    			log.error(logHead(e.name), e.message);
    		}
    	}

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
    	log.debug(logHead('Entry'), scriptContext);
    	return true;
    }

    return {
/*
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord
*/
        validateLine: validateLine
    };
    
});
