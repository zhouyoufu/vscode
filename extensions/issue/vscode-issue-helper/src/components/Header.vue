<template>
  <nav class="navbar navbar-light fixed-top bg-faded mb-3">
    <div class="container d-flex">
      <a class="navbar-brand" href="#">
        <img src="../assets/images/logo.png" alt="Vue's logo" height="24"> Issue Helper</a>
    </div>
  </nav>
</template>

<script>
export default {
  props: ['lang']
}
</script>

<style lang="scss">
.navbar {
  border-bottom: 1px solid #eee;
}

.nav-link {
  cursor: pointer;
  &.active {
    color: #4fc08d !important;
    // font-weight: bold;
  }
}
</style>
