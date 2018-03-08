/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/plugin', 'N/search'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {plugin} plugin
 * @param {search} search
 */
function(record, runtime, plugin, search) {
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
		const logHead = function(type) { return 'SUI:BE:'+type; };
		var resp = {};

    	try {
    		if (typeof context.request.parameters.getEmpId !== 'undefined') {
    			var myId = context.request.parameters.getEmpId;
    			var pInfo = null;

    			if (!myId)
    				throw new Error('getEmpId value missing!');
    			else
    				log.debug(logHead('Info:getEmpId'), myId);

				pInfo = search.lookupFields({
					type: search.Type.EMPLOYEE,
					id: myId,
					columns: ['firstname', 'lastname', 'title', 'supervisor',
							  'email', 'birthdate', 'hiredate', 'hiredate']
				});

    			if (Object.keys(pInfo).length != 0) {
    				var bdate = pInfo['birthdate'];
        			resp = { id:		 myId,
        					firstname:	 pInfo['firstname'],
        					lastname:	 pInfo['lastname'],
        					title:		 pInfo['title'],
        					supervisor:	 pInfo['supervisor']['text'],
        					email:		 pInfo['email'],
        					birthday:	 bdate.substring(0,bdate.lastIndexOf('/')),
        					hiredate:	 pInfo['hiredate'] };
    			} else {
    				pInfo = search.lookupFields({
    					type: search.Type.VENDOR,
    					id: myId,
    					columns: ['firstname', 'lastname', 'email']
    				});

    				if (Object.keys(pInfo).length != 0)
    					resp = { id:		 myId,
    							 firstname:	 pInfo['firstname'],
    							 lastname:	 pInfo['lastname'],
    							 email:		 pInfo['email'] };
    				else
    					throw new Error('Employee/Vendor info of "'+myId+'" is not available!');
    			}

				log.debug(logHead('Info:pInfo'), pInfo);
    		}
    		else if (typeof context.request.parameters.delProfId !== 'undefined') {
    			const PREFIX = pi.prefix();
    			var delId = context.request.parameters.delProfId;

    			if (!delId)
    				throw new Error('delProfId value missing!');
    			else
    				log.debug(logHead('Info:delProfId'), delId);

    			search.create({
    				type: pi.skillType(),
    				filters: [[(PREFIX+'skill_parent').toString(), search.Operator.IS, delId]]
    			}).run().each(function(result) {
    				log.debug(logHead('Info:delSkillId'), result.id);
        			record.delete({
        				type: pi.skillType(),
        				id: result.id
        			});
        			return true;
            	});

    			record.delete({
    				type: pi.profileType(),
    				id: delId
    			});
    		}
    		else {
    			throw new Error('missing or incorrect command!');
    		}
    	} catch (e) {
			log.error(logHead(e.name), e.message);
    		if (e.name != 'RCRD_DSNT_EXIST') { // ignore "doesn't-exist" error!
    			resp[e.name] = e.message;
    		}
    	}

		log.debug(logHead('Info:resp'), resp);
		context.response.write(JSON.stringify(resp));    		
    }

    return {
        onRequest: onRequest
    };
    
});