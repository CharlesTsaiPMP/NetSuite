/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/plugin', 'N/record', 'N/runtime', 'N/search'],
/**
 * @param {serverWidget} widget
 * @param {plugin} plugin
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(widget, plugin, record, runtime, search) {
	const piType = 'customscript_upy_pi_profile';
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	const pi = plugin.loadImplementation({type: piType});
    	const logHead = function(type) { return 'SUI:SU:'+type; };
		const UNINSTALL = runtime.getCurrentScript().getParameter({name: pi.uninstall()});
		var   status = '';

		if (UNINSTALL) {
			// locate and delete the special account for the calls from User Event to BE Suitelet
			try {
				search.create({
					type: record.Type.EMPLOYEE,
					filters: [['email', search.Operator.IS, pi.ep(1)], 'and',
							  ['firstname', search.Operator.IS, 'Upaya'], 'and',
							  ['lastname', search.Operator.IS, 'Profile']]
				}).run().each(function(result) {
					record.delete({
						type: record.Type.EMPLOYEE,
						id: result.id
					});
					status = status + 'Special account (<i>'+pi.ep(1)+'</i>:'+result.id+') deleted successfully!'
					return true;
				});
			} catch (e) {
				status = status + '<b>'+e.name+'</b>: '+e.message;
			}

			// locate and delete the folder in "Documents and Files" to store the portraits
			try {
				record.delete({
					type: record.Type.FOLDER,
					id: pi.iFolderId()
				});
				status = status + '<br>Special folder (<i>'+pi.iFolder()+'</i>) deleted successfully';
			} catch (e) {
				status = status + '<br><b>'+e.name+'</b>: '+e.message;
			}
		} else {
/*
			// Upaya role is now bundled, instead of being created during bundle installation
			try {
				var rec = record.create({
					type: 'role',
					isDynamic: false
				});
				rec.setValue('rolename', pi.roleName());
				rec.save();
			} catch (e) {
				log.error(logHead(e.name), e.message);
			}
*/
			// create the special account for the calls from User Event to BE Suitelet
			try {
				var rec = record.create({
					type: record.Type.EMPLOYEE,
					isDynamic: false
				});
				rec.setText('firstname', 'Upaya');
				rec.setText('lastname', 'Profile');
				rec.setText('email', pi.ep(1));
				rec.setText('giveaccess', 'T');
				rec.setSublistText('roles', 'selectedrole', rec.getLineCount('roles'), pi.roleName());
				rec.setValue('subsidiary', 1);
				rec.setText('password', pi.ep(2));
				rec.setText('password2', pi.ep(2));
				rec.save();
				status = status + 'Special account (<i>'+pi.ep(1)+'</i>) created successfully!';
			} catch (e) {
				status = status + '<b>'+e.name+'</b>: '+e.message;
			}

			// create the folder in "Documents and Files" to store the portraits
			try {
				var pFolderId = function() {
					var id;
					var found = false;

					search.create({
						type: search.Type.FOLDER,
						filters: [['name', search.Operator.IS, pi.pFolder()]]
					}).run().each(function(result) {
						if (result.id < 1000)
							if (!found) {
								found = true;
								id = result.id;
							} else
								throw Error('multipe parent folders are found!');
						return true;
					});

					return id;
				}();
				if (!pFolderId)
					throw Error('no parent folder is found!');
				else
					log.debug(logHead('Info:pFolderId'), pFolderId);

				var rec = record.create({
					type: record.Type.FOLDER,
					isDynamic: false
				});
				rec.setValue('name', pi.iFolder());
				rec.setValue('parent', pFolderId);
				rec.save();
				status = status + '<br>Special folder (<i>'+pi.iFolder()+'</i>) created successfully';
			} catch (e) {
				status = status + '<br><b>'+e.name+'</b>: '+e.message;
			}
		}

		// displaying the status messages on the browser
		var state = function(){
			return UNINSTALL? 'Uni' : 'I';
		}();
		var form = widget.createForm({
			title: state+'nstalling Setup'
		});
		form.addField({
			id: 'success',
			type: widget.FieldType.INLINEHTML,
			label: 'Success'
		}).defaultValue = status;
		context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
    
});
