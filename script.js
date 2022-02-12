var OP = {
  ADD: 1,
  LESS: 2
}


async function load(){
  
  const search = "Computador";
  const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=`;

  const resultJson = await apiAccess(urlAPI, search);

  insertItems(resultJson);
  verifyLocalStorage();
} 

async function apiAccess(urlAPI, search){
  const result = await fetch(`${urlAPI}${search}`);
  return await result.json();
}
  
async function insertItems(resultJson) {
  
  var items = document.querySelector('.items');
  
  for (let index = 0; index < resultJson.results.length; index++) {

    const sku = resultJson.results[index].id;
    const name = resultJson.results[index].title;
    const image = resultJson.results[index].thumbnail;
    
    var sectionNew = (createProductItemElement({ sku, name, image }));

    items.appendChild(sectionNew);
  }
}

function verifyLocalStorage() {
  if(localStorage.getItem('products')!=null){
    let lsProducts = JSON.parse(localStorage.getItem('products'));
    for (let index = 0; index < lsProducts.length; index++){

      var sku = lsProducts[index].sku;
      var name = lsProducts[index].name;
      var salePrice = lsProducts[index].salePrice;

      var item = document.querySelector('ol');
      var newItem = createCartItemElement({ sku, name, salePrice });
      item.appendChild(newItem);  
    }
    sumPrice();
  }
}

function sumPrice(){
  if(localStorage.getItem('products')!=null){
    let lsProducts = JSON.parse(localStorage.getItem('products'));
    var totalPrice = 0;
    for (let index = 0; index < lsProducts.length; index++){
      var salePrice = lsProducts[index].salePrice;
      totalPrice += salePrice;
    }
    console.log("totalprice"+ totalPrice);
    refreshPrice(totalPrice);
  }
}
 
function refreshPrice(price) {
  var tag = document.querySelector('.total-price');
  tag.innerHTML=price;
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createCustomButtonElement(element, className, innerText, itemID) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  e.addEventListener("click",addProductItem.bind(null, itemID));
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomButtonElement('button', 'item__add', 'Adicionar ao carrinho!', sku));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

async function addProductItem(search){
  const op = OP.ADD;
  const urlAPI = "https://api.mercadolibre.com/items/";
  
  const resultJson = await apiAccess(urlAPI, search);

  const sku = resultJson.id;
  const name = resultJson.title;
  const salePrice = resultJson.price;

  var item = document.querySelector('ol');
  var newItem = createCartItemElement({ sku, name, salePrice });
  item.appendChild(newItem);
  localStorageManage({ sku, name, salePrice }, op);
}

function localStorageManage({ sku, name, salePrice }, op) {

  let lsProducts = JSON.parse(localStorage.getItem('products')) || [];

  const product = {
    'sku': sku,
    'name': name,
    'salePrice': salePrice
  }

  lsProducts.push(product);
  localStorage.setItem('products', JSON.stringify(lsProducts));
  sumPrice();
}

function cartItemClickListener(event) {

  const op = OP.LESS;
  const product = event.srcElement.innerText;
  var salePrice = Number(product.split("$",2)[1]);
}

function createCartItemElement({ sku, name, salePrice }) {
  //console.log(sku+"-createCartItemElement");
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

window.onload = () => { load() };
