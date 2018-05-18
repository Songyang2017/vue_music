import jsonp from 'common/js/jsonp'
import {commonParams} from './config'

const options = {
  param: 'jsonpCallback',
  name: '__jp2'
}

export function getVkey(songmid) {
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'

  const data = Object.assign({}, commonParams, {
    g_tk: 2095290010,
    hostUin: 0,
    platform: 'yqq',
    needNewCode: 0,
    cid: 205361747,
    uin: 1546302993,
    guid: 7748797702,
    callback: `__jp2`,
    songmid: `${songmid}`,
    filename: `C400${songmid}.m4a`
  })

  return jsonp(url, data, options)
}
