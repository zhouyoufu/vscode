<template>
  <div class="app" style="padding-top: 54px">
    <app-header :lang="$lang" @change-lang="setLang" />

    <div class="container py-3">
      <form class="row" @submit.prevent="generate">
        <div class="col-12 col-lg-8 offset-lg-2">
          <intro/>
          <system-info/>
          <perf-report/>
        </div>
      </form>

      <modal :open="show" @close="show = false">
        <div class="card">
          <div class="card-header d-flex align-items-center">
            <h5 class="mb-0">{{ i18n('preview-title') }}</h5>
            <input-button class="btn btn-primary ml-auto" type="submit" @click.native.prevent="create">
              {{ i18n('create') }}
            </input-button>
          </div>
          <div class="card-block preview" style="overflow: auto" v-html="generated.html">
          </div>
        </div>
      </modal>
    </div>

    <footer class="text-center text-muted mb-3">
      <small>
        Built with
        <a href="https://github.com/vuejs/vue-cli">vue-cli</a>
        &centerdot; Check out source on
        <a href="https://github.com/vuejs/vue-issue">GitHub</a>
      </small>
    </footer>
  </div>
</template>

<script lang="babel">
import { repos } from '../config'
import { formHelper } from 'bootstrap-for-vue'
import { getQuery, updateQuery } from '../helpers'

import Intro from './Intro.vue'
import AppHeader from './Header.vue'
import BugReport from './BugReport.vue'
import FeatureRequest from './FeatureRequest.vue'
import search from '../mixins/github-search'
import SystemInfo from './SystemInfo.vue'
import PerfReport from './PerfReport.vue'

export default {
  name: 'App',

  mixins: [formHelper, search],

  components: {
    Intro,
    AppHeader,
    BugReport,
    FeatureRequest,
    SystemInfo,
    PerfReport
  },

  data: () => ({
    title: '',
    generated: {
      markdown: '',
      html: ''
    },
    show: false,
    preview: false,
    repo: '',
    repos,
    type: 'bug-report',
    versions: {}
  }),

  methods: {
    setLang (lang) {
      this.$lang = lang
      updateQuery({ lang })
    },

    findIssues () {
      this.issues = []
      if (this.title) {
        this.fetchIssues(this.title, { is: 'issue', repo: this.repo })
      }
    },

    generate () {
      this.generated = this.$refs.content.generate()
      this.show = true
    },

    create () {
      const title = encodeURIComponent(this.title).replace(/%2B/gi, '+')
      const body = encodeURIComponent(this.generated.markdown).replace(/%2B/gi, '+')
      const label = this.type === 'feature-request' ? '&labels=feature%20request' : ''
      window.open(`https://github.com/${this.repo}/issues/new?title=${title}&body=${body}${label}`)
    },
  },

  computed: {
    types () {
      return this.$lang && [
        { id: 'bug-report', name: this.i18n('bug-report') },
        { id: 'feature-request', name: this.i18n('feature-request') }
      ]
    }
  },

  created () {
    this.repo = getQuery().repo || 'vuejs/vue'
  },
}
</script>

<style lang="scss">
$brand-primary: #4fc08d;
$form-group-required-color: white;

@import './node_modules/bootstrap/scss/variables';
@import './node_modules/bootstrap/scss/bootstrap';
@import './node_modules/bootstrap-for-vue/dist/scss/bootstrap-for-vue';

.preview {
  font-size: 0.9rem;
  h1,
  h2,
  h3 {
    font-size: 18px !important;
  }
  pre {
    padding: 15px 20px;
    background-color: #f3f3f3;
    border-radius: 4px;
  }
}

.app {
  input,
  textarea {
    font-size: 0.9rem;
  }
  input.bootstrap-for-vue-Search-input-search-suggestion {
    margin-top: 0.1rem;
    // input:font-size + shadow:margin-top = 1rem.
    // It is required only when input has < 1rem font-size.
  }
}

@include media-breakpoint-down(md) {
  .navbar {
    padding-left: 0;
    padding-right: 0;

    > .container {
      width: 100%;
    }
  }
}

.similar-issues {
  .issue {
    color: inherit;
  }
}

.block {
  padding: 1.5em 2em;
}

.message {
  margin: 2rem 1rem;
  padding: 2rem 1.5rem;
  border: 2px solid #333;
}

footer {
  margin-top: 5rem;
}
</style>
