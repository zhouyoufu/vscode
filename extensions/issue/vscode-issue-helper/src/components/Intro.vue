<template>
  <div class="col-12">
    <i18n id="intro" class="block bg-faded" @click-modal="show = true"/>
    <modal :open="show" @close="show = false">
      <div class="card">
        <div class="card-header">
          <h4 class="mb-0">{{ i18n('intro-modal-title') }}</h4>
        </div>
        <i18n class="card-block" id="intro-modal"/>
      </div>
    </modal>
  </div>
</template>

<script>
export default {
  data: () => ({
    show: false
  })
}
</script>