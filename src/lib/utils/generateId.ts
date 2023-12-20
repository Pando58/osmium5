export function generateId(list: Map<number, unknown> | Set<number> | Record<number, unknown>) {
	if (list instanceof Map || list instanceof Set) {
		for (let i = 0; i < list.size; i++) {
			if (!list.has(i)) {
				return i;
			}
		}

		return list.size;
	}

	for (let i = 0; i < Object.keys(list).length; i++) {
		if (!(i in list)) {
			return i;
		}
	}

	return Object.keys(list).length;
}
