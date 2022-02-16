async function load(){  
  const search = "Computador";
  const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=`;
  const resultJson = await apiAccess(urlAPI, search);
  insertItems(resultJson);
  verifyLocalStorage();
} 

async function apiAccess(urlAPI, search){
  await createLoad("");
  const result = await fetch(`${urlAPI}${search}`);
  const resultJson =  await result.json();
  await removeLoad("none");
  return resultJson;
}

function createLoad() {
  let divLoad = document.createElement('div');
  divLoad.className = 'loading';
  divLoad.innerHTML = 'loading...';
  document.body.appendChild(divLoad);
}

function removeLoad(){
  let divLoad = document.getElementsByClassName('loading');
  divLoad[0].remove();
}

async function insertItems(resultJson) {  
  let items = document.querySelector('.items');
  for (let index = 0; index < resultJson.results.length; index++) {
    const sku = resultJson.results[index].id;
    const name = resultJson.results[index].title;
    const image = resultJson.results[index].thumbnail;
    let sectionNew = (createProductItemElement({ sku, name, image }));
    items.appendChild(sectionNew);
  }
}

function verifyLocalStorage() {
  if(localStorage.getItem('products')!=null){
    let lsProducts = JSON.parse(localStorage.getItem('products'));
    for (let index = 0; index < lsProducts.length; index++){
      let sku = lsProducts[index].sku;
      let name = lsProducts[index].name;
      let salePrice = lsProducts[index].salePrice;
      let item = document.querySelector('ol');
      let newItem = createCartItemElement({ sku, name, salePrice });
      item.appendChild(newItem);  
    }
  }
  sumPrice();
}

function sumPrice(){
  let totalPrice = 0;
  if(localStorage.getItem('products')!=null){
    let lsProducts = JSON.parse(localStorage.getItem('products'));
    for (let index = 0; index < lsProducts.length; index++){
      let salePrice = lsProducts[index].salePrice;
      totalPrice += salePrice;
    }
  }
  refreshPrice(totalPrice);
}
 
function refreshPrice(price) {
  let tag = document.querySelector('.total-price');
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

async function removeAllItems(){
  if(localStorage.getItem('products')!=null){
    await removeAllItensCart()
    localStorage.removeItem('products');
    verifyLocalStorage();
  }
}

function removeAllItensCart(){
  const elements = document.getElementsByClassName("cart__item");
  while (elements.length > 0) elements[0].remove();
}

async function addProductItem(search){
  const urlAPI = "https://api.mercadolibre.com/items/";
  const resultJson = await apiAccess(urlAPI, search);
  const sku = resultJson.id;
  const name = resultJson.title;
  const salePrice = resultJson.price;
  let item = document.querySelector('ol');
  let newItem = createCartItemElement({ sku, name, salePrice });
  item.appendChild(newItem);
  localStorageManage({ sku, name, salePrice });
}

function localStorageManage({ sku, name, salePrice }) {
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

async function cartItemClickListener(event) {
  const product = event.srcElement.innerText;
  let sku = product.split(" ",2)[1];
  if(localStorage.getItem('products')!=null){
    let lsProducts = JSON.parse(localStorage.getItem('products'));
    for (let index = 0; index < lsProducts.length; index++){
      if(lsProducts[index].sku === sku){
        lsProducts.splice(index,1);
      }
    }
    localStorage.setItem('products', JSON.stringify(lsProducts));
    await removeAllItensCart()
    verifyLocalStorage();
  }
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

window.onload = () => { load() };
