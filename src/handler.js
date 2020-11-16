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

// 샘플 - 스타일난다
module.exports.sample = async () => {

    // headless 초기화
    const { browser, page } = await initializeHeadless(URL.STYLENANDA)

    try {

        const categoryList = ['아우터', '탑', '드레스', '스커트', '팬츠', '가방', '슈즈', '악세서리', '썸머']
        let res = []

        for (const cat of categoryList) {

            let index = categoryList.indexOf(cat);

            // 카테고리 선택
            await page.waitForSelector(SELECTOR.STYLENANDA_CATEGORY)
            await page.click(SELECTOR.STYLENANDA_CATEGORY_BUTTON[index])
            
            //TODO: 페이지 이동 및 마지막 페이지 체크 로직 추가 

            // 상품 리스트(보드) 조회
            await page.waitForSelector(SELECTOR.STYLENANDA_ITEM_BOARD)
            let itemList = await page.$$eval(SELECTOR.STYLENANDA_ITEM_BOARD, board => board.map(item => {

                let priceTxt = item.querySelector('.table > div:last-child > .price').innerText

                let price = priceTxt.includes("→")?
                    priceTxt.split(" → ")[0]
                        .replace(",","")
                        .replace("원","")
                        .replace(" ", "") :
                    priceTxt.replace(",", "")
                        .replace("원", "")
                        .replace(" ", "")

                let discPrice = priceTxt.includes("→")?
                    priceTxt.split(" → ")[1]
                        .replace(",","")
                        .replace("원","")
                        .replace(" ", "") :

                    priceTxt.replace(",", "")
                        .replace("원", "")
                        .replace(" ", "")

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

        // headless pages, browser 종료
        let pages = await browser.pages()
        await Promise.all(pages.map(page =>page.close()))
        await browser.close()

        return createResponse(200, res)
    }
    catch (e){
        let pages = await browser.pages()
        await Promise.all(pages.map(page =>page.close()))
        await browser.close()

        process.exit()
    }
}
