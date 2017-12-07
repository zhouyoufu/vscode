<template>
  <div class="col-12">
    <div class="block bg-faded">
      <h2>System Info</h2>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>VS Code</td>
            <td>{{ vscodeInfo.vscode }}</td>
          </tr>
          <tr>
            <td>OS</td>
            <td>{{ vscodeInfo.os }}</td>
          </tr>
          <tr>
            <td>CPU</td>
            <td>{{ vscodeInfo.cpu }}</td>
          </tr>
          <tr>
            <td>Memory (System)</td>
            <td>{{ vscodeInfo.sysMemory }}</td>
          </tr>
          <tr>
            <td>Memory (Process)</td>
            <td>{{ vscodeInfo.procMemory }}</td>
          </tr>
          <tr>
            <td>Average Load</td>
            <td>{{ vscodeInfo.avgLoad }}</td>
          </tr>
          <tr>
            <td>VM</td>
            <td>{{ vscodeInfo.vm }}</td>
          </tr>
          <tr>
            <td>Initial Startup</td>
            <td>{{ vscodeInfo.startup }}</td>
          </tr>
          <tr>
            <td>Screen Reader</td>
            <td>{{ vscodeInfo.screenReader }}</td>
          </tr>
          <tr>
            <td>Empty Workspace</td>
            <td>{{ vscodeInfo.emptyWorkspace }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="block bg-faded">
      <h2>Workspace Info</h2>
      <pre>
        <code>{{ info }}</code>
      </pre>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      vscodeInfo: {},
      info: ''
    }
  },
  mounted () {
    window.addEventListener('message', ({ data: { vscodeInfo, info } }) => {
      this.vscodeInfo = vscodeInfo
      this.info = info
      this.$store.commit('updateVSCodeInfo', vscodeInfo)
      this.$store.commit('updateInfo', info)
    })
  }
}
</script>

<style lang="scss" scoped>
pre {
  font-size: 12px;
}
</style>
