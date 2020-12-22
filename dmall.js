/*
Dmall商城签到
Author: hzn5583
Github: https://github.com/JohnHa0/daily_sign
使用说明：
Secrets 配置：
Cookie数据：dmCookie ，多账号请用&分割
签到URL数据：signAddress，多账号请用@分割
推送数据:
SCKEY-->> 微信酱推送
BARK_PUSH -->> BARK 推送

*/

const $ = new Env('多点');
let cookiesArr = [], cookie = '';
let urlAddress = [], address ='';
let query_add,query = '';
let nickName,title, desc='';
let totalScore,continueDay,totalDay=0;
let ttReward = [3,7,21,25,31], cnReward = [2,5,10,15];
const notify = $.isNode() ? require('./sendNotify') : '';
// 查询是否有sendNotify模块并赋予isNode()
// cookie='addr=%E5%8C%97%E4%BA%AC%E5%B8%82%E8%A5%BF%E5%9F%8E%E5%8C%BA%E6%9C%A8%E6%A8%A8%E5%9C%B0%E5%8D%97%E9%87%8C16%E5%8F%B7%E6%A5%BC; addrId=; appMode=online; appVersion=4.9.0; areaId=110102; bigdata=; businessCode=1; community=%E6%9C%A8%E6%A8%A8%E5%9C%B0%E5%8D%97%E9%87%8C16%E5%8F%B7%E6%A5%BC; env=app; first_session_time=1606190484894; lat=39.899322; lng=116.336788; platform=IOS; platformStoreGroup=; platformStoreGroupKey=efaf5399a75925c2dd91ae5776a64c9d@MjU4LTE3NjUz; recommend=1; session_count=8; session_id=9ED75478213A48DFA330BB4F58BD8438; storeGroupKey=ae258cb30030b4fa63f6eef5929faad9@MS0xMDgtMQ; storeGroupV4=; storeGroupV4_encode=; storeId=108; store_id=108; tdc=; tempid=C92DC195EEE00002B27DAB5028008B00; ticketName=9BDE712C8CF5AF5E618DDF150B0E5797DB4F886DE66CDE5716241166EB65E134A92D5766B8087AC2449872CB21139363987A1354071DCAD85E290F3ECF1FDA61E3B8C8A2EF328D11CB511E29DC9844C672CB190B090E62C59D3416768E0DEECDF50612F8F24D63EADD01C11C1C5D5CA701BF9415DD8AAC17710F8909B1FECFBD; token=b1487ad6-57da-44d1-9554-b3e2336dc6f4; userId=205271280; uuid=99ea1865728b84932885e13f1fe3fa027fad4cf6; venderId=1; vender_id=1; webViewType=wkwebview'

// cookie
//请用 & 分割不同账户

if (process.env.dmCookie) {
    if (process.env.dmCookie.indexOf('&') > -1) {
        console.log(`您的cookie选择的是用&隔开\n`)
        cookiesArr = process.env.dmCookie.split('&');
    }
    else {
        cookiesArr = [process.env.dmCookie];
    }
    console.log(`\n====================共有${cookiesArr.length}个账号Cookie=========\n`);
}

let queryHD="https://appapis.dmall.com/static/queryUserCheckInfo.jsonp?callback";
// URLS 请用@隔开
    if (process.env.signAddress) {
        if (process.env.dmCookie.indexOf('@') > -1) {
            console.log(`您的URL选择的是用@隔开\n`)
            urlAddress = process.env.signAddress.split('@');
        } else {
            urlAddress = [process.env.signAddress];
        }
    }

!(async () => {
    if (!cookiesArr[0]) {
        $.msg('【提示】请先获取签到Token');
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            address = urlAddress[i];
            //获取查询地址
            query_add=queryHD+address.split("callback")[1];
            nickName=address.match(/phone=(.+?)&/)[1]
            $.index = i + 1;
            console.log('【账号'+nickName+'】:\n');
            await signIn();
            await checkIn();
            await showMsg();
            if ($.isNode()){
                await notify.sendNotify("账号:"+nickName,$.sub+"\n"+$.desc)
            }
        }
    }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())


function signIn() {
    return new Promise(resolve => {
        $.get(taskUrl(), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        //抽取签到信息
                        dt=data.match(/reward":{.*"signAction"/)[0]
                        dt.toString().replace(/,\"signAction\"/,"")
                        dt.toString().replace(/reward":/,"")
                        dt=dt.toString().slice(dt.toString().indexOf(":")+1,dt.toString().lastIndexOf(","))
                        if (safeGet(dt)){
                            dt=JSON.parse(dt)
                            signReward=dt.signInRewardInfoVOs[0]
                            // title =dt.title+"!"+dt.subTitle+":"
                            title =dt.title+"!"
                            desc = "获取"+signReward.rewardType+"积分,请在"+signReward.rewardValidityDate+"."
                        }else {
                            title = '签到结果：失败'
                            desc = '说明：请重新获取token'
                            $.msg($.name, '账号Token失效！请重新打开软件获取');
                            return
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function taskUrl() {
    return {
        // url: `https://appapis.dmall.com/static/signInProccess.jsonp?callback=jQuery22306190819894015817_1608254209278&isNew=1&phone=13309881910&apiVersion=4.9.0&platform=IOS&venderId=1&storeId=108&addressId=&longitude=116.336788&latitude=39.899322&nowLongitude=&nowLatitude=&_=1608254209284`,
        url: address,
        // body : 'reqData=%7B%22channelLv%22%3A%22changjinglouceng%22%2C%22site%22%3A%22JD_JR_APP%22%7D',
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            "Connection": "keep-alive",
            "Host": "appapis.dmall.com",
            "Referer": "https://act.dmall.com/dac/signIn/index.html?dmShowTitleBar=false&dmfrom=wx&bounces=false&dmNeedLogin=true&dmTransStatusBar=true",
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148Dmall/4.9.0",
        }
    }
}

function checkIn() {
    return new Promise(resolve => {
        $.get(queryUrl(), (err, resp, signData) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (signData) {
                        //抽取签到信息
                        //获取scores
                        totalScore = signData.match(/score.+?(\d+?),/)[1]
                        //获取签到天数
                        totalDay = signData.match(/currentMonthAddUpDays.+?(\d)/)[1]
                        //获取连续签到天数
                        continueDay = signData.match(/currentMonthContinuousDays.+?(\d)/)[1]
                        if (ttReward.toString().indexOf(totalDay) == -1 ){
                            totalReward=""
                        }else{
                            totalReward = "请手动领取累计"+totalDay+"天奖励！"
                        }
                        if (cnReward.toString().indexOf(continueDay==-1)){
                            continueReward = ""
                        }else {
                            continueReward ="请手动领取连签"+continueDay+"天奖励"
                        }
                        title = title + continueReward + totalReward + "."
                        desc = desc + "\n" + "连续签到"+ continueDay +"天"+"(累计"+ totalDay +"天)" +"\n" + "账户总积分:" +totalScore

                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function queryUrl() {
    return {
        url: query_add,
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            "Connection": "keep-alive",
            "Host": "appapis.dmall.com",
            "Referer": "https://act.dmall.com/dac/signIn/index.html?dmShowTitleBar=false&dmfrom=wx&bounces=false&dmNeedLogin=true&dmTransStatusBar=true",
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148Dmall/4.9.0",
        }
    }
}

function showMsg() {
    return new Promise(resolve => {
        if(title){
            $.sub = title
            $.desc = desc
            $.msg("多点账号:",$.sub,$.desc)
        }
        resolve()
    })
}


function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}
function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}