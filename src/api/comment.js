import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
// import axios from 'axios'

export function getCommentList(topid, pagesize) {
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg'

  const data = Object.assign({}, commonParams, {
    cid: 205360772,
    outCharset: 'GB2312',
    reqtype: 2,
    biztype: 1,
    topid: topid || 0,
    cmd: 8,
    needmusiccrit: 0,
    pagenum: 0,
    pagesize: pagesize,
    lasthotcommentid: '',
    callback: '__jp2',
    format: 'jsonp',
    ct: '24',
    cv: '101010',
    domain: 'qq.com',
    notice: '0',
    platform: 'yqq',
    needNewCode: 0
  })

  return jsonp(url, data, options)
}
