<template>
  <div class="col-12">
    <div class="block bg-faded">
      <h2>Startup Performance Issue?</h2>
      <p>Is this a startup performance issue?</p>
      <button type="button" class="btn" @click="setStartupPerfIssue(true)" 
        :class="{ 
          'btn-outline-success': !isStartupPerfIssue,
          'btn-success': isStartupPerfIssue
        }">Yes</button>
      <button type="button" class="btn" @click="setStartupPerfIssue(false)"
        :class="{ 
          'btn-outline-danger': isStartupPerfIssue,
          'btn-danger': !isStartupPerfIssue
        }">No</button>

      <div class="message" v-if="isStartupPerfIssue">
        <div class="submit">
          <button class="btn btn-primary" @click="submitStartupIssueToGithub">Create GitHub Issue</button>
        </div>
        Please provide a startup profile following
        <a href="https://github.com/Microsoft/vscode/wiki/Performance-Issues#profile-startup">this instruction</a>.
      </div>
      <div class="message" v-else>
        <input-textarea
            :title="'Steps to Reproduce'"
            v-model="reproSteps"
            required
            subtitle="yes">
            <i18n slot="subtitle" id="steps-subtitle"/>
          </input-textarea><div class="submit">
          <button class="btn btn-primary" @click="submitNonStartupIssueToGithub">Create GitHub Issue</button>
        </div>
        Please provide a profile following
        <a href="https://github.com/Microsoft/vscode/wiki/Performance-Issues#profile-a-vs-code-window">this instruction</a>.
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'isStartupPerfIssue',
      'vscodeInfo'
    ])
  },
  methods: {
    setStartupPerfIssue (val) {
      this.$store.commit('setStartupPerfIssue', val)
    },
    submitStartupIssueToGithub () {
      const baseURL = 'https://github.com/microsoft/vscode/issues/new?body='

      const props = {
        'VS Code': this.vscodeInfo.vscode,
        OS: this.vscodeInfo.os,
        CPU: this.vscodeInfo.cpu,
        'Memory (System)': this.vscodeInfo.sysMemory,
        'Memory (Process)': this.vscodeInfo.procMemory,
        'Average Load': this.vscodeInfo.avgLoad,
        VM: this.vscodeInfo.vm,
        'Initial Startup': this.vscodeInfo.startup,
        'Screen Reader': this.vscodeInfo.screenReader,
        'Empty Workspace': this.vscodeInfo.emptyWorkspace
      }

      let body = `\
|Property|Value|
|---|---|
`

      Object.keys(props).forEach(k => {
        const val = props[k]
        body += `|${k}|${val}|\n`
      })

      body += "\n\n---\n\n## Startup Profile\n"
      body += "Please attach the startup profile according to [these instructions](https://github.com/Microsoft/vscode/wiki/Performance-Issues#profile-startup)."

      window.open(baseURL + encodeURIComponent(body), '_blank')
    },
    submitNonStartupIssueToGithub () {
      // const baseURL = 'https://github.com/microsoft/vscode/issues/new?body='
      const props = {
        'VS Code': this.vscodeInfo.vscode,
        OS: this.vscodeInfo.os,
        CPU: this.vscodeInfo.cpu,
        'Memory (System)': this.vscodeInfo.sysMemory,
        'Memory (Process)': this.vscodeInfo.procMemory,
        'Average Load': this.vscodeInfo.avgLoad,
        VM: this.vscodeInfo.vm,
        'Initial Startup': this.vscodeInfo.startup,
        'Screen Reader': this.vscodeInfo.screenReader,
        'Empty Workspace': this.vscodeInfo.emptyWorkspace
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

      const arr = [body]

      // window.open(baseURL + encodeURIComponent(body), '_blank')
      window.parent.postMessage({
        command: 'did-click-link',
        data: `command:extension.openWindow?${encodeURIComponent(JSON.stringify(arr))}`
      }, 'file://')
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

