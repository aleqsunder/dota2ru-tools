watching
({
	elem: '.rank-tier',
	bool: true,
	
	callback: function (el)
	{
		var element = el.querySelector('img[title]').getAttribute('title'),
			rank = element.split(' ')[0],
			count = element.split(' ')[1];
			
		if (rank == 'Титан')
		{
			var inj = dom (`<div class='rank-num'>${count}</div>`);
			el.appendChild(inj);
		}
	}
});