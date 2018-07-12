<template>
  <transition name="slide">
    <div class="comment-contain">
      <div class="back">
        <i class="icon-back" @click="back"></i>
      </div>
      <p class="song-name">{{songName}}</p>
      <scroll class="list" ref="list" :data="allList">
        <ul class="comment-content">
          <li v-for="item in allList">
            <div class="top">
              <img v-lazy="item.avatarurl">
              <div class="nick">
                <p>{{item.nick}}</p>
                <p>{{item.date}}</p>
              </div>
              <span style="line-height:30px;float: right"><i class="iconfont">&#xe603;</i>&nbsp;{{item.praisenum}}</span>
            </div>
            <div class="bottom">{{item.rootcommentcontent}}</div>
          </li>
        </ul>
      </scroll>
      <div class="loading-container" v-if="display">
        <loading></loading>
      </div>
    </div>
  </transition>
</template>

<script>
  import {getCommentList} from 'api/comment'
  import {ERR_OK} from 'api/config'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'

  export default {
    data() {
      return {
        songName: '',
        commentList: [],
        hot_comment: [],
        allList: []
      }
    },
    props: { },
    computed: {
      topid() {
        return this.$route.params.topid
      },
      display() {
        return !this.allList.length
      }
    },
    created() {
      this._getCommentList(this.topid)
    },
    mounted() {

    },
    methods: {
      back() {
        this.$router.back()
        this.allList.length = 0
        console.log('长度', this.allList.length)
      },
      _getCommentList(id) {
        this.allList.length = 0
        getCommentList(id, 25).then((res) => {
          this.commentList.length = 0
          this.hot_comment.length = 0
          if (res.code === ERR_OK) {
            this.hot_comment = res.hot_comment.commentlist
            this.commentList = res.comment.commentlist
            if (this.hot_comment) {
              this.hot_comment.forEach((v, i, a) => {
                v.date = new Date(Number(v.time) * 1000).toLocaleString()
                this.allList.push(v)
              })
            }
            if (this.commentList) {
              this.commentList.forEach((v, i, a) => {
                v.date = new Date(Number(v.time) * 1000).toLocaleString()
                this.allList.push(v)
              })
            }
            this.songName = res.topic_name
//            console.log('gg', this.allList)
          }
        })
      }
    },
    components: {
      Scroll,
      Loading
    },
    watch: {
      topid(val) {
        if (typeof val !== 'undefined') {
          this._getCommentList(val)
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
  @import '~common/stylus/variable'

  .comment-contain{
    background-color: $color-background
    /*display: none*/
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    z-index: 10000
    .back {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 50;
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .song-name{
      position: relative
      text-align: center
      width: 100%
      padding: 13px 0
      color: $color-text-ll
    }
    .list{
      position: absolute
      top: 42px
      bottom: 0
      width: 100%
      overflow: hidden
      .comment-content {
        padding: 10px
        li {
          padding-bottom: 15px
          .top {
            img {
              border-radius: 50%
              width: 30px
              height: 30px
              vertical-align: sub
              margin-right: 5px
            }
            .nick {
              display: inline-block;
              p {
                &:nth-child(1){
                  margin-bottom: 5px
                }
                &:nth-child(2){
                  color: $color-theme-d
                }
              }
            }
            font-size: $font-size-small-s
            color: $color-text-l
            margin-bottom: 5px
          }
          .bottom {
            font-size: $font-size-medium
            color: $color-text-ll
            line-height: 22px
            padding-left: 35px
          }
        }
      }
    }
  }
  .show{
    display: block
  }
  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }

  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0)
  }
</style>
