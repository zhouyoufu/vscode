<template>
  <div>
    <caused-by-ext />
    <fixed-in-insiders v-if="!isCausedByExt" />
    <startup-perf-issue v-if="!isFixedInInsiders" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

import CausedByExt from './CausedByExt.vue'
import FixedInInsiders from './FixedInInsiders.vue'
import StartupPerfIssue from './StartupPerfIssue.vue'

export default {
  components: {
    CausedByExt,
    FixedInInsiders,
    StartupPerfIssue
  },
  data: () => ({
    // isCausedByExt: true
  }),
  computed: {
    ...mapState([
      'isCausedByExt',
      'isFixedInInsiders',
      'isStartupPerfIssue'
    ])
  },
  methods: {
    setCausedByExt (val) {
      this.isCausedByExt = val
    }
  }
}
</script>

<style lang="scss" scoped>
.intro {
  font-size: 0.9em;
  padding: 1.5em 2em 0.5em;
  border-radius: 4px;
  margin-bottom: 15px;
  h2 {
    font-size: 1.6em;
  }
}
</style>
