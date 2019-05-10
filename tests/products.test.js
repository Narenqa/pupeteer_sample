// const expect =  require('expect-puppeteer');
const puppeteer = require('puppeteer');
// const {expect} = require('chai');
let page;
let browser;
const width = 1920;
const height = 1080;

const products = 'div.col-sm-6';
const product_compare = 'div[class="product "] div.view_details';
const product_image = 'div.product img';
const product_remove = 'div[class="product compare"] div.view_details';
const product_price = 'span.product_price';
const product_name = 'span.product_name';
const compare_price = 'tr.price';
const compare_colors = 'tr.colors';
const compare_condition = 'tr.condition';
const table = 'table.table';
const thead = 'thead.thead-default';


const expected_price_values = ['$39', '$319', '$239', '$79'];
const expected_condition_values = ['New', 'Used', 'Used', 'New'];
const expected_product_name = ['Chair', 'Lamp', 'Statue', 'Vase'];

// Method to perform Add Number of Products to compare
const compare_products = async (index, count, page) => {
  for (let i = index; i <= count; i++) {
    let compare_prod = await page.$(`${products}:nth-child(${i}) ${product_compare}`);
    await compare_prod.click();
  }
}

// Method to perform Remove sepcific product from comparision table
const remove_products = async (index, count, page) => {
  for (let i = index; i <= count; i++) {
    let remove_prod = await page.$(`${products}:nth-child(${i}) ${product_remove}`);
    await remove_prod.click();
  }
}

// Method to return the Actual Price of all products
const actual_product_price = async (page) => {
  let data = await page.$$eval(product_price, nodes => nodes.map(n => n.innerText));
  return data;
}

// Method to return the Actual Name of all products
const actual_product_name = async (page) => {
  let data = await page.$$eval(product_name, nodes => nodes.map(n => n.innerText));
  return data;
}

// Method to return the Prices of all products from the Compare table
const table_price = async (page) => {
  await page.waitForSelector(table);
  await page.waitForSelector(thead);
  let tr_price = await page.$(compare_price);
  let data = await tr_price.$$eval('td.text-center', nodes => nodes.map(n => n.innerText));
  return data;
}

// Method to return the Condition of the products from the Compare table
const table_condition = async (page) => {
  await page.waitForSelector(compare_colors);
  let feedHandle = await page.$(compare_condition);
  let tr_condition = await feedHandle.$$eval('td[class*="bg"]', nodes => nodes.map(n => n.innerText));
  return tr_condition;
}

const new_product_condition = async (page) => {
  await page.waitForSelector(compare_colors);
  let feedHandle = await page.$(compare_condition);
  let tr_condition = await feedHandle.$$eval('td[class="bg-green"]', nodes => nodes.map(n => n.innerText));
  return tr_condition;
}

const used_product_condition = async (page) => {
  await page.waitForSelector(compare_colors);
  let feedHandle = await page.$(compare_condition);
  let tr_condition = await feedHandle.$$eval('td[class="bg-red"]', nodes => nodes.map(n => n.innerText));
  return tr_condition;
}

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    args: [`--window-size=${width},${height}`]
  });
  page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto('http://localhost:3000/');
});

afterAll(() => {
  browser.close();
});

describe("Product Compare", () => {
  test("Test Case ids: 1 & 2, Verify Products page",async() => {
    await page.waitForSelector(products);
    expect(await page.$(products)).toBeTruthy();

    expect(await page.$(table)).toBeFalsy();
    let products_loc = await page.$$(products);

    await products_loc.forEach(product => {
        expect(product.$(product_image)).toBeTruthy();
    })

    expect(expected_price_values).toEqual(await actual_product_price(page));
    expect(expected_product_name).toEqual(await actual_product_name(page));

    await compare_products(1, 1, page);
    await page.screenshot({path: 'compare1.png'});
    expect(await page.$(table)).toBeFalsy();
    await remove_products(1, 1, page);

  }, 30000);

  test("Test Case ids: 3, 4 & 5: Verify compare 2 or more Products and Remove products from Compare,  ",async() => {

    await compare_products(1, 2, page);
    await page.screenshot({path: 'compare2.png'});
    expect(await page.$(table)).toBeTruthy();

    expect(expected_price_values).toEqual(expect.arrayContaining(await table_price(page)));
    expect(expected_condition_values).toEqual(expect.arrayContaining(await table_condition(page)));

    await remove_products(1, 1, page);
    expect(await page.$(table)).toBeFalsy();
    await remove_products(2, 2, page);
    await compare_products(1, 3, page);
    await page.screenshot({path: 'compare3.png'});
    expect(await page.$(table)).toBeTruthy();
    expect(expected_price_values).toEqual(expect.arrayContaining(await table_price(page)));
    expect(expected_condition_values).toEqual(expect.arrayContaining(await table_condition(page)));

    await remove_products(1, 1, page);
    expect(await page.$(table)).toBeTruthy();
    await remove_products(2, 3, page);
    // await browser.close();
  }, 10000);

  test("Test Case ids: 6, 7 & 8: Compare All existing Products and Remove products from Compare",async() => {

    await compare_products(1, 4, page);
    expect(expected_price_values).toEqual(await table_price(page));
    expect(expected_condition_values).toEqual(await table_condition(page));
    expect(['New', 'New']).toEqual(await new_product_condition(page));
    expect(['Used', 'Used']).toEqual(await used_product_condition(page));
    await page.screenshot({path: 'compare4.png'});
    await remove_products(1, 4, page);
    expect(await page.$(table)).toBeFalsy();
  }, 10000);

});
