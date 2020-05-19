/*----*/
var envio_gratis = 799,
	currency_symbol = '$',
	img_size = '-55-55/',
	decimal='.',
	separator=',',
	show_free_shipping_thermometer = false;

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

const addProductToCart = function( event ){
	event.preventDefault();
	if($(this).attr('href').indexOf('sku=') > 0){
		var pindex=$(this).attr('productindex');
		newQty = $(".buy-in-page-quantity[productindex='"+pindex+"']").val();
		newHref = updateQueryStringParameter($(this).attr("href"), "qty", newQty);
		skuId=newHref.replace('/checkout/cart/add?sku=','');
		skuId = skuId.substring(0, skuId.indexOf("&"));

		var options = {
			url: newHref,
			type: "get",
			success: function (data) {
				vtexjs.checkout.getOrderForm().done(function(orderForm){
					crearCarritoLightBox(orderForm, skuId);
				});
			}
		}
		jQuery.ajax(options);
	}else{
		alert('Por favor, selecciona el tamaño deseado.');
	}
	return false;
};

const addProductToCartList = function(event, id){
		event.preventDefault();
		skuId = $(this).attr('data-skuid');
		qty = 1;

		vtexjs.checkout.getOrderForm().done(function(orderForm){
			console.log(orderForm);
			update_sku=0;
			var index=-1;
			$.each(orderForm.items, function(i,v){
				if(orderForm.items[i].id==skuId){
					update_sku=1;
					index = i;
					oldqty= orderForm.items[i].quantity;
					return false;
				}
			});
			if(update_sku==0){
				var item = {
					id: skuId,
					quantity: qty,
					seller: 1
				};
				var items = new Array();
				items.push(item);

				vtexjs.checkout.addToCart(items).done(function(orderForm){
					if(typeof fbq === 'function'){
						fbq('track', 'AddToCart');
					}
					//Enhaced Ecommerce
					$.each(orderForm.items, function(i,item){
						if(skuId==item.id){
						  var catid=item.productCategoryIds.split('/');
						  var catpos=catid.length-2;
						  catid=catid[catpos];
						  var cat=item.productCategories[catid];
						  var variant=item.name;
						  var dt_item=[{
							'name': item.name,
							'id': ''+item.id,
							'price': ''+(item.sellingPrice/100),
							'brand': item.additionalInfo.brandName,
							'category': cat,
							'variant': variant,
							'quantity': qty
						  }];
						  console.log(dt_item);
						  if(typeof dt_addToCart !== 'undefined'){
							dt_addToCart(dt_item);
						  }
						  return false;
						}
				  });
					//Enhaced Ecommerce
					crearCarritoLightBox(orderForm, skuId);
				});
				console.log('New item: '+skuId+', Quantity: '+qty);
			}
			else{
				var item={};
				item.index = index;
				item.quantity = oldqty+qty;
				item.seller = 1;

				vtexjs.checkout.updateItems([item], null, false).done(function(orderForm){
					// addToCartLayer();
					crearCarritoLightBox(orderForm, skuId);
				});
				console.log('Old item: '+skuId+', Old quantity: '+oldqty+', New quantity: '+qty);
			}
		});
	// }
	return false;
};

