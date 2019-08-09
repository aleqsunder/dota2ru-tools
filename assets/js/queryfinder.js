function __ (selector,context) {
	return $_(selector,context)[0] || null;
}

function $_ (selector,context) {
	context = context || document;

	if (!/^(#?[\w-]+|\.[\w-.]+)$/.test(selector)) {
		return Array.prototype.slice.call(context.querySelectorAll(selector));
	}

	switch (selector.charAt(0)) {
		case '#':
			return [context.getElementById(selector.substr(1))];
		case '.':
			return Array.prototype.slice.call(context.getElementsByClassName(
				selector.substr(1).replace(/\./g,' ')
			));
		default:
			return Array.prototype.slice.call(context.getElementsByTagName(selector));
	}
}