/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

var Reflector = function(obj) {
	this.getProperties = function() {
		var properties = [];
		for (var property in obj) {
			if (typeof obj[property] != 'function') {
				properties.push(property);
			}
		}
		return properties;
	};

	this.getMethods = function() {
		var methods = [];
		for (var method in obj) {
			if (typeof obj[method] == 'function') {
				methods.push(method);
			}
		}
		return methods;
	};

	this.getOwnMethods = function() {
		var methods = [];
		for (var method in obj) {
			if (typeof obj[method] == 'function'
				&& obj.hasOwnProperty(method)) {
				methods.push(method);
			}
		}
		return methods;
	};	
}

define(['N/record'],
/**
 * @param {record} record
 */
function(record) {
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @param {Form}
	 *            scriptContext.form - Current form
	 * @Since 2015.2
	 */
    function beforeLoad(scriptContext) {
        if (scriptContext.type !== scriptContext.UserEventType.CREATE)
            return;
        var customerRecord = scriptContext.newRecord;
/*        customerRecord.setValue({
            fieldId: 'title', 
            value: 'Make follow-up call to new customer'
        });
        customerRecord.setValue({
            fieldId: 'message', 
            value: 'Please follow up with this customer ASAP!'
        }); */
        customerRecord.setValue('title', 'Make follow-up call to new customer');
        customerRecord.setValue('message', 'Please follow up with this customer!');
/*
        log.debug({
        	title: 'Information',
        	details: scriptContext.UserEventType
        });

        log.debug({
        	title: 'Information',
        	details: scriptContext.form.title
        });

        log.debug({
        	title: 'Information',
        	details: scriptContext.request
        });
*/
		var reflector = new Reflector(scriptContext.newRecord);
        log.debug({
        	title: 'Info: newRecord',
        	details: scriptContext.newRecord
        });
        log.debug({
        	title: 'Info: newRecord.sublist',
        	details: scriptContext.newRecord.toJSON()
        });
/*
        log.debug({
        	title: 'Info: Properties',
        	details: reflector.getProperties().join('<br/>')
        });
        log.debug({
        	title: 'Info: Methods',
        	details: reflector.getMethods().join('<br/>')
        });
*/
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
