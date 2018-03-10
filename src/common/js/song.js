export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
}

export function createSong(musicData) {
  var t = (new Date()).getUTCMilliseconds()
  var _guid = Math.round(2147483647 * Math.random()) * t % 1e10

  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albumid}.jpg?max_age=2592000`,
    url: `http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?guid=${_guid}`
  })
}

function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }

  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
