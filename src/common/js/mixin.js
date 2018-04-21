import {mapGetters} from 'vuex'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playList)
  },
  activated() {
    this.handlePlaylist(this.playList)
  },
  watch: {
    playList(newValue) {
      this.handlePlaylist(newValue)
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('components must implement handlePlaylist method')
    }
  }
}
