<template>
  <div class="comment-contain" :class="display">
    <div class="back">
      <i class="icon-back" @click="close"></i>
    </div>
    <p class="song-name">{{songName}}</p>
    <div v-if="allList.length">
      <scroll class="list" ref="list" :data="allList">
        <ul class="comment-content">
          <li v-for="item in allList">
            <div class="top"><img :src="item.avatarurl">{{item.nick}}</div>
            <div class="bottom">{{item.rootcommentcontent}}</div>
          </li>
        </ul>
      </scroll>
    </div>
  </div>
</template>

<script>
  import {getCommentList} from 'api/comment'
  import {ERR_OK} from 'api/config'
  import Scroll from 'base/scroll/scroll'

  export default {
    props: {
      topid: {
        type: Number,
        default: 0
      },
      flag: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      display() {
        return this.flag ? 'show' : ''
      }
    },
    data() {
      return {
        songName: '',
        commentList: [],
        hot_comment: [],
        allList: []
      }
    },
    mounted() {

    },
    methods: {
      close() {
        this.$emit('close', this.flag)
      }
    },
    components: {
      Scroll
    },
    watch: {
      topid(val) {
        if (val) {
          console.log('topid', val)
          getCommentList(val, 25).then((res) => {
            this.commentList.length = 0
            this.hot_comment.length = 0
            this.allList.length = 0
            if (res.code === ERR_OK) {
              this.commentList = res.comment.commentlist
              this.hot_comment = res.hot_comment.commentlist
              res.hot_comment.commentlist.forEach((v, i, a) => {
                this.allList.push(v)
              })
              res.comment.commentlist.forEach((v, i, a) => {
//                v.date = new Date(v.time).toLocaleString()
                this.allList.push(v)
              })
              this.songName = res.topic_name
//              this.allList = this.hot_comment.concat(this.songName)
              console.log('gg', this.allList)
            }
          })
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
    display: none
    position: fixed
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
              vertical-align: middle
              padding-right: 5px
            }
            font-size: $font-size-medium
            color: $color-text-l
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
</style>
