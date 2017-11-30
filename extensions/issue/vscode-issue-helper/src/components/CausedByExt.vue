<template>
  <div class="col-12">
    <div class="block bg-faded">
      <h2>Extensions</h2>
      <p>When you run
        <code>code --disable-extensions</code>, does the issue still happen?</p>
      <button type="button" class="btn" @click="setCausedByExt(false)" 
        :class="{ 
          'btn-outline-success': isCausedByExt,
          'btn-success': !isCausedByExt
        }">Yes</button>
      <button type="button" class="btn" @click="setCausedByExt(true)"
        :class="{ 
          'btn-outline-danger': !isCausedByExt,
          'btn-danger': isCausedByExt
        }">No</button>

      <div class="message" v-if="isCausedByExt">
        The performance issue is caused by an extension. We recommend disabling that extension or contacting the extension author.
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'isCausedByExt'
    ])
  },
  methods: {
    setCausedByExt (val) {
      this.$store.commit('setCausedByExt', val)
    }
  }
}
</script>
