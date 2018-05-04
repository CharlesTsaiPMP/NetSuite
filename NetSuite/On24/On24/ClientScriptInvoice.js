/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
/**                                               
* @ FILENAME     :  
* @ AUTHOR       : Upaya Solution
* @ EDITED BY    : Upaya Solution
* @ DATE CREATED : March 2018
*
* Copyright (c) 2018 Upaya - The Solution Inc.
* 4320 Stevens Creek Blvd Suite # 124, San Jose, CA 95129, USA
* All Rights Reserved.
*
* This software is the confidential and proprietary information of 
* Upaya - The Solution Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with Upaya.
*/
define(['N/runtime'],
/**
 * @param {runtime} runtime
 */
function(runtime) {
	const btRoleIds = [/*3,*/ 5]; /* 3: Administrator, 5: A/R Clerk */
	const defaultForm = {
			1: 'ON24 Subscription prebill Invoice',
			2: 'ON24 Nonsubscription prebill Invoice'
	};

	function setCustomForm(rec) {
    	const logHead = function(type) { return 'CS:setCustomForm:'+type; };
    	var isFormChanged = false;

    	try {
			var contractType = rec.getValue('custbody_contract_type');
			var match = /Elite|Full Service|Virtual Show|Self Service/g.exec(contractType);
			var formIndex = match && match[0] && match[0] == 'Elite'? 1 : 2;

			// only change the form if it is different from the current one
			if (rec.getText('customform') != defaultForm[formIndex]) {
				isFormChanged = true;
				rec.setText('customform', defaultForm[formIndex]);
				log.debug(logHead('customForm'), '"'+ contractType + '" -> ' + rec.getText('customform'));
			}

			if (!match)
	    		log.debug(logHead('WARNING'), 'Unknown contract type: ' + contractType);
	    	else if (match.length != 1)
	    		log.debug(logHead('WARNING'), 'Multiple patterns are found: ' + match);
		} catch (e) {
    		log.error(logHead(e.name), e.message);
		}

		return isFormChanged;
	}

	function setTaxableField(rec, type)
	{
/*		var bIsTaxable = nlapiGetCurrentLineItemValue(type,'istaxable');

		if(name != 'istaxable') return true;
		if(bIsTaxable == 'T')
		{
			nlapiSetCurrentLineItemValue(type,'custcol_taxable','*',false,true);
		}
		else
		{
			nlapiSetCurrentLineItemValue(type,'custcol_taxable','',false,true);
		}

		// -^- old code; -v- new code
		const fieldChanged = 'istaxable';
		const fieldAffected = 'custcol_taxable';
		const isTaxable = rec.getCurrentSublistValue({
			sublistId: type,
			fieldId: fieldChanged        	
		});

		rec.setCurrentSublistValue({
			sublistId: type,
			fieldId: fieldAffected,
			value: isTaxable? '*' : ''
		});
*/	}

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
    	var currentSession = runtime.getCurrentSession();
    	var level = 'currentLevel';
    	if (!currentSession.get({name: level})) {
    		currentSession.set({name: level, value: 0});
    		log.debug(level, 0);
    	}
		currentSession.set({name: level, value: currentSession.get({name: level})+1});

    	const logHead = function(type) { return 'CS:PI('+currentSession.get({name: level})+'):'+type; };
    	var currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);
    	log.debug(logHead('Level'), currentSession.get({name: level}));

    	if (!setCustomForm(currentRecord)) {
    		var isEditable = false;
    		var uRoleId = runtime.getCurrentUser().role;
    		btRoleIds.map(function(rId) {
    			if (rId == uRoleId)
    				isEditable = true;
   			});
 			currentRecord.getField({fieldId: 'customform'}).isDisabled = !isEditable;
    	}

		currentSession.set({name: level, value: currentSession.get({name: level})-1});
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
    	const currentRecord = scriptContext.currentRecord;
    	log.debug(logHead('Entry'), scriptContext);

    	try {
    		switch (scriptContext.fieldId) {
    			case 'custbody_contract_type':
    				log.debug(logHead('fieldId'), '"'+scriptContext.fieldId+'" change logic triggered');
    				setCustomForm(currentRecord); // not working; original value is restored when new form is loaded
    				break;
    			case 'istaxable':
    				log.debug(logHead('fieldId'), '"'+scriptContext.fieldId+'" change logic triggered');
    				setTaxableField(currentRecord, scriptContext.sublistId);
    				break;
    			default:
    				break;
    		}
    	}
    	catch (e) {
    		log.error(logHead(e.name), e.message);
    		return false;
    	}

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

    }

    return {
/*      pageInit: pageInit,
        fieldChanged: fieldChanged,
        postSourcing: postSourcing,
        sublistChanged: sublistChanged,
        lineInit: lineInit,
        validateField: validateField,
        validateLine: validateLine,
        validateInsert: validateInsert,
        validateDelete: validateDelete,
        saveRecord: saveRecord
*/      pageInit: pageInit,
        fieldChanged: fieldChanged
    };
    
});
