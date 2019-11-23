function collectUserList () {
	let userList = [];
	
	qsa('#message-list > li').forEach((i) => {
		userList[i.dataset.username] = i.dataset.userId;
	});
	
	return userList;
}

function setKleymo (nickname) {
	qsa(`#message-list li[data-username="${nickname}"]`).forEach((i) => {
		qs('a.username', i).append(dom(`<span class="ignoreYou">(игнорирует вас)</span>`));
	});
}

function checkUser (cp) {
	requestHandler.ajaxRequest('/api/user/makeWallPost', {
        uid: cp.id,
        content: 'a'.repeat(501),
        replyTo: null
    }, function(response) {
        console.log(response.status);
		switch (response.status) {
            case "length":
				return '0';
			break;
            case "ignoredByUser":
				setKleymo(cp.name);
				console.log(cp.name);
			break;
            default:
				return '-1'
			break;
        }
    });
}

function checkIgnoreOnPage () {
	let list = collectUserList();
	
	for (name in list) {
		checkUser({id: list[name], name: name});
	}
}