const addProductToCartModal = function( event ){
	event.preventDefault();
	$('#productSingleModal .button-wrapper .error').remove();
	if($('#productSingleModal .product-size.availabletrue.active').length || $('#productSingleModal .product-size.no-variations').length || $('#productSingleModal h3.qv-name').has('data-sku')){
		qty = 1;
		if($('#productSingleModal .product-size.no-variations').length){
			if($('#productSingleModal .product-size.availabletrue')){
				skuId = $('#productSingleModal .product-size.availabletrue').attr('data-id');
			}else{
				$('#productSingleModal .button-wrapper').prepend('<div class="error not-available">Producto no disponible</div>');
				$('#productSingleModal .button-wrapper .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
				return false;
			}
		}
		else if($('#productSingleModal h3.qv-name').has('data-sku')){ // New
			skuId = $('#productSingleModal h3.qv-name').attr('data-sku');
			console.log(skuId);
		}
		else{
			skuId = $('#productSingleModal .product-size.availabletrue.active').attr('data-id');
		}

		vtexjs.checkout.getOrderForm().done(function(orderForm){
			update_sku=0;
			var index=-1;
			$.each(orderForm.items, function(i,v){
				if(orderForm.items[i].id==skuId){
					update_sku=1;
					index = i;
					oldqty= orderForm.items[i].quantity;
					return false;
				}
			});
			if(update_sku==0){
				var item = {
					id: skuId,
					quantity: qty,
					seller: 1
				};
				var items = new Array();
				items.push(item);

				vtexjs.checkout.addToCart(items).done(function(orderForm){
					if(typeof fbq === 'function'){
						fbq('track', 'AddToCart');
						console.log('AddToCart');
					}
					//Enhaced Ecommerce
					$.each(orderForm.items, function(i,item){
						if(skuId==item.id){
							var catid=item.productCategoryIds.split('/');
							var catpos=catid.length-2;
							catid=catid[catpos];
							var cat=item.productCategories[catid];
							var variant=item.name;
							var dt_item=[{
								'name': item.name,
								'id': ''+item.id,
								'price': ''+(item.sellingPrice/100),
								'brand': item.additionalInfo.brandName,
								'category': cat,
								'variant': variant,
								'quantity': qty
							}];
							console.log(dt_item);
							if(typeof dt_addToCart !== 'undefined'){
								dt_addToCart(dt_item);
							}
							return false;
						}
					});
					//Enhaced Ecommerce
					crearCarritoLightBox(orderForm, skuId);
				});
			}else{
				var item = orderForm.items[index];
				item.index = index;
				item.quantity = oldqty+qty;
				item.seller = 1;
				vtexjs.checkout.updateItems([item], null, false).done(function(orderForm){
					// addToCartLayer();
					crearCarritoLightBox(orderForm, skuId);
				});
			}
		});
	}else if($('#productSingleModal .product-size.availablefalse.active').length){
		$('#productSingleModal .button-wrapper').prepend('<div class="error not-available">Producto no disponible</div>');
		$('#productSingleModal .button-wrapper .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
	}else{
		$('#productSingleModal .button-wrapper').prepend('<div class="error not-selected">Por favor, selecciona color y talla.</div>');
		$('#productSingleModal .button-wrapper .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
	}
	return false;
};

const goToCheckoutModal = function( event ){
	event.preventDefault();
	$('#productSingleModal .button-wrapper .error').remove();
	if($('#productSingleModal .product-size.availabletrue.active').length || $('#productSingleModal .product-size.no-variations').length || $('#productSingleModal h3.qv-name').has('data-sku')){
		if($('.size-wrapper.active .size.selected').length){
			if($('.size-wrapper.active .size.selected').not('.disabled').length){
				var skuId=$('.size-wrapper.active .size.selected').attr('data-sku');
			}else{
				$('#productSingleModal .button-wrapper').prepend('<div class="error not-available">Producto no disponible</div>');
				$('#productSingleModal .button-wrapper .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
				return false;
			}
		}else{
			$('#productSingleModal .button-wrapper').prepend('<div class="error not-selected">Por favor, selecciona la talla deseada.</div>');
			$('#productSingleModal .button-wrapper .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
			return false;
		}
		var newHref='/checkout/cart/add?sku='+skuId+'&qty=1&seller=1&redirect=true&sc=1';
		// addToCartLayer();
		window.location.href=newHref;
	}else if($('#productSingleModal .product-size.availablefalse.active').length){
		$('#productSingleModal .button-wrapper').prepend('<div class="error not-available">Producto no disponible</div>');
		$('#productSingleModal .button-wrapper .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
	}else{
		$('#productSingleModal .button-wrapper').prepend('<div class="error not-selected">Por favor, selecciona color y talla.</div>');
		$('#productSingleModal .button-wrapper .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
	}
	return false;
};

const addProductToCartProduct = function( event ){
	event.preventDefault();
	$('.product-detail__info .button-wrapper .avisame-wrapper').remove();
	$('.product-detail__info .error').remove();

	var that=$(this);
	if(that.attr('href').indexOf('sku=') > 0){
		var newHref	= that.attr("href"),
			skuId	=newHref.replace('/checkout/cart/add?sku=',''),
			skuId	= skuId.substring(0, skuId.indexOf("&")),
			qty		=$('.product-detail__quantity input').val();

		var options = {
			url: '/checkout/cart/add?sku='+skuId+'&qty='+qty+'&seller=1&redirect=false&sc=1',
			type: "get",
			success: function (data) {
				vtexjs.checkout.getOrderForm().done(function(orderForm){
					//Enhaced Ecommerce
					$.each(orderForm.items, function(i,item){
						if(skuId==item.id){
						  var catid=item.productCategoryIds.split('/');
						  var catpos=catid.length-2;
						  catid=catid[catpos];
						  var cat=item.productCategories[catid];
						  var variant=item.name;
						  var dt_item=[{
							'name': item.name,
							'id': ''+item.id,
							'price': ''+(item.sellingPrice/100),
							'brand': item.additionalInfo.brandName,
							'category': cat,
							'variant': variant,
							'quantity': qty
						  }];
						  console.log(dt_item);
						  if(typeof dt_addToCart !== 'undefined'){
							dt_addToCart(dt_item);
						  }
						  return false;
						}
					});
					//Enhaced Ecommerce
					var size=$('label.dimension-Talla.sku-picked').html();
					var color=$('.value-field.Color').html();
					if ("ga" in window) {
						var tracker = ga.getAll()[0];
						if (tracker){
							tracker.send('event', 'AddToCart', 'added PDP', 'AB Test', 1);
						}
					}
					crearCarritoLightBox(orderForm, skuId, size, color);
				});
			}
		}
		jQuery.ajax(options);
	}
	else if($('.product-detail__info .product-detail-sizes .item_unavailable.checked').length){
		load_error_avisame();
	}
	else{
		$('.product-detail__cta').after('<div class="error not-selected">Por favor, selecciona la talla.</div>');
		$('.product-detail__cta + .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100, function(){
			setTimeout(() => {
				$('.product-detail__cta + .error').slideUp();
			}, 2500);
		});
	}
	return false;
};

const goToCheckoutProduct = function( event ){
	event.preventDefault();
	$('.product-detail__info .error').remove();
	$('.product-detail__info .button-wrapper .avisame-wrapper').remove();
	console.log('Go to checkout PDP');

	var that=$(this);
	if(that.attr('href').indexOf('sku=') > 0){
		// var pindex=that.attr('productindex');
		var newHref = that.attr("href");
		var skuId=newHref.replace('/checkout/cart/add?sku=','');
		skuId = skuId.substring(0, skuId.indexOf("&"));
		var qty = $('.product-detail__quantity > input').val();
		var options = {
			url: '/checkout/cart/add?sku='+skuId+'&qty='+qty+'&seller=1&redirect=false&sc=1',
			type: "get",
			success: function (data) {
				vtexjs.checkout.getOrderForm().done(function(orderForm){
					//Enhaced Ecommerce
					$.each(orderForm.items, function(i,item){
						if(skuId==item.id){
							var catid=item.productCategoryIds.split('/');
							var catpos=catid.length-2;
							catid=catid[catpos];
							var cat=item.productCategories[catid];
							var variant=item.name;
							var dt_item=[{
								'name': item.name,
								'id': ''+item.id,
								'price': ''+(item.sellingPrice/100),
								'brand': item.additionalInfo.brandName,
								'category': cat,
								'variant': variant,
								'quantity': qty
							}];
							console.log(dt_item);
							if(typeof dt_addToCart !== 'undefined'){
								dt_addToCart(dt_item);
							}
							return false;
						}
					});
					if(typeof retailRocketAddToCart === 'function'){
						retailRocketAddToCart(skuId);
					}
					if ("ga" in window) {
						var tracker = ga.getAll()[0];
						if (tracker){
							tracker.send('event', 'AddToCart', 'added PDP', 'AB Test', 1);
						}
					}
					//Enhaced Ecommerce
					window.location.href='/checkout/#/cart';
				});
			}
		}
		jQuery.ajax(options);
		// window.location.href='/checkout/cart/add?sku='+skuId+'&qty='+qty+'&seller=1&redirect=true&sc=1';
		// addToCartLayer();
	}
	else if($('.product-detail__info .product-detail-sizes .item_unavailable.checked').length){
		load_error_avisame();
	}
	else{
		$('.product-detail__cta').prepend('<div class="error not-selected">Por favor, selecciona la talla.</div>');
		$('.product-detail__cta .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
	}
	return false;
};

const updateQueryStringParameter = function(uri, key, value) {
	var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
	var separator = uri.indexOf('?') !== -1 ? "&" : "?";
	if (uri.match(re)) {
		return uri.replace(re, '$1' + key + "=" + value + '$2');
	}
	else {
		return uri + separator + key + "=" + value;
	}
}

// Creal el lightbox con el elemento recien añadido.
const crearCarritoLightBox = function(jsonInfo, skuId, size, color){
	if(typeof size === 'undefined')
		size='';
	if(typeof color === 'undefined')
		color='';
	//console.log('skuid: ' + skuId);
	var cart_template = $('#cart-template').html();
	$('body').append(cart_template);

	var data = jsonInfo;
	var numItemsCart = data.items.length;
	var skuIdAgregado = null;
	for( var i = 0; i < numItemsCart && skuIdAgregado === null ; i++ ){
		if( data.items[i].id == skuId ){
			skuIdAgregado = data.items[i];
		}
	}
	if(skuIdAgregado === null){
		skuIdAgregado = skuIdAgregado;
	}
	var urlImg = skuIdAgregado.imageUrl;
	urlImg = urlImg.replace(img_size, '-300-300/');

	var precioEleAg = (skuIdAgregado.sellingPrice).toString();
	//console.log(precioEleAg);
	precioEleAg = precioEleAg.slice( 0, (precioEleAg.length)-2 );
	precioEleAg = ponerPuntosDecimales(precioEleAg);

	var totalItems = 0;
	var totalShipping = 0;
	var totalDiscount = 0;
	$.each(data.totalizers, function(i,t){
		if(t.id == 'Items')
			totalItems=t.value/100;
		if(t.id == 'Shipping')
			totalShipping=t.value/100;
		if(t.id == 'Discounts')
			totalDiscount=-1*(t.value/100);
	});


	var valorCart = data.value/100;

	if(show_free_shipping_thermometer){
		faltante=envio_gratis;
		if(valorTotalCarrito<envio_gratis){
			faltante=envio_gratis-valorTotalCarrito;
			percent=+(Math.round(((valorTotalCarrito*100)/envio_gratis) + "e+2")  + "e-2");
			var envio_gratis_wrapper = ''+
			'<div class="title-envio">Faltan <strong>'+currency_symbol+faltante+'.<sup>00</sup></strong> para que tu envío sea gratuito.</div>'+
			'<div class="envio-gratis"><div class="percent" style="width:'+percent+'%;">'+percent+'%</div></div>';
		}else{
			var envio_gratis_wrapper = ''+
			'<div class="title-envio">¡Felicidades ya tienes envío gratis!</div>'+
			'<div class="envio-gratis full"><div class="percent" style="width:100%;">100%</div></div>';
		}
	}

	$('#lb-product-image').attr('src',urlImg);
	$('#lb-product-name').html(skuIdAgregado.name);
	$('#lb-product-price').html(currency_symbol+precioEleAg);
	$('#lb-product-qty').html(skuIdAgregado.quantity);
	$('#lb-cart-products').html(numItemsCart);
	$('#atc-ti').html(currency_symbol+totalItems.formatMoney(2, decimal, separator));
	$('.atc__cart-summary_item.discount').hide();
	if(totalDiscount!=0){
		$('.atc__cart-summary_item.discount').show();
		$('#atc-td').html(currency_symbol+totalDiscount.formatMoney(2, decimal, separator));
	}

	if(color!=''){
		$('#lb-product-color').html(color);
		$('.atc__added_info.color').show();
	}else{
		$('.atc__added_info.color').hide();
	}
	if(size!=''){
		$('#lb-product-size').html(size);
		$('.atc__added_info.size').show();
	}else{
		$('.atc__added_info.size').hide();
	}
	if(totalShipping!=0){
		$('#atc-ts').html(currency_symbol+totalShipping.formatMoney(2, decimal, separator));
		$('.atc__cart-summary_item.shipping').show();
	}else{
		$('.atc__cart-summary_item.shipping').hide();
	}
	$('#lb-total').html(' '+currency_symbol+valorCart.formatMoney(2, decimal, separator));
	if(show_free_shipping_thermometer){
		$('#envio_gratis_wrapper').html(envio_gratis_wrapper);
	}
	$('.atc__wrapper').fadeIn(500);

	$('.close-modal--atc,.atc__wrapper').click(function(){
		$('.atc__wrapper').fadeOut(500, function(){
			$('.atc__wrapper').remove();
			$('body').css({
				'overflow': 'auto'
			});
		});
	});
	$('.atc__container').click(function (evt) {
		evt.stopPropagation();
	});

	$('.seguirComprando').click(function(){
		console.log('cerrar');
		$('.atc__wrapper').fadeOut(500, function(){
			$('.atc__wrapper').remove();
			$('body').css({
				'overflow': 'auto'
			});
		});
	});

	$('.irAlCheckout').click(function(){
		window.location.replace("/checkout/#cart");
		$('body').css({
			'overflow': 'auto'
		});
	});

	if(typeof retailRocketAddToCart === 'function'){
		retailRocketAddToCart(skuId);
	}

	update_minicart();
}

//Insertar caracteres dentro de string
String.prototype.insert = function (index, string) {
	if (index > 0)
		return this.substring(0, index) + string + this.substring(index, this.length);
	else
		return string + this;
};

//Buscar la ubicación del punto y agregarlo
const ponerPuntosDecimales = function(string){
	var numeroPuntos = parseInt((string.length)/3);
	var posPunto = (string.length)-3;
	if(posPunto > 0)
		string = string.insert(posPunto, ',');
	return string;
};

function load_error_avisame(){
	$.get('/no-cache/profileSystem/getProfile',function(data,s,x){
		if(x.status==200){
			if(data.IsUserDefined){
				var email=data.Email;
			}else{
				var email='';
			}
			$('.product-detail__info .button-wrapper').prepend(''+
				'<div class="avisame-wrapper">'+
				'<div class="error not-available">Producto no disponible</div>'+
							//'<p class="msj-avisame">Avisame cuando esté disponible</p>'+
							//'<div class="email-avisame"><input type="email" id="email-avisame" value="'+email+'" required placeholder="Email"></div>'+
							//'<div class="btn-avisame button-lineal secundario">Avisame</div>'+
							'</div>');
			$('.product-detail__info .button-wrapper .error').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
		}else{
			load_error_avisame();
		}
	});
}

$(function(){
	// Add to cart from Product list
	/*$('.js-buy-plp').each(function(){
		$(this).off('click').on('click', addProductToCartList);
	});*/
	// Add to cart from Product detail
	$('a.buy-in-page-button').each(function(){
		$(this).off('click').on('click', addProductToCartProduct);
	});
	// Comprar detalle del producto
	$('.BuyButton-wrapper a.buy-button').each(function(){
		$(this).off('click').on('click', goToCheckoutProduct);
	});
	// Add from modal
	$('#productSingleModal .button-wrapper a').each(function(){
		if($(this).hasClass('buy-product')){
			$(this).off('click').on('click', goToCheckoutModal);
		}else{
			$(this).off('click').on('click', addProductToCartModal);
		}
	});
});