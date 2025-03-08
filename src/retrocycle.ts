type Registry = {
	[key: string]: { source: any, target: any }
}

export function retrocycle(obj: any) {
	let registry = getRegistry(obj);
	return Object.keys(registry).length > 0 ? getResolvedObject(obj, registry) : obj;
}

function isString(obj: any): obj is string { return typeof obj === 'string'; }
function isObject(obj: any) { return obj && typeof obj === 'object'; }

function getRegistry(obj: any, registry: Registry = {}): Registry {
	if (isObject(obj)) {
		// register source and target pair
		let id = obj.$id;
		if (isString(id)) {
			registry[id] = {
				source: obj,
				target: (Array.isArray(obj) || Array.isArray(obj.$values)) ? [] : {}
			};
		}
		// recursion
		if (Array.isArray(obj) || Array.isArray(obj.$values)) {
			// ... array or $values array
			let arr = Array.isArray(obj) ? obj : obj.$values;
			arr.forEach((value: any) => getRegistry(value, registry));
		}
		else {
			// ... object
			Object.entries<any>(obj)
				.filter(([key, _]) => key !== '$id')
				.forEach(([_, value]) => getRegistry(value, registry));
		}
	}
	return registry;
}

function getResolvedObject(obj: any, registry: Registry) {
	if (isObject(obj)) {
		if (Array.isArray(obj) || Array.isArray(obj.$values)) {
			// array or $values array
			let targetArr = obj.$id ? registry[obj.$id].target : [];
			let arr = Array.isArray(obj) ? obj : obj.$values;
			arr.forEach((value: any) => {
				let arrItem = value;
				if (isObject(arrItem)) {
					let id = arrItem.$ref;
					arrItem = isString(id) ? registry[id].target : getResolvedObject(value, registry);
				}
				targetArr.push(arrItem);
			});
			return targetArr;
		}
		else {
			// object
			let targetObj = obj.$id ? registry[obj.$id].target : {};
			Object.entries<any>(obj)
				.filter(([key, _]) => key !== '$id')
				.forEach(([key, value]) => {
					targetObj[key] = value;
					if (isObject(value)) {
						let id = value.$ref;
						targetObj[key] = isString(id) ? registry[id].target : getResolvedObject(value, registry);
					}
				});
			return targetObj;
		}
	}
	return obj;
}
