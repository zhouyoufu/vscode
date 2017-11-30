<template>
  <div class="col-12">
    <div class="block bg-faded">
      <h2>Fixed in Insiders</h2>
      <p>Does this issue also happen in the <a href="https://code.visualstudio.com/insiders/">Insiders version</a>?
      </p>
      <button type="button" class="btn" @click="setFixedInInsiders(false)" 
        :class="{ 
          'btn-outline-success': isFixedInInsiders,
          'btn-success': !isFixedInInsiders
        }">Yes</button>
      <button type="button" class="btn" @click="setFixedInInsiders(true)"
        :class="{ 
          'btn-outline-danger': !isFixedInInsiders,
          'btn-danger': isFixedInInsiders
        }">No</button>

      <div class="message" v-if="isFixedInInsiders">
        This issue has been fixed in VS Code Insiders version and will be available in our next monthly release.
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'isFixedInInsiders'
    ])
  },
  methods: {
    setFixedInInsiders (val) {
      this.$store.commit('setFixedInInsiders', val)
    }
  }
}
</script>
