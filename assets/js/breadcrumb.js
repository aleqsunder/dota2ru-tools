var open_count = 0, left = 0,
    poule = dom(`<div class='openbc_poule'></div>`);

if (!has('breadcrumb-isCascade')) {
    log('breadcrumb > Установлены первоначальные настройки');
    
    set('breadcrumb-isCascade', 'true');
    set('breadcrumb-left', '160');
    set('breadcrumb-blackout', '0.5');
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(poule);
    document.body.style.setProperty('--blackout', get('breadcrumb-blackout'));
});

watching ({
	elem: 'blockquote.messageText div.attribution a[href]',
	bool: true,
	
	callback: (el) => {
        var elem = dom(`<a dialog class="fa fa-folder-o"></a>`)
		elem.addEventListener('click', {handleEvent: openbc, b: true});
        el.parentElement.appendChild(elem);
	}
});

function closebc () {
    open_count--;
	var post_id = this.getAttribute('data-post-id');
    
    if (open_count == 0)
        if (poule.classList.contains('displayed'))
            poule.classList.remove('displayed');
	
	this.outerHTML = '';
	qs(`.bc-loaded-post[data-post-id='${post_id}']`).outerHTML = '';
}

function openbc (e) {
	e.preventDefault();
	e.stopPropagation();
    open_count++;
    left = parseInt(get('breadcrumb-left'));
	
	var element = e.target,
		flag = this.b,
		x = 0;
    
    if (get('breadcrumb-isCascade') == 'true') {
        if (Math.floor(open_count / 5) & 1)
            x = (300 + left) - (60 * (open_count % 5));
        else
            x = left + (60 * (open_count % 5));
    } else {
        x = parseInt(get('breadcrumb-blackout'));
    }
		
    var y = e.pageY,
		p = element.parentElement.parentElement,
		post_id = p.getAttribute('data-post-id'),
		author = p.getAttribute('data-author'),
		set = qs(`.bc-loaded-post`),
		ob = dom(
			`<div class='bc-loaded-post' data-post-id='${post_id}' data-author='${author}' style='left: ${x}px; top: ${y}px;'>
				<usercode>Сообщение <a href='https://dota2.ru/forum/posts/${post_id}/'>${author}#${post_id} (ссылка на пост)</a></usercode>
				<postmessage data-post-id='${post_id}' data-author='${author}'>
					Загрузка...
				</postmessage>
			</div>`
		),
        bc_fone = dom(
            `<div class='bc-fone' 
                data-post-id='${post_id}' 
                onclick='closebc.call(this)'
                onmouseover="this.classList.remove('bc-fone-opacity')"
                onmouseout="this.classList.add('bc-fone-opacity')"></div>`
        );
		
	poule.appendChild(bc_fone);
	poule.appendChild(ob);
    
    if (!poule.classList.contains('displayed'))
        poule.classList.add('displayed');
    
    setTimeout(() => {
        bc_fone.classList.add('bc-fone-opacity');
        ob.classList.add('bc-loaded-post-opacity');
    });
    
	requestHandler.ajaxRequest("/api/forum/getPostCode", {pid: post_id, quotes: true, type: 'post'}, (response) => {
		switch (response.status) {
			case "success":
				data = Base64.decode(response.data);
				data = data.replace(
					/<p>\[QUOTE=\"(.*?), post: (.*?), member: (.*?)\"\]<\/p>(.*?)<p>\[\/QUOTE\]<\/p>/ig,
					"<loadpost data-post-id='$2' data-author='$1'><div class='bc-nickname'>$1<a onclick='openbc.call(this, event, true); return false;'> #$2</a></div><div class='bc-loadpost'>$4<div class='bottomborder'></div></div></loadpost>"
				)
				
				qs('postmessage', ob).innerHTML = data;
                ob.classList.add('max-height-auto');
				break;
			case "invalidPost":
				Utils.notify("Некорректный пост", "warning", 6e3);
				break;
			default:
				Utils.notify("Произошла неизвестная ошибка", "danger");
			}
	}, true);
}