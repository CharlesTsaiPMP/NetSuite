/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/runtime', 'N/https', 'N/plugin', 'N/redirect', 'N/email'],
/**
 * @param {search} search
 * @param {record} record
 * @param {runtime} runtime
 * @param {https} https
 * @param {plugin} plugin
 * @param {redirect} redirect
 * @param {email} email
 */
function(search, record, runtime, https, plugin, redirect, email) {
	const piType = 'customscript_upy_pi_profile';
//	const pi = plugin.loadImplementation({type: piType});

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
    	const pi = plugin.loadImplementation({type: piType});
    	const logHead = function(type) { return 'BL:'+type; };
    	const PREFIX = pi.prefix();
		const SUITELET = runtime.getCurrentScript().getParameter({name: pi.suitelet()});
		const sublist = 'recmachcustrecord_upy_profile_skill_parent';
		var rec = scriptContext.newRecord;

    	log.debug(logHead('Info'), 'type: '+scriptContext.type+
    							   ', id: '+runtime.getCurrentUser().id+
    							   ', role: '+runtime.getCurrentUser().role);

//    	sendEmail();
/*
    	try {
    		// piggyback here if there are skill/profile records that need to be cleaned
    		[5,6,7].map(function(sId) {
    			record.delete({type: pi.skillType(), id: sId});
    			log.debug(logHead('Info:skillPurged'), sId);
    		});
    		[66].map(function(pId) {
    			record.delete({type: pi.profileType(), id: pId});
    			log.debug(logHead('Info:profilePurged'), pId);
    		});
    	}
    	catch (e) {
    		log.error(logHead(e.name), e.message);
    	}

		search.create({
			type: search.Type.BILLING_SCHEDULE,
			filters: [['name', search.Operator.IS, 'Y1/Y2']]
		}).run().each(function(result) {
			const sublist = 'recurrence';
			log.error(logHead('id'), result.id);
			var sched = record.load({
				type: record.Type.BILLING_SCHEDULE,
				id: result.id,
				isDynamic: false
			});
			var total = sched.getLineCount({sublistId: sublist});
			for (var i = 0; i < total; i++) {
				['count', 'units', 'recurrencedate', 'amount', 'paymentterms'].map(function(field) {
					log.error(logHead(field+'('+i+')'), sched.getSublistValue({
						sublistId: sublist,
						fieldId: field,
						line: i
					}));
				});
			}
		});
*/
		if (scriptContext.type === scriptContext.UserEventType.EDIT &&
			runtime.getCurrentUser().role != 3) {
    		redirect.toRecord({
    			type: rec.type,
    			id: rec.id
    		});
    		return;
    	}

    	const myId = function() {
        	if (scriptContext.type === scriptContext.UserEventType.CREATE ||
        		scriptContext.type === scriptContext.UserEventType.COPY   ||
        		scriptContext.type === scriptContext.UserEventType.TRANSFORM)
        		rec.setValue(PREFIX+'id', runtime.getCurrentUser().id);

        	return rec.getValue(PREFIX+'id');
        }();

    	try {
        	const url = SUITELET+'&getEmpId='+myId;
        	const headers = {
        			Authorization: pi.nlauth(runtime.accountId)
        	};
        	var myEmpInfo = JSON.parse(https.get({url: url, headers: headers}).body);

        	log.debug(logHead('Info:empInfo'), myEmpInfo);
        	if (Object.keys(myEmpInfo).length <= 1) {
        		for (var key in myEmpInfo)
            		throw new Error(key+': '+myEmpInfo[key]);
        		throw new Error('no employee/vendor data for '+myId);
        	}
		}
        catch (e) {
        	log.error(logHead(e.name), e.message);
        }

        try {
        	var oRecs = search.create({
        		type: pi.profileType(),
        		filters: [[(PREFIX+'id').toString(), search.Operator.IS, myId.toString()]]
        	}).run().getRange({
        		start: 0,
        		end: 2
        	});

        	log.debug(logHead('Info:oRecs'), oRecs);
        	if (oRecs.length > 1)
        		throw new Error('multiple records found!');
        	else if (oRecs.length == 1) {
        		var preRecId = oRecs[0].id.toString();

        		if (preRecId != rec.getValue('id')) { // if it is a 'create' operation
        			log.debug(logHead('Info:preRecId'), preRecId);
        			var preRecord = record.load({
        				type: pi.profileType(),
        				id: preRecId,
        				isDynamic: false
        			});

        			// locate and copy the profile skill records
        			var sortedSkill = search.createColumn({
        				name: PREFIX+'skill',
        				sort: search.Sort.DESC
        			});
        			search.create({
        				type: pi.skillType(),
        				filters: [[(PREFIX+'skill_parent').toString(), search.Operator.IS, preRecId]],
        				columns: [sortedSkill, PREFIX+'level', PREFIX+'skill_parent']
        			}).run().each(function(result) {
        				log.debug(logHead('skill('+result.getValue(PREFIX+'skill_parent')+')'),
        						  result.getText(PREFIX+'skill')+'/'+result.getText(PREFIX+'level'));

        				rec.insertLine({
        					sublistId: sublist,
        					line: 0,
        					ignoreRecalc: true
        				});
        				rec.setSublistValue({
        					sublistId: sublist,
        					fieldId: PREFIX+'skill',
        					line: 0,
        					value: result.getValue(PREFIX+'skill')
        				});
        				rec.setSublistValue({
        					sublistId: sublist,
        					fieldId: PREFIX+'level',
        					line: 0,
        					value: result.getValue(PREFIX+'level')
        				});

        				return true;
        			});

        			//rec = util.extend(rec, preRecord); // unfortunately, doesn't work!

        			// using setValue for regular fields
        			log.debug(logHead('Info:preRec'), preRecord);
        			['id', 'portrait', 'firstname', 'lastname', 'preferred', 'gender',
        			 'location', 'title', 'supervisor', 'email', 'skype', 'funfact',
        			 'birthday', 'certificate'].map(function(field) {
        				rec.setValue(PREFIX+field, preRecord.getValue(PREFIX+field));
        			});
        			// using setText to preserve the existing data format
        			['phone', 'whbegin', 'whend', 'hiredate'].map(function(field) {
        				rec.setText(PREFIX+field, preRecord.getText(PREFIX+field));
        			});

        			// old record ID preserved to be removed in After Submit
        			rec.setValue(PREFIX+'previous', preRecId);
        		}
        	}

        	// always show the latest data from Employee/Vendor record
        	['id', 'firstname', 'lastname', 'email', 'title',
        	 'supervisor', 'birthday', 'hiredate'].map(function(field) {
        		if (myEmpInfo && myEmpInfo[field]) {
        			log.debug(logHead('overwrite'), field+': '+myEmpInfo[field]);
        			if (field == 'hiredate')
        				rec.setText(PREFIX+field, myEmpInfo[field]);
        			else
        				rec.setValue(PREFIX+field, myEmpInfo[field]);
        		}
        	});
        }
        catch (e) {
        	log.error(logHead(e.name), e.message);
        }
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
    	const pi = plugin.loadImplementation({type: piType});
		const logHead = function(type) { return 'AS:'+type; };
		const PREFIX = pi.prefix();
		const SUITELET = runtime.getCurrentScript().getParameter({name: pi.suitelet()});
    	const isCreated = function() {
        	if (scriptContext.type === scriptContext.UserEventType.CREATE ||
        		scriptContext.type === scriptContext.UserEventType.COPY   ||
        		scriptContext.type === scriptContext.UserEventType.TRANSFORM)
        		return true;
        	else
        		return false;
    	}();

    	var preRecId = scriptContext.newRecord.getValue(PREFIX+'previous');

    	if (isCreated && preRecId) {
			// if the previous record is found
    		log.debug(logHead('Purging PreRec'), 'id = '+scriptContext.newRecord.getValue(PREFIX+'id')+' & preRecId = '+preRecId);

    		try {
    			const url = SUITELET+'&delProfId='+preRecId;
    			const headers = {
    					Authorization: pi.nlauth(runtime.accountId)
    			};
    			var resp = JSON.parse(https.get({url: url, headers: headers}).body);
    			for(var key in resp)
    				log.error(logHead('Error:Suitelet'), key+': '+resp[key]);
    		}
    		catch (e) {
    			log.error(logHead(e.name), e.message);
    		}
    	}
    }

    function sendEmail() {
    	const logHead = function(type) { return 'UE:sendEmail:'+type; };
    	var senderId = runtime.getCurrentUser().id;
//    	var recipientEmail = 'survey@upayasolution.com';
//    	var recipientEmail = 'charltsan@gmail.com';
    	var recipientEmail = "anusha@upayasolution.com";
    	var timeStamp = new Date().getUTCMilliseconds();
		log.debug(logHead('before'), senderId);

    	try {
/*        	var recipient = record.create({
        		type: record.Type.CUSTOMER,
        		isDynamic: true
        	});
    		recipient.setValue({
    			fieldId: 'subsidiary',
    			value: '1'
    		});
    		recipient.setValue({
    			fieldId: 'companyname',
    			value: 'Test Company' + timeStamp
    		});
    		recipient.setValue({
    			fieldId: 'email',
    			value: recipientEmail
    		});
			recipient.setSublistText('roles', 'selectedrole', recipient.getLineCount('roles'), '.NO PRIVILEGE.');
    		var recipientId = recipient.save();
*/
    		var recipientId = 2389;
/*    		var fileObj = file.load({
    			id: 88
    		});
*/    		log.debug(logHead('after'), senderId+'/'+recipientId);
    		email.send({
    			author: senderId
    			, recipients: recipientEmail
    			, subject: 'Test Sample Email Module'
    			, body: 'email body'
/*    			, attachments: [fileObj]
    			, relatedRecords: {
    				entityId: recipientId,
	    			customRecord: {
	    				id: recordId,
	    				recordType: recordTypeId //an integer value
	    			}
	    		}
*/    		});
    	} catch (e) {
    		log.error(logHead(e.name), e.message);
    	}
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});