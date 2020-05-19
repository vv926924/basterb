var	use_ISOCurrencySymbol=1,
	ISOCurrencySymbol='MXN',
	currency_symbol='$',
	decimal='.',
	separator=',';

//number of decimals, decimal, separator
Number.prototype.formatMoney = function(c, d, t){
var n = this,
	c = isNaN(c = Math.abs(c)) ? 2 : c,
	d = d == undefined ? "." : d,
	t = t == undefined ? "," : t,
	s = n < 0 ? "-" : "",
	i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
	j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

$(function(){
	update_minicart();
	//set_max_height();
	//Remove from cart
	$('body').on('click', '#items-wrapper .remove ', function(e){
		e.preventDefault();
		var index=$(this).attr('data-index');
		vtexjs.checkout.getOrderForm().then(function(orderForm){
			var item = orderForm.items[index];
			item.index = index;
			return vtexjs.checkout.removeItems([item]);
		}).done(function(orderForm){
			update_minicart();
		});
	});

	//show minicart
	$('#minicart-container a').on('click',function(e){
		e.preventDefault();
		show_minicart();
	});
	//hide minicart
	$('.overlay, .close-minicart').on('click',function(e){
		e.preventDefault();
		hide_minicart();
	});

	//on resize
	/*$(window).on('resize', function(){
		set_max_height();
	});*/
});

function show_minicart(){
	$('body').addClass('overflow');
	$('.overlay--minicart, #minicart-wrapper').addClass('is-active');
	/*setTimeout(function(){
		set_max_height();
	},400)*/
}

function hide_minicart(){
	$('.overlay--minicart, #minicart-wrapper').removeClass('is-active');
	$('body').removeClass('overflow');
}

function set_max_height(){
	$('#items-wrapper').css('max-height','auto');
	var items_wrapper_height=$('#items-wrapper').height();
	var window_height=$(window).height()-80;
	if(items_wrapper_height>=window_height){
		$('#items-wrapper').addClass('overflow');
	}else{
		$('#items-wrapper').removeClass('overflow');
	}
	$('#items-wrapper').css('max-height',window_height);
}

function update_minicart(show=false){
	vtexjs.checkout.getOrderForm().done(function(orderForm){
		//console.log(orderForm);
		//if(orderForm.items.length){
			$('.minicart__subtotals,.minicart__shipping,.minicart__discount').hide();
			$('#items-wrapper').empty().show();
			var subtotal	= 0,
				total		= (orderForm.value/100).formatMoney(2, decimal, separator);

			$('#total-cart').html('$'+total+' MXN');
			$.each(orderForm.totalizers,function(i,t){
				if(t.value!=0){
					subtotal=currency_symbol+(t.value/100).formatMoney(2, decimal, separator);
					if(use_ISOCurrencySymbol)
					subtotal+=' '+ISOCurrencySymbol;
					if(t.id=='Items'){
						$('#minicartSubtotal').html(subtotal);
						$('.minicart__subtotals').show();
					}else if(t.id=='Shipping'){
						$('#minicartShipping').html(subtotal);
						$('.minicart__shipping').show();
					}else if(t.id=='Discounts'){
						$('#minicartDiscount').html(subtotal);
						$('.minicart__discount').show();
					}
				}
			});

			var total_items=0;
			$.each(orderForm.items, function(i,sku){
				total_items+=sku.quantity;
				var price=(sku.sellingPrice/100).toFixed(2).toString();
				if(price.length>6){
					var pos=price.length-6;
					price=[price.slice(0, pos), ',', price.slice(pos)].join('');
				}
				var img=sku.imageUrl.replace('-55-55','-100-100');
				$('#items-wrapper').append(''+
				'<div class="item-added" id="item'+i+'">'+
                    '<div class="item-added__img"><a href="'+sku.detailUrl+'"><img src="'+img+'" class="img-responsive"></a></div>'+
					'<div class="item-added__qty">'+sku.quantity+'</div>'+
					'<div class="item-added__summary">'+
						'<div class="item-added__name"><a href="'+sku.detailUrl+'">'+sku.name+'</a></div>'+
						'<div class="item-added__refid">'+sku.refId+'</div>'+
						'<div class="item-added__price">$'+price+'</div>'+
					'</div>'+
					'<div class="item-added__del"><div class="icon-close close-minicart remove" data-index="'+i+'"><svg class="icon svg-icon-trash" aria-hidden="true"><use xlink:href="#svg-icon-trash"></use></svg></div></div>'+
				'</div>');
			});
			$('#total-cart-items').html(total_items);
			if(show){
				show_minicart();
				setTimeout(function(){
					hide_minicart();
				},5000)
			}
		//}
	});
}