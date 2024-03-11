const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const axios = require('axios');
const path = require("path");
const fs = require('fs').promises;


function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCookiesForToken(token) {
    const response = await axios.get(`https://ucuzadoy.troyagame.com/getCookie.php?all=1&token=${token}`);
    return response.data.data;
}

async function clickFirstButtonAndHandleNewWindow(page) {
    const firstButtonSelector = 'button[data-testid="connect-social-account-facebook"]';

    let existingPages = await page.browser().pages();
    const initialPageCount = existingPages.length;

    await page.click(firstButtonSelector);

    await page.waitForFunction(pages => window.open.pages.length > pages, {}, initialPageCount);

    await wait(2000);
    existingPages = await page.browser().pages();

    const newPage = existingPages.find(p => !initialPageCount.includes(p));
    if (!newPage) throw new Error('Yeni pencere bulunamadı');

    return newPage;
}



async function sendPostRequestWithAxios(data) {
    const url = 'https://ucuzadoy.troyagame.com/updataCookies/cookieUpdate.php';

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Response:', response.data);
    } catch (error) {
        console.error('An error occurred:', error.response ? error.response.data : error.message);
    }
}


async function clickButtonBasedOnPosition(newPage, selector, position = 0) {
    await newPage.evaluate(({selector, position}) => {
        const elements = Array.from(document.querySelectorAll(selector));
        if (elements.length > position && elements[position].click) {
            elements[position].click();
        }
    }, {selector, position});
}


