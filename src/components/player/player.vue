<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.image" alt="" width="100%" height="100%">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
          <div class="down-load">
            <a :href="vkeyUrl" :download="vkeyUrl"></a>
          </div>
        </div>
        <div class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img :src="currentSong.image" alt="" class="image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" class="text"
                   :class="{'current': currentLineNum === index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{active: currentShow === 'cd'}"></span>
            <span class="dot" :class="{active: currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{this.format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent"
              @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <div class="time time-r">{{this.format(currentSong.duration)}}</div>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right" @click="_seekComment(currentSong)">
              <i class="icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" :src="currentSong.image" alt="" height="40" width="40">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" @ended="end" @canplay="ready" @error="error" @timeupdate="updateTime" :src="vkeyUrl"></audio>
    <!--<audio ref="audio" @ended="end" @canplay="ready" @error="error" @timeupdate="updateTime" :src="currentSong.url"></audio>-->
    <!--<comment :topid="currentSong.id" :flag="flag" @close="flag = false"></comment>-->
    <router-view></router-view>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from 'base/scroll/scroll'
  import {getVkey} from 'api/vkey'
  import {ERR_OK} from 'api/config'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    data() {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLineNum: 0,
        currentShow: 'cd',
        playingLyric: '',
        flag: false,
        vkeyUrl: ''
      }
    },
    created() {
      this.touch = {}
    },
    computed: {
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      iconMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen',
        'playList',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll
    },
    methods: {
      _getVkey() {
        if (this.vkeyUrl) {
          this.vkeyUrl = ''
        }
//        console.log('playerMid', this.currentSong.mid, getVkey(newSong.mid))
        getVkey(this.currentSong.mid).then((res) => {
          if (res.code === ERR_OK) {
            var vkey = res.data.items[0].vkey
            var filename = res.data.items[0].filename
            this.vkeyUrl = `http://dl.stream.qqmusic.qq.com/${filename}?vkey=${vkey}&guid=7748797702&uin=1546302993&fromtag=66`
//            console.log('player', path)
          }
        })
      },
      _seekComment(song) {
        this.$router.push({
          name: 'comments',
          params: {topid: song.id}
        })
      },
      middleTouchStart(e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0 ,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd() {
        let offsetWidth
        let opacity
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            this.currentShow = 'lyric'
            opacity = 0
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0 ,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
      },
      getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
          console.log(this.currentLyric)
        }).catch(() => {
          this.currentLyric = null
          this.playinglyric = ''
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      end() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()

        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      changeMode() {
        const mode = (this.mode + 1) % 3
        this.setPlayMode(mode)
        let list = null
        if (mode === playMode.random) {
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        this._resetCurrentIndex(list)
        this.setPlayList(list)
      },
      _resetCurrentIndex(list) {
        let index = list.findIndex((item) => {
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },
      onProgressBarChange(percent) {
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime
      },
      format(interval) {
        interval = interval | 0
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      _pad(num, n = 2) {
        let len = num.toString().length
        if (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      ready() {
        this.songReady = true
      },
      error() {
        this.songReady = true
      },
      prev() {
        if (!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playList.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      next() {
        if (!this.songReady) {
          return
        }

        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playList.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      back() {
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()

        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }

        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })

        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      _getPosAndScale() {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - (width / 2) - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      togglePlaying() {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PlAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode: 'SET_PLAY_MODE',
        setPlayList: 'SET_PLAYLIST'
      })
    },
    watch: {
      currentSong(newSong, oldSong) {
        this._getVkey()
        if (newSong.id === oldSong.id) {
          return
        }
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        setTimeout(() => {
          this.$refs.audio.play()
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .player {
    .normal-player {
      position: fixed;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute
          top: 0;
          left: 6px;
          z-index: 50;
          .icon-back {
            display: block;
            padding: 9px;
            font-size: $font-size-large-x;
            color: $color-theme;
            transform: rotate(-90deg);
          }
        }
        .down-load{
          position: absolute;
          top: 0;
          right: 6px;
          z-index: 50;
          background-image: url('data:image/png;base64,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');
          background-size: cover;
          margin: 9px;
          width: 24px;
          height: 24px;
          a{
            width: 100%;
            height: 100%;
            display: block;
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border: 10px solid rgba(255, 255, 255, .1);
              border-radius: 50%;
              &.play {
                animation: rotate 20s linear infinite;
              }
              &.pause {
                animation-play-state: paused;
              }
              .image {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0 auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 30px;
            line-height: 30px;
            height: 30px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            text-align: center;
            padding: 0 20px;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left;
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all 0.4s;
        .top, .bottom {
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
        }
      }
      &.normal-enter, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0);
        }
      }
    }
    .mini-player {
      display: flex;
      align-items: center;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 180;
      width: 100%;
      height: 60px;
      background: $color-highlight-background;
      &.mini-enter-active, &.mini-leave-active {
        transition: all 0.4s;
      }
      &.mini-enter, &.mini-leave-to {
        opacity: 0;
      }
      .icon {
        flex: 0 0 40px;
        width: 40px;
        padding: 0 10px 0 20px;
        img {
          border-radius: 50%;
          &.play {
            animation: rotate 10s linear infinite
          }
          &.pause {
            animation-play-state: paused
          }
        }
      }
      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          margin-bottom: 2px;
          no-wrap();
          font-size: $font-size-medium;
          color: $color-text;
        }
        .desc {
          no-wrap();
          font-size: $font-size-small;
          color: $color-text-d;
        }
      }
      .control {
        flex: 0 0 30px;
        width: 30px;
        padding: 0 10px;
        .icon-play-mini, .icon-pause-mini, .icon-playlist {
          font-size: 30px;
          color: $color-theme-d;
        }
        .icon-mini {
          font-size: 32px;
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0)
    }
    100% {
      transform: rotate(360deg)
    }
  }
</style>
