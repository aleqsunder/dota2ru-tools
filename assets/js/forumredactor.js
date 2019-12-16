/**
 *	Дистрибьютор
 */
function dist () {
	var ob = this,
		type = dtod(ob, 'button'),
        middleContent = tinyMCE.activeEditor.selection.getContent({format : 'html'}),
		before = '', context = '', after = '';
		
	switch (type) {
		case 'code':
			tinyExec({
				before: `<div class="spoiler"><div class="spoiler-content"><p>`,
				context: middleContent,
				after: `</p></div></div>`
			});
			break;
            
		case 'font-background':
			if (ob.tagName == 'SPAN') {
                console.log(this);
				ob.style.setProperty('background', '#989899');
				ob.style.setProperty('color', '#1b1c20');
				console.log(ob);
                
				smce(ob, 'style', ob.style.cssText);
			} else {
				var fontSize = dtod(ob, 'font-size');
				
				tinyExec ({
					before: `<span style="background-color: #989899; color: #1b1c20;" data-mce-style="background-color: #989899; color: #1b1c20;">`,
					context: `&nbsp;${middleContent}&nbsp;`,
					after: `</span>`
				});
			}
			
			break;
	}
}

/**
 *	Получение data из namespace dota
 */
function dtod (element, a) { return element.getAttribute(`dota-${a}`) }

/**
 *	Установка в namespace dota
 */
function stod (element, a, b) { element.setAttribute(`dota-${a}`, b) }

/**
 *	Установка в namespace data mce
 */
function smce (element, a, b) { element.setAttribute(`data-mce-${a}`, b) }

/**
 *	Замена текста
 */
function tinyExec ({before, context, after}) {
	tinyMCE.activeEditor.execCommand('mceReplaceContent', false, `${before}${context}${after}`);
}

/**
 *	Изменение цвета
 */
function colorchanger () {
	var ob = this,
		color = ob.value,
		button = ob.parentElement.parentElement.querySelector('div[data-mce-color]'),
		width = 2 + parseInt(color.length <= 6 ? color.length : 6) * 8,
		style = (width <= 10) ? 50 : width;
		
	ob.value = ob.value.replace(/[^0-9a-f]+/ig, '').substring(0,6);
	ob.style.setProperty('width', `${style}px`);
		
	button.setAttribute('data-mce-color', `#${ob.value}`);
	button.setAttribute('style', `background-color: #${ob.value}`);
}

if (tinyMods.indexOf(mode) > -1) {
	watching ({
		elem: 'i.mce-ico.mce-i-bold',
		bool: true,
		
		callback: (el) => {
			tinyMCE.activeEditor.contentDocument.addEventListener("keydown", (e) => {
				var code = e.keyCode || e.which;
				
				if (code == '9') {
					e.preventDefault();
					
					var sel = tinyMCE.activeEditor.selection.getNode(),
						pdd = parseInt(sel.style.getPropertyValue('padding-left')),
						pom = event.shiftKey ? -1 : 1;
						
					if (!isNaN(pdd) && pdd != 0) {
						var result = (pdd + (pom * 30));
						
						if (result == 0) {
							sel.style.removeProperty('padding-left');
						} else {
							sel.style.setProperty('padding-left', result + 'px');
						}
					} else {
						if (!event.shiftKey) {
							sel.style.setProperty('padding-left', '30px');
						}
					}
				}
			});
		}
	});

	watching ({
		elem: 'div[dota-title]',
		bool: true,
		
		callback: (el) => {
			var el = el;
		
			el.addEventListener("mouseenter", function (event) {
				var ob = this,
					title = ob.getAttribute('dota-title'),
					mcet = document.querySelector('div.mce-tooltip'),
                    clientRect = el.getBoundingClientRect().top,
                    top = window.scrollY + clientRect + el.clientHeight;
					
				if (!mcet) {
					mcet = dom(
						`<div class="mce-widget mce-tooltip mce-tooltip-n" role="presentation" style="top: 4046px; z-index: 131070; display: none;">
							<div class="mce-tooltip-arrow"></div>
							<div class="mce-tooltip-inner"></div>
						</div>`
					);
					document.body.appendChild(mcet);
				}
					
				mcet.querySelector('.mce-tooltip-inner').innerText = title;
				mcet.style.setProperty('display', 'block');
				mcet.style.setProperty('left', ((parseInt(el.offsetLeft) + 204) - (parseInt(mcet.offsetWidth))/2 + (parseInt(el.offsetWidth)/2)) + "px");
                mcet.style.setProperty('top', `${top}px`)
			});
			
			el.addEventListener("mouseleave", (e) => {
				var mcet = document.querySelector('div.mce-tooltip');
				mcet.style.setProperty('display', 'none');
			});
		}
	});

	watching ({
		elem: 'table.mce-colorbutton-grid tbody',
		bool: true,
		
		callback: function (el) {
			// dom не видит элементы типа <tr>
			var doc = document.createElement('tr');
			doc.className = 'dota-color';
			doc.innerHTML = 
				`<td colspan="7">
					<input class="aq-color" onkeyup="colorchanger.call(this)" placeholder="000000">
					<before>#</before>
				</td>
				<td class="mce-grid-cell">
					<div data-mce-color="#000000" role="option" tabindex="-1" style="background-color: #000000" title="Кастомный цвет" aria-selected="true"></div>
				</td>`;
				
			el.insertBefore(doc, el.firstChild);
			el.parentElement.parentElement.style.setProperty('height', '124px');
		}
	});
}