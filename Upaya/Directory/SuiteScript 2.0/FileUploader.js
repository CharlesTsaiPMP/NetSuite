/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/runtime', 'N/search', 'N/plugin'],
/**
 * @param {serverWidget} widget
 * @param {runtime} runtime
 * @param {search} search
 * @param {plugin} plugin
 */
function(widget, runtime, search, plugin) {
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
		const logHead = function(type) { return 'SUI:Upload:'+type; };

		log.debug(logHead('Info'), 'receive ' + context.request.method + ' request...');

		try {
			if (context.request.method === 'GET') {
				var form = widget.createForm({
					title: 'Upload File'
				});

				form.addField({
					id: 'file',
					type: widget.FieldType.FILE,
					label: 'Select File'
				}).isMandatory = true;

				form.addSubmitButton({
					label: 'Submit Button'
				});

				form.addResetButton({
					label: 'Reset Button'
				});

				context.response.writePage(form);
			}
			else
			{
				const pi = plugin.loadImplementation({type: piType});
				var folderId = pi.iFolderId();
				if (!folderId)
					throw Error('no target folder is found!');
				else
					log.debug(logHead('folderId'), folderId);

				var file = context.request.files.file;
				file.name = runtime.getCurrentUser().id + '-' + file.name;
				file.folder = folderId;
				file.save();

				var form = widget.createForm({
					title: 'Upload File Status'
				});
				form.addField({
					id: 'success',
					type: widget.FieldType.INLINEHTML,
					label: 'Success'
				}).defaultValue = '<b>'+file.name+'</b> uploaded successfully!';
				context.response.writePage(form);
			}
		} catch (e) {
			log.error(logHead(e.name), e.message);
		}
	}

	return {
		onRequest: onRequest
	};

});