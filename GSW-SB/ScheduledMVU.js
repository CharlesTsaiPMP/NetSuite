/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

/* HOW TO RUN THIS SUITESCRIPT
 * 
 * 1.  Change GSWACTID in this file to the account ID of the target site, e.g. GSW Prod
 * 2.  Check if the subsidiary IDs, allSubIds, are complete
 * 3.  Upload this file to the target site
 * 4.  On the target site:
 * 4.1 Create a Custom Entity Field (Customization->Lists, Records, & Fields->Entity Fields->New)
 *     a. Set Label to anything in your preference, e.g. 'ABC' or simply 'X'
 *     b. Set ID to '_unprocessed'
 *     c. Set Type to 'Check Box'
 *     d. In 'Applies To' subtab, tick 'VENDOR'
 *     e. Click 'Save & Apply to Forms'
 *     f. Apply the newly created custom entity field to all entry forms associated with VENDOR
 * 4.2 Create a scheduled script for the uploaded file (Customization->Scripting->Scripts->New)
 * 4.3 Deploy the scheduled script created in step 3.2 (Customization->Scripting->Script Deployments)
 *     a. Mark it 'Deployed'
 *     b. Set Status to 'Scheduled'
 *     c. Set Log Level to 'Debug' (you can refresh 'Execution Log' to monitor the status)
 *     d. Set Priority to 'High'
 *     e. Set Schedule to 'Daily Event', Start Date to today, Start Time to '6:00pm', and Repeat
 *        to 'Every 30 minutes'
 *     f. Save the scheduled script deployment
 *
 * ONCE THE SUITESCRIPT IS DONE
 * 
 * 1.  On the target site:
 * 1.1 Double check the vendor records are updated successfully
 * 1.2 If the file needs to be rerun, delete and recreate the custom entity field in step 4.1
 * 1.3 If the data is all correct, delete the custom entitye field created in step 4.1
 */

define(['N/record', 'N/runtime', 'N/search'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
		const logHead = function(type) { return 'SJ:MVU:'+type; };
    	const GSWACTID = 284589;
    	const ISGSW = function() { return runtime.accountId == GSWACTID; }();
    	const SUBLIST = 'submachine';
    	const REPSUBFLD = 'representingsubsidiary';
    	const SUBFLD = 'subsidiary';
    	const DONEFLD = 'custentity_processed';
    	const RECCNT = 25;
    	const allSubIds = function() {
			return ISGSW? [2,3,4,5,6,8,10,12,13,14,17,18,20,21,22,23,24,27]: // GSW
						  [1,3,4,5,6,8,9,10,11,12,15,16,17,18,20,21];		 // Upaya
		}();
    	const toContinue = function() {
			// for small-scale testing in GSW
			return /* ISGSW && procIds.length >= 50? false :*/ true;
    	};
    	var vendorId; // needed for the error handling which is out of the scope of result.id

		try {
			var counter = 0;
			var sysIds = [];
			var doneIds = [];
			var failIds = [];
			var procIds = [];
			var unprocIds = [];
			var failDetails = {};
			var procDetails = {};
			var unprocDetails = {};

			search.create({
				type: search.Type.VENDOR,
				columns: [search.createColumn({
					name: 'internalId',
					sort: search.Sort.ASC
				}), DONEFLD]
			}).run().each(function(result) {
				counter++;
				vendorId = Number(result.id);
				if (vendorId < 0) {
					sysIds.push(vendorId);
				} else if (result.getValue(DONEFLD)) {
					doneIds.push(vendorId);
				} else {
					var rec = record.load({
						type: record.Type.VENDOR,
						id: vendorId,
						isDynamic: false
					});

					if (rec.getValue(REPSUBFLD)) { // representing subsidiary is set
						unprocIds.push(vendorId);
						unprocDetails[vendorId] = Number(rec.getValue(REPSUBFLD));
					} else {					   // representing subsidiary is not set
						var subIds = [];
						var lineCount = rec.getLineCount({sublistId: SUBLIST});
						for (var i = 0; i < lineCount; i++) {
							var subId = rec.getSublistValue({
								sublistId: SUBLIST,
								fieldId: SUBFLD,
								line: i
							});
							subIds.push(subId);
						}

						var addSubIds = [];
						for (var i = 0; i < allSubIds.length; i++) {
							var found = false;
							for (var j = 0; j < subIds.length; j++)
								if (allSubIds[i] == subIds[j]) {
									found = true;
									break;
								}

							if (!found) {
								addSubIds.push(allSubIds[i]);

								if (ISGSW) {
									rec.insertLine({
										sublistId: SUBLIST,
										line: 0,
										ignoreRecalc: true
									});
									rec.setSublistValue({
										sublistId: SUBLIST,
										fieldId: SUBFLD,
										line: 0,
										value: allSubIds[i]
									});
								}
							}
						}

						try {
							rec.setValue(DONEFLD, true);
							rec.save();

							// update done successfully!
							procIds.push(vendorId);
							procDetails[vendorId] = addSubIds;
						} catch (e) {
							failIds.push(vendorId);
							failDetails[vendorId] = e.message;
				    		log.error(logHead(e.name+'('+vendorId+')'), e.message);
						}
					}
					if (counter % RECCNT == 0) {
						log.debug(logHead('counting...'), counter);
					}
				}

				return toContinue();
        	});
    	} catch (e) {
			failIds.push(vendorId);
			failDetails[vendorId] = e.message;
    		log.error(logHead(e.name), e.message);
		} finally {
			log.debug(logHead('total'), counter);
			log.debug(logHead('processed'), procIds.length);
			log.debug(logHead('unprocessed'), unprocIds.length);
			log.debug(logHead('fail'), failIds.length);
			log.debug(logHead('done'), doneIds.length);
			log.debug(logHead('system'), sysIds.length+': '+sysIds);
		}
    }

    return {
        execute: execute
    };
    
});