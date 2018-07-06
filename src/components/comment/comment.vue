<template>
  <div class="comment-contain">
    <div class="back">
      <i class="icon-back" @click="back"></i>
    </div>
    <p class="song-name">{{songName}}</p>
    <scroll class="list" ref="list" :data="allList">
      <ul class="comment-content">
        <li v-for="item in allList">
          <div class="top"><img :src="item.avatarurl">{{item.nick}}<span style="line-height:30px;float: right">赞&nbsp;{{item.praisenum}}</span></div>
          <div class="bottom">{{item.rootcommentcontent}}</div>
        </li>
      </ul>
    </scroll>
    <div class="loading-container" v-if="!allList.length">
      <loading></loading>
    </div>
  </div>
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
    computed: {
    },
    created() {
      this._getCommentList()
    },
    mounted() {
      console.log('par', this.$route.params)
      console.log('name', this.songName)
    },
    methods: {
      back() {
        this.$router.back()
      },
      _getCommentList() {
        getCommentList(this.$route.params.topid, 25).then((res) => {
          this.commentList.length = 0
          this.hot_comment.length = 0
          this.allList.length = 0
          if (res.code === ERR_OK) {
            this.hot_comment = res.hot_comment.commentlist
            this.commentList = res.comment.commentlist
            if (this.hot_comment) {
              this.hot_comment.forEach((v, i, a) => {
                this.allList.push(v)
              })
            }
            if (this.commentList) {
              this.commentList.forEach((v, i, a) => {
                this.allList.push(v)
              })
            }
            this.songName = res.topic_name
            console.log('gg', this.allList)
          }
        })
      }
    },
    components: {
      Scroll,
      Loading
    },
    watch: {
//      topid(newTopid, oldTopid) {
//        console.log('topid', newTopid)
//        this._getCommentList()
//      }
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
              margin-right: 5px
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
  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
