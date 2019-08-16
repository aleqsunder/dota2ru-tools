const reserve =
{
	massive:
	[
		'a-dota2smile',
		'chat-avatar',
		'cath', 'chatTurn',
		'first', 'page'
	],
	
	get: function (a)
	{
		return localStorage.getItem(a);
	},
	
	set: function (a, b)
	{
		return localStorage.setItem(a, b);
	},
	
	remove: function (a)
	{
		localStorage.removeItem(a);
	},
	
	save: function (a)
	{
		if (a != true)
		{
			if (get('reserve-first', true))
			{
				openAlert
				({
					wait: true,
					titleOf: 'Резервная копия',
					text: 
						`Осторожно!<br>
						В вашем браузере обнаружена старая резервная копия!<br>
						Дата записи: ${this.get('reserve-time')}<br><br>
						Вы действительно хотите перезаписать резервную копию?`,
					button: 
					[{
						callback: `reserve.save(true)`,
						value: "Сохранить"
					}]
				});
			}
			else
			{
				reserve.save(true);
			}
		}
		else
		{
			this.massive.forEach
			( function (a) {
				set(`reserve-${a}`, reserve.get(a), true);
			});
			
			var d = new Date(),
				month = d.getMonth() < 10 ? `0` : ``,
				minutes = d.getMinutes() < 10 ? `0` : ``;
			
			set('reserve-time', `${d.getDate()}.${month}${d.getMonth()}.${d.getFullYear()} в ${d.getHours()}:${minutes}${d.getMinutes()}`, true);
			
			openAlert
			({
				titleOf: 'Резервная копия',
				text: `Сохранено!`
			});
			
			reload();
		}
	},
	
	returnTo: function (a)
	{
		if (a != true)
		{
			if (!get('reserve-first', true))
			{
				openAlert
				({
					titleOf: 'Резервная копия',
					text: 'Резервная копия не обнаружена! Для начала сохраните Вашу копию'
				});
				
				return false;
			}
			else
			{
				openAlert
				({
					wait: true,
					titleOf: 'Резервная копия',
					text: 
						`Вы действительно хотите заменить текущую сессию резервной копией?<br>
						Дата записи: ${this.get('reserve-time')}<br><br>
						Вы действительно хотите восстановиться до данной контрольной точки?`,
					button: 
					[{
						callback: `reserve.returnTo(true)`,
						value: "Заменить"
					}]
				});
			}
		}
		else
		{
			this.massive.forEach
			( function (a) {
				set(a, reserve.get(`reserve-${a}`), true);
			});
			
			if (has('a-dota2smile', true))
			{
				set('a-dota2smile', '{}', true);
				set('reserve-a-dota2smile', '{}', true);
			}
			
			openAlert
			({
				titleOf: 'Резервная копия',
				text: 'Данные восстановлены!'
			});
			
			reload();
		}
	},
	
	toDefault: function (a)
	{
		if (a != true)
		{
			openAlert
			({
				wait: true,
				titleOf: 'Восстановление изначальных настроек',
				text: 
					`Вы действительно хотите ВЕРНУТЬСЯ к НАЧАЛЬНЫМ настройкам? Это приведёт так же к удалению резервной копии`,
				button: 
				[{
					callback: `reserve.toDefault(true)`,
					value: "Я подтвержаю: хочу вернуться к НАЧАЛЬНЫМ настройкам"
				}]
			});
		}
		else
		{
			this.massive.forEach
			( function (a) {
				remove(a, true);
				remove(`reserve-${a}`, true);
			});
			
			remove('reserve-time', true);
			
			openAlert
			({
				titleOf: 'Восстановление изначальных настроек',
				text: 'Вы были возвращены к изначальным настройкам. Обновите страницу!'
			});
			
			reload();
		}
	}
}