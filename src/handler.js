const { initializeHeadless } = require('../src/common/utils/initializeHeadless')
const { URL } = require('../src/common/utils/url')
const { SELECTOR } = require('../src/common/utils/selector')
const { MALL } = require('../src/common/utils/mall')

const createResponse = (status, body) => ({
    statusCode: status,
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
});

const parsePrice = (text) => {
    return text.includes("→")?

            text.split(" → ")[0]
                .replace(",","")
                .replace("원","")
                .replace(" ", "") :
            text.replace(",", "")
                .replace("원", "")
                .replace(" ", "")
}

const parseDiscPrice = (text) => {
    return text.includes("→")?
            text.split(" → ")[1]
                .replace(",","")
                .replace("원","")
                .replace(" ", "") :

            text.replace(",", "")
                .replace("원", "")
                .replace(" ", "")
}

// 샘플 - 스타일난다
module.exports.sample = async () => {

    // headless 초기화
    const { browser, page } = await initializeHeadless(URL.STYLENANDA)

    // 각 서비스 모듈 호출
    try {

        const categoryList = ['아우터', '탑', '드레스', '스커트', '팬츠', '가방', '슈즈', '악세서리', '썸머']
        let res = []

        for (const cat of categoryList) {

            let index = categoryList.indexOf(cat);

            await page.waitForSelector(SELECTOR.STYLENANDA_CATEGORY)
            await page.click(SELECTOR.STYLENANDA_CATEGORY_BUTTON[index])

            let itemList = await page.$$eval(SELECTOR.STYLENANDA_ITEM_BOARD, board => board.map(item => {

                let priceTxt = item.querySelector('.table > div:last-child > .price').innerText
                let price = parsePrice(priceTxt)
                let discPrice = parseDiscPrice(priceTxt)

                return {
                    url: item.querySelector('.box > a').href,
                    imageUrl: item.querySelector('.box > a > img').src,
                    title: item.querySelector('.table > .name > a > span').innerText,
                    price: price,
                    discPrice: discPrice,
                }
            }));

            itemList.forEach(item => {
                item.category = cat
                item.mallNm = MALL.STYLENANDA.NAME
                item.mallNo = MALL.STYLENANDA.NUMBER
            })

            res = res.concat(itemList)
        }

        browser.close()
        return createResponse(200, res)
    }
    catch (e){
        browser.close()
        process.exit()
    }
}
