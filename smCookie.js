/*
此文件为Node.js专用。其他用户请忽略
 */
//此处填写京东账号cookie。
//注：github action用户cookie填写到Settings-Secrets里面，新增SM_Cookie，多个账号的cookie使用`&`隔开或者换行
let TokenSMs = [
  '',//账号一ck,例:pt_key=XXX;pt_pin=XXX;
  '',//账号二ck,例:pt_key=XXX;pt_pin=XXX;如有更多,依次类推
]
// 判断github action里面是否有京东ck
if (process.env.SM_COOKIE) {
  if (process.env.SM_COOKIE.indexOf('&') > -1) {
    console.log(`您的cookie选择的是用&隔开\n`)
    TokenSMs = process.env.SM_COOKIE.split('&');
  } else if (process.env.SM_COOKIE.indexOf('\n') > -1) {
    console.log(`您的cookie选择的是用换行隔开\n`)
    TokenSMs = process.env.SM_COOKIE.split('\n');
  } else if (process.env.SM_COOKIE.indexOf('\\n') > -1) {
    //环境变量兼容腾讯云和docker下\n会被转义成\\n
    console.log(`您的cookie选择的是用换行隔开\\n`)
    TokenSMs = process.env.SM_COOKIE.split('\\n');
  } else {
    TokenSMs = [process.env.SM_COOKIE];
  }
  TokenSMs = [...new Set(TokenSMs)]
  console.log(`\n====================共有${TokenSMs.length}个世贸账号Cookie=========\n`);
  console.log(`==================脚本执行- 北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000).toLocaleString()}=====================\n`)
  // console.log(`\n==================脚本执行来自 github action=====================\n`)
}
for (let i = 0; i < TokenSMs.length; i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['TokenSM' + index] = TokenSMs[i];
}
