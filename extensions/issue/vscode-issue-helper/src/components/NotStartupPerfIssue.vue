<template>
  <div class="message">
    <input-textarea
        :title="'Steps to Reproduce'"
        v-model="reproSteps"
        required
        subtitle="yes">
        <i18n slot="subtitle" id="steps-subtitle"/>
      </input-textarea><div class="submit">
      <button class="btn btn-primary" @click="submitToGithub">Create GitHub Issue</button>
    </div>
    Please provide a profile following
    <a href="https://github.com/Microsoft/vscode/wiki/Performance-Issues#profile-a-vs-code-window">this instruction</a>.
  </div>
</template>

<script>
export default {
  data () {
    return {
      reproSteps: ''
    }
  },
  methods: {
    submitToGithub () {
      const baseURL = 'https://github.com/microsoft/vscode/issues/new?body='
      const props = {
        'VS Code': this.$route.query.vscode,
        OS: this.$route.query.os,
        CPU: this.$route.query.cpu,
        'Memory (System)': this.$route.query.sysMemory,
        'Memory (Process)': this.$route.query.procMemory,
        'Average Load': this.$route.query.avgLoad,
        VM: this.$route.query.vm,
        'Initial Startup': this.$route.query.startup,
        'Screen Reader': this.$route.query.screenReader,
        'Empty Workspace': this.$route.query.emptyWorkspace
      }

      let body = `\
|Property|Value|
|---|---|
`

      Object.keys(props).forEach(k => {
        const val = props[k]
        body += `|${k}|${val}|\n`
      })

      body += "\n\n---\n\n## Profile\n"
      body += "Please attach the profile according to [these instructions](https://github.com/Microsoft/vscode/wiki/Performance-Issues#profile-a-vs-code-window)."
      body += `\n\n## Repro Steps\n\n${this.reproSteps}`

      window.open(baseURL + encodeURIComponent(body), '_blank')
    }
  }
}
</script>

<style scoped>
.submit {
  text-align: center;
  padding-bottom: 1.2rem;
}
</style>

