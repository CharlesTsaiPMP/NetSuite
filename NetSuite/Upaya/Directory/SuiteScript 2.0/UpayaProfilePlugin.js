/**
 * @NApiVersion 2.x
 * @NScriptType plugintypeimpl
 */
define(['N/search'],
/**
 * @param {search} search
 */
function(search) {
	const ROLE_NAME = '.NO PRIVILEGE.';
	const SUITELET  = 'custscript_upy_profile_suitelet';
	const UNINSTL   = 'custscript_upy_profile_uninstall';
	const UP_TYPE   = 'customrecord_upy_profile';
	const PS_TYPE   = 'customrecord_upy_profile_skill';
	const PREFIX    = 'custrecord_upy_profile_';
	const EMAIL     = 'upyaprof@upaysolution.com';
	const PCD       = '4Internal0nly!';
	const P_FOLDER  = 'Documents and Files';
	const C_FOLDER  = 'Portrait';
	const logHead	= function(type) { return 'Plugin:'+type; };

	function getAuth(aId) {
		return 'NLAuth nlauth_account='+aId+',nlauth_email='+EMAIL+',nlauth_signature='+PCD;
	}

	function getFolderId() {
		try {
			var id;
			var found = false;
/*
			// unfortunately, this piece of code doesn't work as expected
			search.create({
				type: search.Type.FOLDER,
				filters: [['parent', search.Operator.IS, P_FOLDER], 'and',
						  ['name', search.Operator.IS, C_FOLDER]]
			}).run().each(function(result) {
				if (!found) {
					found = true;
					id = result.id;
				} else
					throw Error('multipe "'+C_FOLDER+'" folders are found!');
				return true;
			});
*/
			search.create({
				type: search.Type.FOLDER,
				filters: [['name', search.Operator.IS, C_FOLDER]],
				columns: ['parent']
			}).run().each(function(result) {
				if (result.getText('parent') == P_FOLDER)
					if (!found) {
						found = true;
						id = result.id;
					} else
						throw Error('multipe "'+C_FOLDER+'" folders are found!');
				return true;
			});
		} catch (e) {
			log.error(logHead(e.name), e.message);
		}

		log.debug(logHead('Info:id'), id);
		return id;
	}

	function Reflector(obj) {
		/* Following is the sample code for using this "reflector"-like function/class
		 * 
		 *   const pi = plugin.loadImplementation({type: 'customscript_upy_pi_profile'});
		 *   var reflex = new pi.Reflector(context.request);
		 *   log.debug('Info:request:methods', reflex.getMethods());
		 *   log.debug('Info:requeset:myMethods', reflex.getOwnMethods());
		 *   log.debug('Info:requeset:properties', reflex.getProperties());
		 */

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
		
		return this;
	}

	return {
		/* properties */
		profileType: function() { return UP_TYPE; },
		skillType:	 function() { return PS_TYPE; },
		roleName:	 function() { return ROLE_NAME; },
		suitelet:	 function() { return SUITELET; },
		uninstall:	 function() { return UNINSTL; },
		prefix:		 function() { return PREFIX; },
		pFolder:	 function() { return P_FOLDER; },
		iFolder:	 function() { return C_FOLDER; },
		iFolderId:	 getFolderId,

		/* methods */
		Reflector:   Reflector,
		ep:			 function(index) {
			 if (index == 1)
				 return EMAIL;
			 else if (index == 2)
				 return PCD;
			 else
				 return null;
		},
		nlauth:		 getAuth
    };
});
