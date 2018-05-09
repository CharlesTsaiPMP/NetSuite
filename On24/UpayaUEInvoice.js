/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/runtime'],
/**
 * @param {email} email
 * @param {runtime} runtime
 */
function(email, runtime) {
	const btRoleId = 5; /* 5 is the role ID for A/R Clerk */
	const defaultForm = {
/*			1: 'ON24 Subscription prebill Invoice',
			2: 'ON24 Nonsubscription prebill Invoice'
*/
			1: 110,
			2: 105
	};

	function setCustomForm(rec) {
    	const logHead = function(type) { return 'CS:setCustomForm:'+type; };

    	try {
			var contractType = rec.getValue('custbody_contract_type');
			var match = /Elite|Full Service|Virtual Show|Self Service/g.exec(contractType);
			var formIndex = match && match[0] && match[0] == 'Elite'? 1 : 2;

			// only change the form if it is different from the current one
			if (rec.getText('customform') != defaultForm[formIndex]) {
				rec.setText('customform', defaultForm[formIndex]);
				log.debug(logHead('customForm'), '"'+ contractType + '" -> ' + rec.getText('customform'));
			}

			if (!match)
	    		log.debug(logHead('WARNING'), 'Unknown contract type: ' + contractType);
	    	else if (match.length != 1)
	    		log.debug(logHead('WARNING'), 'Multiple patterns are found: ' + match);

			return defaultForm[formIndex];
    	} catch (e) {
    		log.error(logHead(e.name), e.message);
		}
	}

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	const logHead = function(type) { return 'BL:'+type; };
    	var currentRecord = scriptContext.newRecord;
    	log.debug(logHead('Entry'), scriptContext);
    	log.debug(logHead('request'), scriptContext.request);

//		setCustomForm(currentRecord);
    	var rec = currentRecord;
    	try {
			var contractType = rec.getValue('custbody_contract_type');
			var match = /Elite|Full Service|Virtual Show|Self Service/g.exec(contractType);
			var formIndex = match && match[0] && match[0] == 'Elite'? 1 : 2;

			rec.setValue('customform', defaultForm[formIndex]);
			log.debug(logHead('customForm'), '"'+ contractType + '" -> ' + rec.getValue('customform'));

			if (!match)
	    		log.debug(logHead('WARNING'), 'Unknown contract type: ' + contractType);
	    	else if (match.length != 1)
	    		log.debug(logHead('WARNING'), 'Multiple patterns are found: ' + match);
    	} catch (e) {
    		log.error(logHead(e.name), e.message);
		}

		if (runtime.getCurrentUser().role != btRoleId)
			currentRecord.getField({fieldId: 'customform'}).isDisabled = true;
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
