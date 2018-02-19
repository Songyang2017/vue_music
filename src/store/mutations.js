import * as types from './mutations-types'

const matuations = {
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  }
}

export default matuations