(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './myCustomChromeProfile',
    });
    const page = await browser.newPage();


    const facebookCookiesornekyapi = [
        {"name": "c_user", "value": "61556590186159", "expires": 1740875576, "domain": ".facebook.com", "path": "/", "secure": true, "samesite": "None"},
        {"name": "xs", "value": "1:uLY2UgoJWqIJqg:2:1709339578:-1:-1", "expires": 1740875576, "domain": ".facebook.com", "path": "/", "secure": true, "httponly": true, "samesite": "None"},
        {"name": "fr", "value": "0GPtGELpYix6BvwAq.AWVHEERIgR5gP6twMc0EH5xMK_U.Bl4nO4..AAA.0.0.Bl4nO4.AWXQqzIaCio", "expires": 1717115576, "domain": ".facebook.com", "path": "/", "secure": true, "httponly": true, "samesite": "None"},
        {"name": "datr", "value": "qnPiZY-o04sbKD3GIHT_LueI", "expires": 1743899576, "domain": ".facebook.com", "path": "/", "secure": true, "httponly": true, "samesite": "None"}
    ]; // <------------------  facebook bu yapıda olması gerek
    const cookieFilePath = path.join(__dirname, 'fb_token.ini');
    await page.goto('https://www.facebook.com');
    const content = await fs.readFile(cookieFilePath, {encoding: 'utf8'});
    const firstCookieString = content.split('\n')[0];
    const fbcookies = JSON.parse(firstCookieString);
    await page.setCookie(...fbcookies);
    await page.reload();

    await wait(5000);

    const yemeksepetiCookiesornekyapi = [
        {
            "name": "hl",
            "value": "tr",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": true,
            "httpOnly": false,
            "session": true
        },
        {
            "name": "dhhPerseusGuestId",
            "value": "1709145973433.566650725458227840.pcht0irkyd",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": false,
            "httpOnly": false,
            "expiry": 1743705972,
            "session": false
        },
        {
            "name": "__cf_bm",
            "value": "5fyPpawTnZYf.1AEuFDIyeEBaSQcsehbLKoKKz737wc-1709145973-1.0-AS/ctmI2TM/qoMZ8aEbFbMoFZSZTW8KCes9T6OtxkEC69bqMXicEEKXIJXnGClexSL0sYc+2pjtLv18bvhOWfGE=",
            "domain": ".yemeksepeti.com",
            "path": "/",
            "secure": true,
            "httpOnly": true,
            "expiry": 1709147772,
            "session": false
        },
        {
            "name": "_pxhd",
            "value": "x3LctjGS98FqqcKz0V9WSsWtcTPTqxNs0Hnv6KHIcrJYY7mz9N9LEBXunsXJWWMew/wyF9cqKjyJgr7mrmyB8w==:-akI5LJUNyKHntgrmXoJN7kNfgZgTg8og7yvh4B-Tt9bau7STNROHwvWOlVJ8DnXA0GqBJ2zC3dKOwz7ZcsLX37TYKrfC2l-pYqP99TxhlE=",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": false,
            "httpOnly": false,
            "sameSite": "lax",
            "session": true
        },
        {
            "name": "dhhPerseusSessionId",
            "value": "1709145975482.199236292970040640.vqgmtftqdo",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": false,
            "httpOnly": false,
            "expiry": 1709147956,
            "session": false
        },
        {
            "name": "token",
            "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleW1ha2VyLWtleS12b2xvLXlzLXRyIiwidHlwIjoiSldUIn0.eyJpZCI6InI5bGhiZ2ttbTFsMnM3N3plZXo3Y2pjaDBoamk5cTkwcTU3d3dncHEiLCJjbGllbnRfaWQiOiJ2b2xvIiwidXNlcl9pZCI6InRyb3F6aDB3IiwiZXhwaXJlcyI6MTcwOTE0OTY1NiwidG9rZW5fdHlwZSI6ImJlYXJlciIsInNjb3BlIjoiQVBJX0NVU1RPTUVSIEFQSV9SRUdJU1RFUkVEX0NVU1RPTUVSIn0.MqhmQzbdTiIlo4ztY-Cx_eg18RJ1C50jluxgnDljA-GoerRSXxC23I3bPY2WmZYM9JZ3W-FULckwvR62LEK4aAqesBRSOTsprk2H9uPolsRCVmupvb0R6rmgDMJSrM986-o4t5_7lCs5O0W128_0utyA5xfpXR6_DiKXr9FXWCmvZIOvnnsK4ox1gVDc5hSHVDO85gcZSt85LxmvVDChPhGsiQsFONQFcu3VuAVbuInwseENj7FbRrtkdPeC2ZQJv-13ZWoyLeGvhtQrExpLmGaQ_QEeSEAx8lz-9TnOykp1e4y0oDo150quHL5MsJ3VoX8oQzDwJ9EVOsm32wtcjA",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": true,
            "httpOnly": false,
            "expiry": 1709149655,
            "session": false
        },
        {
            "name": "device_token",
            "value": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleW1ha2VyLXZvbG8tZGV2aWNlLXlzLXRyIiwidHlwIjoiSldUIn0.eyJpZCI6Ijk3NmIzOWMwLWQzOWYtNGMwZS04NDg3LTA0MmQxMGM5NTI5ZiIsImNsaWVudF9pZCI6InZvbG8iLCJ1c2VyX2lkIjoidHJvcXpoMHciLCJleHBpcmVzIjo0ODYyNzQ2MDU1LCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwic2NvcGUiOiJERVZJQ0VfVE9LRU4ifQ.JbX3R0o_-9b6I9QAJEMMQ3He9dqfHe2Yh5yUu74sSMmkgu9i2-4aBZLDRy68SPnSKNsle_Xf3ZWaa3zfpgceudMchPrnUabWBJ6ce05L23O9xGxRscH900N14mQWTAWL3aOI0NBa275XNHMrlFc5zjmX2XI9j91INmeHgOiR2zrV__vGcXsS-C-H_yuGZT15aolYqXwgIuWYO3Dh5Y2onuhlLLD9ajO82xJjjIujaQgzk2sOr6sMU6Xp3HtdobqtagIJzNkrN7AJj4-hTDUIJD0lYzFi_oOA24VbBleboC77MdKyDKrLJqyFllk9WeMpe8N8AicRwviYraOhaEgKSg",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": true,
            "httpOnly": false,
            "expiry": 1743706055,
            "session": false
        },
        {
            "name": "refresh_token",
            "value": "jfyin2w5ijlhalzcm9b9abnt05xmwx87mh13tenf",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": true,
            "httpOnly": false,
            "expiry": 1740682055,
            "session": false
        },
        {
            "name": "userSource",
            "value": "volo",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": true,
            "httpOnly": true,
            "expiry": 1740682055,
            "session": false
        },
        {
            "name": "dhhPerseusHitId",
            "value": "1709146156444.227011595960860060.8bvhxr7zej",
            "domain": "www.yemeksepeti.com",
            "path": "/",
            "secure": false,
            "httpOnly": false,
            "expiry": 1709149756,
            "session": false
        }
    ];  // <------------------   yemeksepeti cokiesi bu yapıda olması gerek
    const tokenListRaw = await fs.readFile('token_list.ini', 'utf8');
    const tokens = tokenListRaw.split('\n').filter(Boolean);
    const firstToken = tokens[0]; // İlk token
    console.log(firstToken);
    const cookies = await getCookiesForToken(firstToken);
    if (!Array.isArray(cookies)) {
        console.error('Çerezler dizi formatında değil:', cookies);
        return;
    }
    await page.goto('https://www.yemeksepeti.com');
    await page.deleteCookie(...cookies);
    await page.setCookie(...cookies);
    console.log(`Çerezler ayarlandı: ${firstToken}`);
    await page.goto('https://www.yemeksepeti.com/account');

    const newPage = await clickFirstButtonAndHandleNewWindow(page);
    await clickButtonBasedOnPosition(newPage, 'button', 0);

    const dataToSend = {
        // Buraya göndermek istediğin verileri ekleyeceksin.
        // Örneğin:
        token: firstToken,
        facebook_cookie: fbcookies,
        yemeksepeti_cookie: cookies
    };
    sendPostRequestWithAxios(dataToSend);
})();
